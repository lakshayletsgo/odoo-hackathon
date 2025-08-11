import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const chatbotSchema = z.object({
  message: z.string().min(1, "Message is required"),
  context: z
    .object({
      location: z.string().optional(),
      sport: z.string().optional(),
      date: z.string().optional(),
      timePreference: z.string().optional(),
      priceRange: z
        .object({
          min: z.number().optional(),
          max: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, context } = chatbotSchema.parse(body);

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Extract booking intent and parameters from user message
    const intentPrompt = `
You are a sports venue booking assistant. Analyze the user's message and extract booking-related information.

User message: "${message}"

Extract the following information if present:
1. Sport type (tennis, football, basketball, cricket, badminton, volleyball, swimming, pickleball, table tennis)
2. Location/city preference
3. Date preference (today, tomorrow, specific date, this weekend, etc.)
4. Time preference (morning, afternoon, evening, specific time)
5. Duration preference
6. Price range preference
7. Group size/number of players

Respond with a JSON object containing:
{
  "intent": "booking_search" | "general_inquiry" | "help",
  "sport": "sport_name" or null,
  "location": "city_name" or null,
  "datePreference": "parsed_date_info" or null,
  "timePreference": "time_info" or null,
  "priceRange": {"min": number, "max": number} or null,
  "groupSize": number or null,
  "extractedQuery": "natural language summary of what user wants"
}

Only respond with valid JSON, no other text.
`;

    const intentResult = await model.generateContent(intentPrompt);
    const intentResponse = intentResult.response;
    let extractedIntent;

    try {
      extractedIntent = JSON.parse(intentResponse.text());
    } catch (error) {
      // Fallback if JSON parsing fails
      extractedIntent = {
        intent: "general_inquiry",
        extractedQuery: message,
      };
    }

    // If it's a booking search, find relevant venues and courts
    if (extractedIntent.intent === "booking_search") {
      const venues = await searchVenuesForBooking(extractedIntent);
      const responseText = await generateBookingResponse(
        model,
        extractedIntent,
        venues,
        message
      );

      return NextResponse.json({
        message: responseText,
        intent: extractedIntent.intent,
        venues: venues.slice(0, 5), // Limit to top 5 results
        extractedInfo: extractedIntent,
      });
    } else {
      // Handle general inquiries
      const responsePrompt = `
You are a helpful sports venue booking assistant. The user said: "${message}"

Provide a helpful response about sports venue booking. Keep it conversational and under 150 words.
If they're asking about how to book, sports available, or general questions, provide relevant information.

Available sports: Tennis, Football, Basketball, Cricket, Badminton, Volleyball, Swimming, Pickleball, Table Tennis.

Be friendly and encourage them to search for specific venues or ask about booking requirements.
`;

      const generalResult = await model.generateContent(responsePrompt);
      const generalResponse = generalResult.response;

      return NextResponse.json({
        message: generalResponse.text(),
        intent: extractedIntent.intent,
        venues: [],
        extractedInfo: extractedIntent,
      });
    }
  } catch (error) {
    console.error("Chatbot error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function searchVenuesForBooking(extractedIntent: any) {
  const whereClause: any = {
    isApproved: true,
    isActive: true,
  };

  // Add location filter
  if (extractedIntent.location) {
    whereClause.OR = [
      { city: { contains: extractedIntent.location, mode: "insensitive" } },
      { address: { contains: extractedIntent.location, mode: "insensitive" } },
      { name: { contains: extractedIntent.location, mode: "insensitive" } },
    ];
  }

  // Add sport filter
  if (extractedIntent.sport) {
    whereClause.courts = {
      some: {
        sport: { contains: extractedIntent.sport, mode: "insensitive" },
        isActive: true,
      },
    };
  }

  const venues = await prisma.venue.findMany({
    where: whereClause,
    include: {
      courts: {
        where: {
          isActive: true,
          ...(extractedIntent.sport && {
            sport: { contains: extractedIntent.sport, mode: "insensitive" },
          }),
        },
        select: {
          id: true,
          name: true,
          sport: true,
          pricePerHour: true,
          description: true,
        },
      },
      owner: {
        select: {
          name: true,
          isVerified: true,
        },
      },
    },
    take: 10,
    orderBy: {
      rating: "desc",
    },
  });

  // Filter by price range if specified
  if (extractedIntent.priceRange) {
    return venues.filter((venue) =>
      venue.courts.some(
        (court) =>
          court.pricePerHour >= (extractedIntent.priceRange.min || 0) &&
          court.pricePerHour <= (extractedIntent.priceRange.max || 10000)
      )
    );
  }

  return venues;
}

async function generateBookingResponse(
  model: any,
  extractedIntent: any,
  venues: any[],
  originalMessage: string
) {
  const responsePrompt = `
User asked: "${originalMessage}"

I found ${venues.length} venues that match their criteria:

${venues
  .map(
    (venue, index) => `
${index + 1}. ${venue.name} in ${venue.city}
   - Courts: ${venue.courts
     .map((c: any) => `${c.name} (${c.sport}) - ₹${c.pricePerHour}/hr`)
     .join(", ")}
   - Rating: ${venue.rating}/5
   - Address: ${venue.address}
`
  )
  .join("\n")}

Generate a helpful response that:
1. Acknowledges what they're looking for
2. Summarizes the search results briefly
3. Highlights the best options (top 2-3 venues)
4. Mentions key details like sports available, price ranges, and locations
5. Encourages them to click on venues to book or get more details
6. Keep it conversational and under 200 words

Format the response in a friendly, helpful tone as a booking assistant.
`;

  try {
    const result = await model.generateContent(responsePrompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    return `I found ${venues.length} venues that match your search! ${
      venues.length > 0
        ? `The top results include ${venues
            .slice(0, 2)
            .map((v) => v.name)
            .join(
              " and "
            )} with various courts available. Click on any venue to see more details and book your slot!`
        : "Try adjusting your search criteria or location to find more options."
    }`;
  }
}

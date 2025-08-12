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
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
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
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Extract booking intent and parameters from user message
    const intentPrompt = `
Analyze this message and extract booking info: "${message}"

Extract if present:
- Sport: Tennis, Cricket, Football, Basketball, Volleyball, Badminton, Swimming, Pickleball, Table Tennis
- Location/city
- Date: today, tomorrow, weekend, specific dates
- Time: morning, afternoon, evening, specific times
- Price range

Respond only with JSON:
{
  "intent": "booking_search" | "general_inquiry",
  "sport": "sport_name" or null,
  "location": "city_name" or null,
  "datePreference": "date_info" or null,
  "timePreference": "time_info" or null,
  "priceRange": {"min": number, "max": number} or null,
  "extractedQuery": "what user wants",
  "confidence": 0.8
}
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
      // Handle general inquiries with data context
      const venueStats = await getVenueStats();
      const responsePrompt = `
User said: "${message}"

Our platform data:
- ${venueStats.totalVenues} venues available
- Sports: ${venueStats.availableSports.join(", ")}
- Cities: ${venueStats.cities.join(", ")}
- Price range: ₹${venueStats.priceRange.min}-${venueStats.priceRange.max}/hour

Give a SHORT factual answer (max 25 words). Use the exact data above. No questions or recommendations.
`;

      const generalResult = await model.generateContent(responsePrompt);
      const generalResponse = generalResult.response;

      return NextResponse.json({
        message: generalResponse.text(),
        intent: extractedIntent.intent,
        venues: [],
        extractedInfo: extractedIntent,
        stats: venueStats,
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
          operatingHours: true,
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
  let filteredVenues = venues;
  if (extractedIntent.priceRange) {
    filteredVenues = venues.filter((venue) =>
      venue.courts.some(
        (court) =>
          court.pricePerHour >= (extractedIntent.priceRange.min || 0) &&
          court.pricePerHour <= (extractedIntent.priceRange.max || 10000)
      )
    );
  }

  // Check availability for each venue if date preference is specified
  const venuesWithAvailability = await Promise.all(
    filteredVenues.map(async (venue) => {
      const courtsWithAvailability = await Promise.all(
        venue.courts.map(async (court) => {
          const availableSlots = await checkCourtAvailability(
            court.id,
            extractedIntent.datePreference,
            extractedIntent.timePreference
          );
          return {
            ...court,
            availableSlots: availableSlots.slice(0, 5), // Limit to 5 slots per court
          };
        })
      );

      return {
        ...venue,
        courts: courtsWithAvailability.filter(
          (court) => court.availableSlots.length > 0
        ),
      };
    })
  );

  // Only return venues that have available slots
  return venuesWithAvailability.filter((venue) => venue.courts.length > 0);
}

async function checkCourtAvailability(
  courtId: string,
  datePreference?: string,
  timePreference?: string
) {
  const today = new Date();
  let targetDate = today;

  // Parse date preference
  if (datePreference) {
    const lower = datePreference.toLowerCase();
    if (lower.includes("today")) {
      targetDate = today;
    } else if (lower.includes("tomorrow")) {
      targetDate = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    } else if (lower.includes("weekend")) {
      // Next Saturday
      const daysUntilSaturday = (6 - today.getDay()) % 7 || 7;
      targetDate = new Date(
        today.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000
      );
    }
  }

  // Generate time slots for the target date
  const timeSlots = [];
  const startHour = 6; // 6 AM
  const endHour = 22; // 10 PM

  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

    // Check if slot is available
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId,
        date: targetDate,
        startTime,
        status: "CONFIRMED",
      },
    });

    const blockedSlot = await prisma.blockedSlot.findFirst({
      where: {
        courtId,
        date: targetDate,
        startTime,
      },
    });

    if (!existingBooking && !blockedSlot) {
      // Filter by time preference if specified
      if (
        !timePreference ||
        (timePreference.toLowerCase().includes("morning") && hour < 12) ||
        (timePreference.toLowerCase().includes("afternoon") &&
          hour >= 12 &&
          hour < 18) ||
        (timePreference.toLowerCase().includes("evening") && hour >= 18)
      ) {
        timeSlots.push({
          startTime,
          endTime,
          date: targetDate.toISOString().split("T")[0],
        });
      }
    }
  }

  return timeSlots;
}

async function generateBookingResponse(
  model: any,
  extractedIntent: any,
  venues: any[],
  originalMessage: string
) {
  const responsePrompt = `
User asked: "${originalMessage}"

Found ${venues.length} venues that match.

Generate a SHORT response (max 30 words):
1. State how many venues found
2. Mention top venue name if any
3. No questions or recommendations

Keep it factual and direct.
`;

  try {
    const result = await model.generateContent(responsePrompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    return `Found ${venues.length} venues${
      venues.length > 0 ? `. Top option: ${venues[0].name}` : ""
    }.`;
  }
}

async function getVenueStats() {
  try {
    const [totalVenues, venues, sportsData] = await Promise.all([
      prisma.venue.count({
        where: {
          isApproved: true,
          isActive: true,
        },
      }),
      prisma.venue.findMany({
        where: {
          isApproved: true,
          isActive: true,
        },
        select: {
          city: true,
          courts: {
            select: {
              sport: true,
              pricePerHour: true,
            },
          },
        },
      }),
      prisma.court.findMany({
        where: {
          isActive: true,
          venue: {
            isApproved: true,
            isActive: true,
          },
        },
        select: {
          sport: true,
          pricePerHour: true,
        },
      }),
    ]);

    const cities = [...new Set(venues.map((v) => v.city))];
    const sports = [...new Set(sportsData.map((c) => c.sport))];
    const prices = sportsData.map((c) => c.pricePerHour);

    return {
      totalVenues,
      cities,
      availableSports: sports,
      priceRange: {
        min: Math.min(...prices) || 0,
        max: Math.max(...prices) || 1000,
      },
    };
  } catch (error) {
    console.error("Error fetching venue stats:", error);
    return {
      totalVenues: 0,
      cities: [],
      availableSports: [],
      priceRange: { min: 0, max: 1000 },
    };
  }
}

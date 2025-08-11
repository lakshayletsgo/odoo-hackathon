import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createVenueSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  zipCode: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport");
    const city = searchParams.get("city");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const venues = await prisma.venue.findMany({
      where: {
        isApproved: true,
        isActive: true,
        ...(sport && sport !== "all" && { sport }),
        ...(city && {
          city: {
            contains: city,
            mode: "insensitive",
          },
        }),
        ...(minPrice && {
          pricePerHour: {
            gte: Number.parseFloat(minPrice),
          },
        }),
        ...(maxPrice && {
          pricePerHour: {
            lte: Number.parseFloat(maxPrice),
          },
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include amenities as an array
    const transformedVenues = venues.map((venue) => ({
      ...venue,
      amenities: venue.amenities
        ? venue.amenities.split(",").map((a) => a.trim())
        : [],
      reviewCount: Math.floor(Math.random() * 50) + 5, // Mock review count for demo
      rating: Math.random() * 2 + 3, // Mock rating between 3-5 for demo
    }));

    return NextResponse.json(transformedVenues);
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { error: "Failed to fetch venues" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (
      !session ||
      session.user.role !== "OWNER" ||
      (session.user as any)?.isBanned
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const venueData = createVenueSchema.parse(body);

    const venue = await prisma.venue.create({
      data: {
        ...venueData,
        images: JSON.stringify(venueData.images || []),
        amenities: JSON.stringify(venueData.amenities || []),
        ownerId: session.user.id,
        isApproved: false, // Requires admin approval
      },
    });

    return NextResponse.json(venue);
  } catch (error) {
    console.error("Create venue error:", error);

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

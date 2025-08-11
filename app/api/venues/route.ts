import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
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
        isApproved: true, // Only show approved venues (all venues are now auto-approved)
        isActive: true, // Only show active venues
        ...(sport &&
          sport !== "all" && {
            courts: {
              some: {
                sport: sport,
              },
            },
          }),
        ...(city && { city: { contains: city, mode: "insensitive" } }),
      },
      include: {
        courts: true,
        owner: {
          select: {
            name: true,
            isVerified: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include amenities as an array and calculate pricing
    const transformedVenues = venues.map((venue: any) => ({
      ...venue,
      amenities: venue.amenities
        ? venue.amenities
            .split(",")
            .map((a: string) => a.trim())
            .filter(Boolean)
        : [],
      images: venue.images
        ? venue.images
            .split(",")
            .map((img: string) => img.trim())
            .filter(Boolean)
        : [],
      reviewCount: venue.totalRating || 0,
      rating: venue.rating || 0,
      pricePerHour:
        venue.courts.length > 0
          ? Math.min(...venue.courts.map((c: any) => c.pricePerHour))
          : 0,
      sport: venue.courts.length > 0 ? venue.courts[0].sport : "Various",
      capacity: venue.courts.length > 0 ? venue.courts.length * 4 : 0,
      isAvailable: venue.courts.some((c: any) => c.isActive),
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
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Check if user is verified owner
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || user.role !== "OWNER" || !user.isVerified) {
      return NextResponse.json(
        { error: "Only verified owners can create venues" },
        { status: 403 }
      );
    }

    const { courts, amenities, images, ...venueData } = body;

    // Create venue with courts - auto-approved for direct publishing
    const venue = await prisma.venue.create({
      data: {
        ...venueData,
        amenities: amenities?.join(", ") || "",
        images: images?.join(", ") || "",
        ownerId: session.user.id,
        isApproved: true, // Auto-approve venues for direct publishing
        courts: {
          create:
            courts?.map((court: any) => ({
              name: court.name,
              sport: court.sport,
              description: court.description || "",
              pricePerHour: court.pricePerHour,
              slotDuration: 60, // Default 1 hour slots
              operatingHours: "9:00-22:00", // Default operating hours
              isActive: true,
            })) || [],
        },
      },
      include: {
        courts: true,
      },
    });

    return NextResponse.json(venue);
  } catch (error) {
    console.error("Error creating venue:", error);
    return NextResponse.json(
      { error: "Failed to create venue" },
      { status: 500 }
    );
  }
}

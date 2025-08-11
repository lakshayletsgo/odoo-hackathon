import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, isVerified: true },
        },
        courts: {
          where: { isActive: true },
          include: {
            availability: true,
          },
        },
      },
    });

    if (!venue || !venue.isActive || !venue.isApproved || !venue.owner.isVerified) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const images: string[] = (() => {
      try {
        if (!venue.images) return [];
        
        // Check if it's already a JSON array or a single URL string
        if (venue.images.startsWith('[')) {
          // It's a JSON array
          return JSON.parse(venue.images) as string[];
        } else if (venue.images.startsWith('http')) {
          // It's a single URL string
          return [venue.images];
        } else {
          // Try to parse as JSON, fallback to treating as single string
          try {
            return JSON.parse(venue.images) as string[];
          } catch {
            return [venue.images];
          }
        }
      } catch (error) {
        console.error("Error parsing images in API:", error, "Raw value:", venue.images);
        return [];
      }
    })();

    const amenities: string[] = (() => {
      try {
        if (!venue.amenities) return [];
        
        // Check if it's already a JSON array or a comma-separated string
        if (venue.amenities.startsWith('[')) {
          // It's a JSON array
          return JSON.parse(venue.amenities) as string[];
        } else {
          // It's likely a comma-separated string
          return venue.amenities.split(',').map(a => a.trim()).filter(Boolean);
        }
      } catch (error) {
        console.error("Error parsing amenities in API:", error, "Raw value:", venue.amenities);
        return [];
      }
    })();

    return NextResponse.json({ ...venue, images, amenities });
  } catch (error) {
    console.error("Get venue by id error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user owns this venue
    const existingVenue = await prisma.venue.findUnique({
      where: { id },
      select: { ownerId: true },
    });

    if (!existingVenue || existingVenue.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 404 });
    }

    const body = await request.json();
    const { courts, amenities, images, ...venueData } = body;

    // Update venue with courts
    const venue = await prisma.venue.update({
      where: { id },
      data: {
        ...venueData,
        amenities: amenities?.join(", ") || "",
        images: images?.join(", ") || "",
        updatedAt: new Date(),
        courts: {
          deleteMany: {}, // Remove existing courts
          create: courts?.map((court: any) => ({
            name: court.name,
            sport: court.sport,
            description: court.description || "",
            pricePerHour: court.pricePerHour,
            capacity: court.capacity || 1,
            slotDuration: 60,
            operatingHours: "9:00-22:00",
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
    console.error("Update venue error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

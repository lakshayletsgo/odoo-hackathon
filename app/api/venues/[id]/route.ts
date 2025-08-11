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

    if (!venue || !venue.isActive || !venue.owner.isVerified) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const images: string[] = (() => {
      try {
        return venue.images ? (JSON.parse(venue.images) as string[]) : [];
      } catch {
        return [];
      }
    })();

    const amenities: string[] = (() => {
      try {
        return venue.amenities ? (JSON.parse(venue.amenities) as string[]) : [];
      } catch {
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

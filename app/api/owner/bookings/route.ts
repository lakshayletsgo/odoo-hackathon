import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a venue owner
    if ((session.user as any)?.role !== "OWNER") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all venues owned by this user
    const venues = await prisma.venue.findMany({
      where: { ownerId: session.user.id },
      include: {
        courts: {
          include: {
            bookings: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
                court: {
                  include: {
                    venue: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    // Flatten bookings from all venues and courts
    const allBookings = venues.flatMap((venue) =>
      venue.courts.flatMap((court) => court.bookings)
    );

    // Separate pending and recent bookings
    const pendingBookings = allBookings.filter(
      (booking) => booking.status === "PENDING"
    );
    const recentBookings = allBookings
      .filter((booking) => booking.status !== "PENDING")
      .slice(0, 10);

    return NextResponse.json({
      pending: pendingBookings,
      recent: recentBookings,
    });
  } catch (error) {
    console.error("Get owner bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

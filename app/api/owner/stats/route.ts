import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "OWNER" || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get owner's venues
    const venues = await prisma.venue.findMany({
      where: { ownerId: session.user.id },
      include: {
        courts: {
          include: {
            bookings: {
              where: {
                status: {
                  not: "CANCELLED",
                },
              },
            },
          },
        },
      },
    })

    // Calculate stats
    const totalBookings = venues.reduce(
      (total: number, venue: any) =>
        total +
        venue.courts.reduce(
          (courtTotal: number, court: any) => courtTotal + court.bookings.length,
          0,
        ),
      0,
    )

    const totalRevenue = venues.reduce(
      (total: number, venue: any) =>
        total +
        venue.courts.reduce(
          (courtTotal: number, court: any) =>
            courtTotal +
            court.bookings.reduce(
              (bookingTotal: number, booking: any) => bookingTotal + booking.totalAmount,
              0,
            ),
          0,
        ),
      0,
    )

    const activeVenues = venues.filter((venue: any) => venue.isActive).length
    const activeCourts = venues.reduce(
      (total: number, venue: any) => total + venue.courts.filter((court: any) => court.isActive).length,
      0,
    )

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      activeVenues,
      activeCourts,
    })
  } catch (error) {
    console.error("Owner stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

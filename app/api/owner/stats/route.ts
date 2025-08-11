import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "OWNER") {
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
      (total, venue) => total + venue.courts.reduce((courtTotal, court) => courtTotal + court.bookings.length, 0),
      0,
    )

    const totalRevenue = venues.reduce(
      (total, venue) =>
        total +
        venue.courts.reduce(
          (courtTotal, court) =>
            courtTotal + court.bookings.reduce((bookingTotal, booking) => bookingTotal + booking.totalAmount, 0),
          0,
        ),
      0,
    )

    const activeVenues = venues.filter((venue) => venue.isActive).length
    const activeCourts = venues.reduce(
      (total, venue) => total + venue.courts.filter((court) => court.isActive).length,
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

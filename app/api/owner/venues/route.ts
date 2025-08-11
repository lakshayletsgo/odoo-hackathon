import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()

    if (!session || session.user.role !== "OWNER" || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get owner's venues with courts and booking stats
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
        _count: {
          select: {
            courts: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Transform venues data with parsed images/amenities and calculated stats
    const transformedVenues = venues.map((venue: any) => {
      const images: string[] = (() => {
        try {
          return venue.images ? (JSON.parse(venue.images) as string[]) : []
        } catch {
          return []
        }
      })()

      const amenities: string[] = (() => {
        try {
          return venue.amenities ? (JSON.parse(venue.amenities) as string[]) : []
        } catch {
          return []
        }
      })()

      // Calculate total bookings and revenue for this venue
      const totalBookings = venue.courts.reduce(
        (total: number, court: any) => total + court.bookings.length,
        0
      )

      const totalRevenue = venue.courts.reduce(
        (total: number, court: any) =>
          total +
          court.bookings.reduce(
            (bookingTotal: number, booking: any) => bookingTotal + booking.totalAmount,
            0
          ),
        0
      )

      return {
        ...venue,
        images,
        amenities,
        totalBookings,
        totalRevenue,
        activeCourts: venue.courts.filter((court: any) => court.isActive).length,
      }
    })

    return NextResponse.json(transformedVenues)
  } catch (error) {
    console.error("Owner venues error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

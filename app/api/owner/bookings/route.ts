import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    // Get bookings for owner's courts
    const bookings = await prisma.booking.findMany({
      where: {
        court: {
          venue: {
            ownerId: session.user.id,
          },
        },
      },
      include: {
        court: {
          include: {
            venue: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Owner bookings error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

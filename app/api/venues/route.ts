import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { z } from "zod"

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
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get("city")
    const sport = searchParams.get("sport")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")

    const venues = await prisma.venue.findMany({
      where: {
        isApproved: true,
        isActive: true,
        ...(city && {
          city: {
            contains: city,
            mode: "insensitive",
          },
        }),
      },
      include: {
        courts: {
          where: {
            isActive: true,
            ...(sport &&
              sport !== "All Sports" && {
                sport: sport.toUpperCase(),
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
        },
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Filter out venues with no matching courts
    const filteredVenues = venues.filter((venue: any) => venue.courts.length > 0)

    return NextResponse.json(filteredVenues)
  } catch (error) {
    console.error("Get venues error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "OWNER" || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const venueData = createVenueSchema.parse(body)

    const venue = await prisma.venue.create({
      data: {
        ...venueData,
        images: JSON.stringify(venueData.images || []),
        amenities: JSON.stringify(venueData.amenities || []),
        ownerId: session.user.id,
        isApproved: false, // Requires admin approval
      },
    })

    return NextResponse.json(venue)
  } catch (error) {
    console.error("Create venue error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

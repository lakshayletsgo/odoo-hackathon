import { auth } from "@/lib/auth";
import { sendBookingConfirmation } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createBookingSchema = z.object({
  courtId: z.string(),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  totalAmount: z.number(),
  depositAmount: z.number().optional(),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Number.parseInt(searchParams.get("limit") || "50");

    let whereClause: any = {
      userId: session.user.id,
    };

    // Handle special status filters
    if (status === "upcoming") {
      whereClause = {
        ...whereClause,
        status: "CONFIRMED",
        date: {
          gte: new Date(),
        },
      };
    } else if (status && status !== "upcoming") {
      whereClause = {
        ...whereClause,
        status: status.toUpperCase(),
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        court: {
          include: {
            venue: true,
          },
        },
      },
      orderBy: {
        date: status === "upcoming" ? "asc" : "desc",
      },
      take: limit,
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const bookingData = createBookingSchema.parse(body);

    // Check for conflicts with confirmed bookings
    const existingBooking = await prisma.booking.findFirst({
      where: {
        courtId: bookingData.courtId,
        date: new Date(bookingData.date),
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        status: "CONFIRMED", // Only check confirmed bookings
      },
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: "Time slot is already booked" },
        { status: 400 }
      );
    }

    // Check for blocked slots
    const blockedSlot = await prisma.blockedSlot.findFirst({
      where: {
        courtId: bookingData.courtId,
        date: new Date(bookingData.date),
        startTime: bookingData.startTime,
      },
    });

    if (blockedSlot) {
      return NextResponse.json(
        { error: "Time slot is not available" },
        { status: 400 }
      );
    }

    // Validate that the court exists
    const court = await prisma.court.findUnique({
      where: { id: bookingData.courtId },
      include: {
        venue: {
          include: {
            owner: true,
          },
        },
      },
    });

    if (!court) {
      return NextResponse.json({ error: "Court not found" }, { status: 404 });
    }

    if (!court.isActive || !court.venue.isActive) {
      return NextResponse.json(
        { error: "Court or venue is not available" },
        { status: 400 }
      );
    }

    // Check if venue owner is verified instead of venue approval
    if (!court.venue.owner.isVerified) {
      return NextResponse.json(
        { error: "Venue owner is not verified" },
        { status: 400 }
      );
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        ...bookingData,
        date: new Date(bookingData.date),
        userId: session.user.id,
        status: "PENDING",
        paymentStatus: "PENDING",
      },
      include: {
        court: {
          include: {
            venue: true,
          },
        },
        user: true,
      },
    });

    // Send confirmation email
    await sendBookingConfirmation(session.user.email!, booking);

    // TODO: Emit socket event for real-time updates
    // io.to(`owner-${booking.court.venue.ownerId}`).emit('booking:new', booking)

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Create booking error:", error);

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

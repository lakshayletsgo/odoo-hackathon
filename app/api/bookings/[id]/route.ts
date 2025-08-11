import { auth } from "@/lib/auth";
import { sendBookingStatusUpdate } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    if (!["CONFIRMED", "CANCELLED"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get the booking with court and venue info
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        court: {
          include: {
            venue: true,
          },
        },
        user: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if the current user is the owner of the venue
    if (booking.court.venue.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Only allow updating pending bookings
    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Booking has already been processed" },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: action,
        updatedAt: new Date(),
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

    // If confirmed, create a blocked slot to prevent double booking
    if (action === "CONFIRMED") {
      await prisma.blockedSlot.create({
        data: {
          courtId: booking.courtId,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          reason: `Booking confirmed - ${booking.user.name}`,
        },
      });
    }

    // Send email notification to user about booking status change
    await sendBookingStatusUpdate(booking.user.email, updatedBooking);

    return NextResponse.json({
      message: `Booking ${action.toLowerCase()} successfully`,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

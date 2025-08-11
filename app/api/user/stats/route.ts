import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "USER" || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's bookings
    const bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        court: {
          include: {
            venue: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate user stats
    const totalSpent = bookings.reduce(
      (sum: number, booking: any) => sum + booking.totalAmount,
      0
    );
    const completedBookings = bookings.filter(
      (b: any) => b.status === "COMPLETED"
    ).length;
    const upcomingBookings = bookings.filter(
      (b: any) => b.status === "CONFIRMED" && new Date(b.date) >= new Date()
    ).length;

    return NextResponse.json({
      totalBookings: bookings.length,
      totalSpent,
      upcomingBookings,
      completedBookings,
      favoriteVenues: 0, // Will be implemented when favorites feature is added
      averageRating: 0, // Will be calculated from actual user ratings
    });
  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get global stats
    const [
      totalUsers,
      totalOwners,
      totalBookings,
      totalVenues,
      totalCourts,
      pendingVenues,
      monthlyBookings,
      monthlyRegistrations,
      recentBookings,
      topSports,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "OWNER" } }),
      prisma.booking.count(),
      prisma.venue.count({ where: { isActive: true } }),
      prisma.court.count({ where: { isActive: true } }),
      prisma.venue.count({ where: { isApproved: false } }),

      // Monthly bookings for chart
      prisma.booking.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
        select: {
          createdAt: true,
          totalAmount: true,
        },
      }),

      // Monthly user registrations
      prisma.user.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
        select: {
          createdAt: true,
          role: true,
        },
      }),

      // Recent bookings
      prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          court: {
            include: {
              venue: { select: { name: true } },
            },
          },
        },
      }),

      // Top sports by booking count
      prisma.booking
        .groupBy({
          by: ["courtId"],
          _count: {
            id: true,
          },
          orderBy: {
            _count: {
              id: "desc",
            },
          },
          take: 10,
        })
        .then(async (bookingStats) => {
          const courtIds = bookingStats.map((stat) => stat.courtId);
          const courts = await prisma.court.findMany({
            where: {
              id: {
                in: courtIds,
              },
            },
            select: {
              id: true,
              sport: true,
            },
          });

          const sportCounts: { [key: string]: number } = {};
          bookingStats.forEach((stat) => {
            const court = courts.find((c) => c.id === stat.courtId);
            if (court) {
              sportCounts[court.sport] =
                (sportCounts[court.sport] || 0) + stat._count.id;
            }
          });

          return Object.entries(sportCounts)
            .map(([sport, count]) => ({ sport, _count: { id: count } }))
            .sort((a, b) => b._count.id - a._count.id)
            .slice(0, 5);
        }),
    ]);

    // Calculate total revenue
    const totalRevenue = monthlyBookings.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    // Process chart data
    const bookingChartData = processTimeSeriesData(
      monthlyBookings,
      "createdAt"
    );
    const registrationChartData = processTimeSeriesData(
      monthlyRegistrations,
      "createdAt"
    );

    return NextResponse.json({
      totalUsers,
      totalOwners,
      totalBookings,
      totalVenues,
      totalCourts,
      pendingVenues,
      totalRevenue,
      recentBookings,
      chartData: {
        bookingActivity: bookingChartData,
        userRegistrations: registrationChartData,
        topSports: topSports.map((sport) => ({
          sport: sport.sport,
          bookings: sport._count.id,
        })),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function processTimeSeriesData(data: any[], dateField: string) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      date: date.toISOString().split("T")[0],
      count: 0,
      revenue: 0,
    };
  });

  data.forEach((item) => {
    const itemDate = new Date(item[dateField]).toISOString().split("T")[0];
    const dayData = days.find((day) => day.date === itemDate);
    if (dayData) {
      dayData.count++;
      if (item.totalAmount) {
        dayData.revenue += item.totalAmount;
      }
    }
  });

  return days;
}

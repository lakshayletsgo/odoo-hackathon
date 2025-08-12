import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching join requests for user:", session.user.id);

    // Start with a simple query first, then add complexity
    let joinRequests;
    try {
      joinRequests = await prisma.joinRequest.findMany({
        where: {
          userId: session.user.id,
        },
        include: {
          invite: {
            select: {
              id: true,
              name: true,
              venue: true,
              sport: true,
              date: true,
              time: true,
              playersRequired: true,
              creator: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (dbError) {
      console.error("Database query error:", dbError);
      // Fallback to legacy query if new one fails
      joinRequests = await prisma.joinRequest.findMany({
        where: {
          joinerName: session.user.name || "",
        },
        include: {
          invite: {
            select: {
              id: true,
              name: true,
              venue: true,
              sport: true,
              date: true,
              time: true,
              playersRequired: true,
              creator: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      console.log("Using legacy query, found:", joinRequests.length);
    }

    console.log(`Found ${joinRequests.length} join requests for user`);
    return NextResponse.json({ joinRequests });
  } catch (error) {
    console.error("Error fetching user join requests:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

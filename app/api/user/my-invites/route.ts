import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's created invites with join requests
    const invites = await prisma.invite.findMany({
      where: {
        creatorId: session.user.id,
      },
      include: {
        joinRequests: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate players joined and left for each invite
    const invitesWithCounts = invites.map((invite) => {
      const playersJoined = invite.joinRequests
        .filter((request) => request.status === "ACCEPTED")
        .reduce((sum, request) => sum + request.playersCount, 0);

      const playersLeft = Math.max(0, invite.playersRequired - playersJoined);

      return {
        ...invite,
        playersJoined,
        playersLeft,
      };
    });

    return NextResponse.json({ invites: invitesWithCounts });
  } catch (error) {
    console.error("Error fetching user invites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

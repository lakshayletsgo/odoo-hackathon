import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const requestId = params.id;

    // Get the join request and verify ownership
    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        invite: {
          select: {
            id: true,
            creatorId: true,
            playersRequired: true,
            playersJoined: true,
          },
        },
      },
    });

    if (!joinRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (joinRequest.invite.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (joinRequest.status !== "PENDING") {
      return NextResponse.json(
        { error: "Request already processed" },
        { status: 400 }
      );
    }

    // Check if there are enough spots available
    const availableSpots =
      joinRequest.invite.playersRequired - joinRequest.invite.playersJoined;
    if (joinRequest.playersCount > availableSpots) {
      return NextResponse.json(
        {
          error: `Not enough spots available. Only ${availableSpots} spots left.`,
        },
        { status: 400 }
      );
    }

    // Accept the request and update players joined
    const [updatedRequest] = await prisma.$transaction([
      prisma.joinRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      }),
      prisma.invite.update({
        where: { id: joinRequest.invite.id },
        data: {
          playersJoined: {
            increment: joinRequest.playersCount,
          },
        },
      }),
    ]);

    // Check if invite should be marked as completed
    const updatedInvite = await prisma.invite.findUnique({
      where: { id: joinRequest.invite.id },
    });

    if (
      updatedInvite &&
      updatedInvite.playersJoined >= updatedInvite.playersRequired
    ) {
      await prisma.invite.update({
        where: { id: joinRequest.invite.id },
        data: { status: "COMPLETED" },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Request accepted successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error accepting request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

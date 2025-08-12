import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;

    // Get the join request with invite details
    const joinRequest = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: {
        invite: {
          include: {
            creator: {
              select: { id: true },
            },
          },
        },
      },
    });

    if (!joinRequest) {
      return NextResponse.json(
        { error: "Join request not found" },
        { status: 404 }
      );
    }

    // Check if the current user is the creator of the invite
    if (joinRequest.invite.creator.id !== session.user.id) {
      return NextResponse.json(
        { error: "You can only accept requests for your own invites" },
        { status: 403 }
      );
    }

    // Update the join request status
    const updatedRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
      include: {
        invite: true,
      },
    });

    // Update the invite's player counts
    const acceptedRequests = await prisma.joinRequest.findMany({
      where: {
        inviteId: joinRequest.invite.id,
        status: "ACCEPTED",
      },
    });

    const totalPlayersJoined = acceptedRequests.reduce(
      (sum: number, req: { playersCount: number }) => sum + req.playersCount,
      0
    );

    await prisma.invite.update({
      where: { id: joinRequest.invite.id },
      data: {
        playersJoined: totalPlayersJoined,
        playersLeft: joinRequest.invite.playersRequired - totalPlayersJoined,
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error accepting join request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Support PATCH method to align with client usage
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return POST(request, context as any);
}
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
            creatorId: true,
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

    // Decline the request
    const updatedRequest = await prisma.joinRequest.update({
      where: { id: requestId },
      data: { status: "DECLINED" },
    });

    return NextResponse.json({
      success: true,
      message: "Request declined successfully",
      request: updatedRequest,
    });
  } catch (error) {
    console.error("Error declining request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

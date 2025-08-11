import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const joinInviteSchema = z.object({
  joinerName: z.string().min(1, "Name is required"),
  contactDetails: z.string().min(1, "Contact details are required"),
  playersCount: z.number().min(1, "At least 1 player is required"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = joinInviteSchema.parse(body);
    const inviteId = params.id;

    // Get the invite and check if it exists and is active
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        requests: {
          where: {
            status: "ACCEPTED",
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    if (invite.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This invite is no longer active" },
        { status: 400 }
      );
    }

    // Check if there are enough spots available
    const currentPlayersJoined = invite.requests.reduce(
      (sum: number, req: { playersCount: number }) => sum + req.playersCount,
      0
    );
    const availableSpots = invite.playersRequired - currentPlayersJoined;

    if (validatedData.playersCount > availableSpots) {
      return NextResponse.json(
        {
          error: `Only ${availableSpots} spots available`,
        },
        { status: 400 }
      );
    }

    // Create the join request
    const joinRequest = await prisma.joinRequest.create({
      data: {
        ...validatedData,
        inviteId,
      },
      include: {
        invite: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Join request sent successfully",
      request: joinRequest,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error joining invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

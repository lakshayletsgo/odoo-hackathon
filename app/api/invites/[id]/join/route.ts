import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const joinRequestSchema = z.object({
  joinerName: z.string().min(1, "Name is required"),
  contactDetails: z.string().min(1, "Contact details are required"),
  playersCount: z.number().min(1, "Players count must be at least 1"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = joinRequestSchema.parse(body);
    const { id: inviteId } = await params;

    // Check if invite exists and has available slots
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
      include: {
        joinRequests: {
          where: {
            status: "ACCEPTED",
          },
        },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Calculate current players
    const currentPlayers = invite.joinRequests.reduce(
      (sum: number, request: { playersCount: number }) =>
        sum + request.playersCount,
      0
    );

    if (currentPlayers + validatedData.playersCount > invite.playersRequired) {
      return NextResponse.json(
        { error: "Not enough spots available" },
        { status: 400 }
      );
    }

    // Proceed to create a join request

    const joinRequest = await prisma.joinRequest.create({
      data: {
        ...validatedData,
        inviteId,
        userId: session.user.id, // Add the user ID to link the request to the user
        status: "PENDING",
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

    return NextResponse.json(joinRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating join request:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

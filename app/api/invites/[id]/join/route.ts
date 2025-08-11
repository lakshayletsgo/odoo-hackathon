import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const joinInviteSchema = z.object({
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

    // Check if user is banned
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isBanned: true },
    });

    if (user?.isBanned) {
      return NextResponse.json({ error: "User is banned" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = joinInviteSchema.parse(body);
    const { id: inviteId } = await params;

    // Find the invite
    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });

    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    // Check if user is trying to join their own invite
    if (invite.creatorId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot join your own invite" },
        { status: 400 }
      );
    }

    const playersLeft = invite.playersRequired - invite.playersJoined;
    if (playersLeft < validatedData.playersCount) {
      return NextResponse.json(
        { error: "Not enough spots available" },
        { status: 400 }
      );
    }

    // Create join request
    const joinRequest = await prisma.joinRequest.create({
      data: {
        inviteId: inviteId,
        joinerName: validatedData.joinerName,
        contactDetails: validatedData.contactDetails,
        playersCount: validatedData.playersCount,
        status: "PENDING",
      },
    });

    return NextResponse.json(joinRequest, { status: 201 });
  } catch (error) {
    console.error("Error joining invite:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to join invite" },
      { status: 500 }
    );
  }
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createInviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  venue: z.string().min(1, "Venue is required"),
  sport: z.string().min(1, "Sport is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  playersRequired: z.number().min(1, "Players required must be at least 1"),
  contactDetails: z.string().min(1, "Contact details are required"),
});

// Function to validate and normalize sport values
function validateSport(sportValue: string): string {
  // Normalize the sport value to match our constants
  const normalizedSport = sportValue.trim();

  // List of valid sports from our constants
  const validSports = [
    "Swimming",
    "Tennis",
    "Cricket",
    "Football",
    "Volleyball",
    "Basketball",
    "Pickleball",
    "Badminton",
    "Table Tennis",
  ];

  // Check if the sport exists in our valid list (case-insensitive)
  const foundSport = validSports.find(
    (sport) => sport.toLowerCase() === normalizedSport.toLowerCase()
  );

  // Return the properly formatted sport or default to Tennis
  return foundSport || "Tennis";
}

export async function GET() {
  try {
    const invites = await prisma.invite.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        joinRequests: {
          where: {
            status: "ACCEPTED",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const invitesWithCounts = invites.map((invite: any) => {
      const playersJoined = invite.joinRequests.reduce(
        (sum: number, request: any) => sum + request.playersCount,
        0
      );
      const playersLeft = invite.playersRequired - playersJoined;

      return {
        ...invite,
        playersJoined,
        playersLeft: Math.max(0, playersLeft),
      };
    });

    return NextResponse.json(invitesWithCounts);
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInviteSchema.parse(body);

    const invite = await prisma.invite.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        creatorId: session.user.id,
        playersLeft: validatedData.playersRequired,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error("Error creating invite:", error);

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

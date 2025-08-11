import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const invite = await prisma.invite.create({
      data: {
        name: body.name,
        venue: body.venue,
        date: new Date(body.date),
        time: body.time,
        sport: validateSport(body.sport),
        playersRequired: body.playersRequired,
        contactDetails: body.contactDetails,
        creatorId: session.user.id,
        playersJoined: 0,
        playersLeft: body.playersRequired,
        status: "OPEN",
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

    return NextResponse.json(invite);
  } catch (error) {
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const invites = await prisma.invite.findMany({
      where: {
        status: "OPEN",
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
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Failed to fetch invites" },
      { status: 500 }
    );
  }
}

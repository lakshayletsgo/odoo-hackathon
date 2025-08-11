import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createInviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  venue: z.string().min(1, "Venue is required"),
  date: z.string().transform((str) => new Date(str)),
  time: z
    .string()
    .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  sport: z.enum([
    "TENNIS",
    "BASKETBALL",
    "FOOTBALL",
    "BADMINTON",
    "VOLLEYBALL",
    "SQUASH",
    "CRICKET",
    "SOCCER",
  ]),
  playersRequired: z
    .number()
    .min(1, "At least 1 player is required")
    .max(50, "Maximum 50 players allowed"),
  contactDetails: z.string().min(1, "Contact details are required"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || (session.user as any)?.isBanned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createInviteSchema.parse(body);

    // Check if the date is in the future
    if (validatedData.date < new Date()) {
      return NextResponse.json(
        { error: "Date must be in the future" },
        { status: 400 }
      );
    }

    const invite = await prisma.invite.create({
      data: {
        ...validatedData,
        creatorId: session.user.id,
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

    return NextResponse.json({
      success: true,
      message: "Invite created successfully",
      invite,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating invite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const venue = searchParams.get("venue");
    const sport = searchParams.get("sport");
    const date = searchParams.get("date");

    const where: any = {
      status: "ACTIVE",
      date: {
        gte: new Date(),
      },
    };

    if (venue) {
      where.venue = {
        contains: venue,
        mode: "insensitive",
      };
    }

    if (sport) {
      where.sport = sport;
    }

    if (date) {
      const selectedDate = new Date(date);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      where.date = {
        gte: selectedDate,
        lt: nextDay,
      };
    }

    const invites = await prisma.invite.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            requests: {
              where: {
                status: "ACCEPTED",
              },
            },
          },
        },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    // Calculate players still required
    const invitesWithPlayersLeft = invites.map(
      (invite: { playersRequired: number; playersJoined: number } & Record<string, any>) => ({
      ...invite,
      playersLeft: invite.playersRequired - invite.playersJoined,
      })
    );

    return NextResponse.json({ invites: invitesWithPlayersLeft });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

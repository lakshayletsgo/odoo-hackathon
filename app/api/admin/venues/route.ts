import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const venueActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  comments: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pendingVenues = await prisma.venue.findMany({
      where: { isApproved: false },
      include: {
        owner: { select: { name: true, email: true } },
        courts: true,
        _count: { select: { courts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(pendingVenues);
  } catch (error) {
    console.error("Get pending venues error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const venueId = url.pathname.split("/").pop();

    if (!venueId) {
      return NextResponse.json({ error: "Venue ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { action, comments } = venueActionSchema.parse(body);

    const venue = await prisma.venue.update({
      where: { id: venueId },
      data: {
        isApproved: action === "approve",
        isActive: action === "approve",
        adminComments: comments,
        approvedAt: action === "approve" ? new Date() : null,
        approvedBy: session.user.id,
      },
      include: {
        owner: { select: { name: true, email: true } },
      },
    });

    // TODO: Send notification email to venue owner
    // await sendVenueApprovalEmail(venue.owner.email, venue, action, comments)

    return NextResponse.json({
      message: `Venue ${action}d successfully`,
      venue,
    });
  } catch (error) {
    console.error("Venue action error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

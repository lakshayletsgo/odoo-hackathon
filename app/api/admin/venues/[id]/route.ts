import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const venueActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  comments: z.string().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, comments } = venueActionSchema.parse(body);

    const venue = await prisma.venue.update({
      where: { id: params.id },
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

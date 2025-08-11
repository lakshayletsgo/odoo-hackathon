import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const userActionSchema = z.object({
  action: z.enum(["ban", "unban"]),
  reason: z.string().optional(),
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
    const { action, reason } = userActionSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        isBanned: action === "ban",
        banReason: action === "ban" ? reason : null,
        bannedAt: action === "ban" ? new Date() : null,
        bannedBy: action === "ban" ? session.user.id : null,
      },
    });

    return NextResponse.json({
      message: `User ${action}ned successfully`,
      user,
    });
  } catch (error) {
    console.error("User action error:", error);

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

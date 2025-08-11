import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const userActionSchema = z.object({
  action: z.string().refine((val) => ["ban", "unban"].includes(val), {
    message: "Invalid action",
  }),
  reason: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role }),
        ...(status === "banned" && { isBanned: true }),
        ...(status === "active" && { isBanned: false }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        isBanned: true,
        createdAt: true,
        _count: {
          select: {
            bookings: true,
            venues: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Get users error:", error);
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
    const userId = url.pathname.split("/").pop();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { action, reason } = userActionSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned: action === "ban",
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

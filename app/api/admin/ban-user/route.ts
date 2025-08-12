import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user?.email ||
      session.user.email !== process.env.ADMIN_EMAIL
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, isBanned } = await request.json();

    if (!userId || typeof isBanned !== "boolean") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBanned },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
      },
    });

    return NextResponse.json({
      message: `User ${isBanned ? "banned" : "unbanned"} successfully`,
      user,
    });
  } catch (error) {
    console.error("Ban user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    const { ownerId, isBanned } = await request.json();

    if (!ownerId || typeof isBanned !== "boolean") {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const owner = await prisma.user.update({
      where: {
        id: ownerId,
        role: "OWNER",
      },
      data: { isBanned },
      select: {
        id: true,
        name: true,
        email: true,
        isBanned: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: `Owner ${isBanned ? "banned" : "unbanned"} successfully`,
      owner,
    });
  } catch (error) {
    console.error("Ban owner error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

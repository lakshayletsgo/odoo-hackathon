import { sendOTPEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { generateOTP } from "@/lib/utils";
import { signUpSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password, role, profilePicture } =
      signUpSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Profile picture URL is already uploaded via /api/upload endpoint
    let profilePictureUrl = profilePicture || null;

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        image: profilePictureUrl,
        isVerified: false,
        isBanned: false,
      },
    });

    // Generate and save OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpCode.create({
      data: {
        code: otp,
        email,
        type: "EMAIL_VERIFICATION",
        expiresAt,
        userId: user.id,
      },
    });

    // Send OTP email
    await sendOTPEmail(email, otp, "verification");

    return NextResponse.json({
      message: "User created successfully. Please verify your email.",
      userId: user.id,
    });
  } catch (error) {
    console.error("Signup error:", error);

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

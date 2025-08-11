import { sendOTPEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const result = await sendOTPEmail(email, otp, type || "verification");

    if (result.success) {
      return NextResponse.json({
        success: true,
        provider: result.provider,
        message: `OTP sent successfully via ${result.provider}`,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send OTP email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

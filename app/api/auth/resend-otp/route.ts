import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOTP } from "@/lib/utils"
import { sendOTPEmail } from "@/lib/email"
import { z } from "zod"

const resendOTPSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = resendOTPSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Invalidate existing OTP codes
    await prisma.otpCode.updateMany({
      where: {
        email,
        type: "EMAIL_VERIFICATION",
        used: false,
      },
      data: { used: true },
    })

    // Generate new OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await prisma.otpCode.create({
      data: {
        code: otp,
        email,
        type: "EMAIL_VERIFICATION",
        expiresAt,
        userId: user.id,
      },
    })

    // Send OTP email
    await sendOTPEmail(email, otp, "verification")

    return NextResponse.json({
      message: "OTP sent successfully",
    })
  } catch (error) {
    console.error("Resend OTP error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

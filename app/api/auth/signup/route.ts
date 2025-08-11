import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { generateOTP } from "@/lib/utils"
import { sendOTPEmail } from "@/lib/email"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signUpSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  role: z.enum(["USER", "OWNER"]),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, role } = signUpSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role,
        isVerified: false,
      },
    })

    // Generate and save OTP
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
      message: "User created successfully. Please verify your email.",
      userId: user.id,
    })
  } catch (error) {
    console.error("Signup error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case "create-booking":
        return await createSampleBooking()
      case "generate-data":
        return await generateSampleData()
      case "test-notifications":
        return await testNotifications()
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Demo action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function createSampleBooking() {
  // Create a sample booking for demo purposes
  const courts = await prisma.court.findMany({ take: 1 })
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    take: 1,
  })

  if (courts.length === 0 || users.length === 0) {
    return NextResponse.json({ error: "No courts or users available for demo booking" }, { status: 400 })
  }

  const booking = await prisma.booking.create({
    data: {
      courtId: courts[0].id,
      userId: users[0].id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      startTime: "14:00",
      endTime: "15:00",
      totalAmount: 35,
      status: "CONFIRMED",
      paymentStatus: "PAID",
    },
  })

  return NextResponse.json({
    message: "Sample booking created successfully",
    booking,
  })
}

async function generateSampleData() {
  // Create demo users if they don't exist
  const demoUsers = [
    {
      email: "demo.player@quickcourt.com",
      name: "Alex Player",
      role: "USER",
      password: await bcrypt.hash("demo123", 12),
    },
    {
      email: "demo.owner@quickcourt.com",
      name: "Sarah Owner",
      role: "OWNER",
      password: await bcrypt.hash("demo123", 12),
    },
    {
      email: "demo.admin@quickcourt.com",
      name: "Mike Admin",
      role: "ADMIN",
      password: await bcrypt.hash("demo123", 12),
    },
  ]

  for (const userData of demoUsers) {
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        isVerified: true,
        emailVerified: new Date(),
      },
    })
  }

  return NextResponse.json({
    message: "Sample data generated successfully",
  })
}

async function testNotifications() {
  // This would send test notifications
  // For demo purposes, we'll just return success
  return NextResponse.json({
    message: "Test notifications sent successfully",
  })
}

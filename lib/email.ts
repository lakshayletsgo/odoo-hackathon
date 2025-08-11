import sgMail from "@sendgrid/mail"

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendOTPEmail(email: string, otp: string, type: "verification" | "reset" = "verification") {
  const subject = type === "verification" ? "Verify your QuickCourt account" : "Reset your QuickCourt password"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">QuickCourt</h2>
      <h3>${subject}</h3>
      <p>Your verification code is:</p>
      <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">
        ${otp}
      </div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject,
    html,
  }

  try {
    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

export async function sendBookingConfirmation(email: string, booking: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">QuickCourt</h2>
      <h3>Booking Confirmation</h3>
      <p>Your booking has been confirmed!</p>
      <div style="background: #f3f4f6; padding: 20px; margin: 20px 0;">
        <p><strong>Court:</strong> ${booking.court.name}</p>
        <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>Total:</strong> $${booking.totalAmount}</p>
      </div>
      <p>See you on the court!</p>
    </div>
  `

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL!,
    subject: "Booking Confirmation - QuickCourt",
    html,
  }

  try {
    await sgMail.send(msg)
    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

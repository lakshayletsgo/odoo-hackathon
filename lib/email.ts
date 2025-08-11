import sgMail from "@sendgrid/mail";
import { Client as PostmarkClient } from "postmark";
import { EMAIL_CONFIG, getEmailTemplate } from "./email-config";

// Initialize Postmark client
const postmarkClient = new PostmarkClient(
  EMAIL_CONFIG.POSTMARK.serverToken || ""
);

// Initialize SendGrid only if API key is available
if (EMAIL_CONFIG.SENDGRID.apiKey) {
  sgMail.setApiKey(EMAIL_CONFIG.SENDGRID.apiKey);
}

// Console-based OTP system for development
function sendOTPConsole(
  email: string,
  otp: string,
  type: "verification" | "reset" = "verification"
): { success: boolean } {
  const subject =
    type === "verification"
      ? "Verify your QuickCourt account"
      : "Reset your QuickCourt password";

  console.log("\n" + "=".repeat(60));
  console.log("📧 OTP EMAIL SIMULATION");
  console.log("=".repeat(60));
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log("-".repeat(60));
  console.log(`🔐 Your verification code is: ${otp}`);
  console.log("This code will expire in 10 minutes.");
  console.log("-".repeat(60));
  console.log("💡 Copy this OTP and paste it in the verification form");
  console.log("=".repeat(60) + "\n");

  return { success: true };
}

export async function sendOTPEmail(
  email: string,
  otp: string,
  type: "verification" | "reset" = "verification"
) {
  const template = getEmailTemplate(type);
  const htmlBody = template.getHtml(otp);
  const textBody = template.getText(otp);

  // Try Postmark first if configured
  if (EMAIL_CONFIG.POSTMARK.enabled) {
    try {
      await postmarkClient.sendEmail({
        From: EMAIL_CONFIG.POSTMARK.fromEmail!,
        To: email,
        Subject: template.subject,
        HtmlBody: htmlBody,
        TextBody: textBody,
        MessageStream: EMAIL_CONFIG.POSTMARK.messageStream,
      });

      console.log(`✅ Email sent successfully via Postmark to ${email}`);
      return { success: true, provider: "postmark" };
    } catch (error) {
      console.error("❌ Postmark email send error:", error);
      console.log("🔄 Falling back to SendGrid...");
    }
  }

  // Fallback to SendGrid if Postmark fails or is not configured
  if (EMAIL_CONFIG.SENDGRID.enabled) {
    const msg = {
      to: email,
      from: EMAIL_CONFIG.SENDGRID.fromEmail!,
      subject: template.subject,
      html: htmlBody,
      text: textBody,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Email sent successfully via SendGrid to ${email}`);
      return { success: true, provider: "sendgrid" };
    } catch (error) {
      console.error("❌ SendGrid email send error:", error);
      console.log("🔄 Falling back to console OTP method...");
    }
  }

  // Final fallback to console method
  console.log("⚠️  Email services not configured, using console OTP method...");
  return sendOTPConsole(email, otp, type);
}

export async function sendBookingConfirmation(email: string, booking: any) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0891b2;">QuickCourt</h2>
      <h3>Booking Confirmation</h3>
      <p>Your booking has been confirmed!</p>
      <div style="background: #f3f4f6; padding: 20px; margin: 20px 0;">
        <p><strong>Court:</strong> ${booking.court.name}</p>
        <p><strong>Date:</strong> ${new Date(
          booking.date
        ).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</p>
        <p><strong>Total:</strong> $${booking.totalAmount}</p>
      </div>
      <p>See you on the court!</p>
    </div>
  `;

  // Try Postmark first
  if (process.env.POSTMARK_SERVER_TOKEN && process.env.POSTMARK_FROM_EMAIL) {
    try {
      await postmarkClient.sendEmail({
        From: process.env.POSTMARK_FROM_EMAIL,
        To: email,
        Subject: "Booking Confirmation - QuickCourt",
        HtmlBody: html,
        MessageStream: "outbound",
      });
      console.log(`✅ Booking confirmation sent via Postmark to ${email}`);
      return { success: true, provider: "postmark" };
    } catch (error) {
      console.error("❌ Postmark booking email error:", error);
    }
  }

  // Fallback to SendGrid
  if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL) {
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: "Booking Confirmation - QuickCourt",
      html,
    };

    try {
      await sgMail.send(msg);
      console.log(`✅ Booking confirmation sent via SendGrid to ${email}`);
      return { success: true, provider: "sendgrid" };
    } catch (error) {
      console.error("❌ SendGrid booking email error:", error);
      return { success: false, error };
    }
  }

  return { success: false, error: "No email service configured" };
}

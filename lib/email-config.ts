// Email service configuration and utilities

export const EMAIL_CONFIG = {
  // Postmark Configuration
  POSTMARK: {
    enabled: !!(
      process.env.POSTMARK_SERVER_TOKEN && process.env.POSTMARK_FROM_EMAIL
    ),
    serverToken: process.env.POSTMARK_SERVER_TOKEN,
    fromEmail: process.env.POSTMARK_FROM_EMAIL,
    messageStream: "outbound",
  },

  // SendGrid Configuration
  SENDGRID: {
    enabled: !!(
      process.env.SENDGRID_API_KEY && process.env.SENDGRID_FROM_EMAIL
    ),
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL,
  },

  // OTP Configuration
  OTP: {
    expiryMinutes: 10,
    length: 6,
    includeLetters: false,
  },
};

export const EMAIL_TEMPLATES = {
  OTP_VERIFICATION: {
    subject: "Verify your QuickCourt account",
    getHtml: (otp: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0891b2; margin: 0;">QuickCourt</h1>
          <p style="color: #666; margin: 5px 0;">Sports Venue Booking Platform</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            Thanks for signing up! Please use the verification code below to complete your registration:
          </p>
          
          <div style="background: #ffffff; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
            <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your verification code:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0891b2; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              ⚠️ This code will expire in <strong>10 minutes</strong>. Don't share it with anyone.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>If you didn't request this verification, please ignore this email.</p>
          <p style="margin-top: 20px;">
            <strong>QuickCourt Team</strong><br>
            <a href="mailto:support@quickcourt.com" style="color: #0891b2;">support@quickcourt.com</a>
          </p>
        </div>
      </div>
    `,
    getText: (otp: string) => `
QuickCourt - Verify Your Email

Your verification code is: ${otp}

This code will expire in 10 minutes.

If you didn't request this verification, please ignore this email.

QuickCourt Team
support@quickcourt.com
    `,
  },

  PASSWORD_RESET: {
    subject: "Reset your QuickCourt password",
    getHtml: (otp: string) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0891b2; margin: 0;">QuickCourt</h1>
          <p style="color: #666; margin: 5px 0;">Sports Venue Booking Platform</p>
        </div>
        
        <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password. Use the code below to proceed:
          </p>
          
          <div style="background: #ffffff; border: 2px dashed #e2e8f0; border-radius: 8px; padding: 25px; text-align: center; margin: 25px 0;">
            <p style="color: #64748b; margin: 0 0 10px 0; font-size: 14px;">Your reset code:</p>
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0891b2; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-size: 14px;">
              ⚠️ This code will expire in <strong>10 minutes</strong>. Don't share it with anyone.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; color: #64748b; font-size: 14px;">
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p style="margin-top: 20px;">
            <strong>QuickCourt Team</strong><br>
            <a href="mailto:support@quickcourt.com" style="color: #0891b2;">support@quickcourt.com</a>
          </p>
        </div>
      </div>
    `,
    getText: (otp: string) => `
QuickCourt - Reset Your Password

Your password reset code is: ${otp}

This code will expire in 10 minutes.

If you didn't request this password reset, please ignore this email.

QuickCourt Team
support@quickcourt.com
    `,
  },
};

export function getEmailTemplate(type: "verification" | "reset") {
  switch (type) {
    case "verification":
      return EMAIL_TEMPLATES.OTP_VERIFICATION;
    case "reset":
      return EMAIL_TEMPLATES.PASSWORD_RESET;
    default:
      return EMAIL_TEMPLATES.OTP_VERIFICATION;
  }
}

import nodemailer from 'nodemailer'
import { format } from 'date-fns'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

function getLocationLabel(location: string): string {
  const labels: Record<string, string> = {
    zoom: '📹 Zoom Meeting',
    google_meet: '📹 Google Meet',
    phone: '📞 Phone Call',
    in_person: '🏢 In Person',
    custom: '🔗 Video Call',
  }
  return labels[location] || location
}

export interface BookingConfirmationData {
  attendeeName: string
  attendeeEmail: string
  hostName: string
  eventName: string
  startTime: Date
  duration: number
  timezone: string
  bookingId: string
  attendeeNotes?: string
  meetingLink?: string
  location?: string
}

/**
 * Send booking confirmation email to attendee
 */
export async function sendBookingConfirmation(
  data: BookingConfirmationData
): Promise<void> {
  const formattedDate = format(data.startTime, "EEEE, MMMM d, yyyy 'at' h:mm a")
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; }
          .detail-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Meeting Confirmed</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.attendeeName},</h2>
            <p>Your meeting with <strong>${data.hostName}</strong> is confirmed!</p>
            
                        <div class="detail-box">
              <p><strong>📅 ${data.eventName}</strong></p>
              <p><strong>🕐</strong> ${formattedDate}</p>
              <p><strong>⏱️</strong> ${data.duration} minutes</p>
              <p><strong>🌍</strong> ${data.timezone}</p>
              ${data.location && data.location !== '' ? `<p><strong>📍 Location:</strong> ${getLocationLabel(data.location)}</p>` : ''}
              ${data.meetingLink ? `
                <p style="margin-top: 12px;">
                  <strong>🔗 Meeting Link:</strong><br/>
                  <a href="${data.meetingLink}" style="color: #3b82f6; text-decoration: none; word-break: break-all;">
                    ${data.meetingLink}
                  </a>
                </p>
              ` : ''}
            </div>
            
            ${data.attendeeNotes ? `
              <div class="detail-box">
                <p><strong>Your notes:</strong></p>
                <p>${data.attendeeNotes}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/booking/${data.bookingId}/cancel" class="button" style="background-color: #ef4444;">
                Cancel Booking
              </a>
              <a href="${process.env.APP_URL}/booking/${data.bookingId}/reschedule" class="button">
                Reschedule
              </a>
            </div>
            
            <p>Looking forward to meeting you!</p>
            <p>Best regards,<br>${data.hostName}</p>
          </div>
          <div class="footer">
            <p>Powered by ${process.env.APP_NAME || 'SchedulePro'}</p>
          </div>
        </div>
      </body>
    </html>
  `
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.attendeeEmail,
    subject: `Meeting confirmed with ${data.hostName}`,
    html,
  })
}

/**
 * Send booking notification to host
 */
export async function sendBookingNotification(
  data: BookingConfirmationData & { hostEmail: string }
): Promise<void> {
  const formattedDate = format(data.startTime, "EEEE, MMMM d, yyyy 'at' h:mm a")
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; }
          .detail-box { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 New Booking!</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.hostName},</h2>
            <p>You have a new booking from <strong>${data.attendeeName}</strong></p>
            
                        <div class="detail-box">
              <p><strong>👤</strong> ${data.attendeeName} (${data.attendeeEmail})</p>
              <p><strong>📅</strong> ${data.eventName}</p>
              <p><strong>🕐</strong> ${formattedDate}</p>
              <p><strong>⏱️</strong> ${data.duration} minutes</p>
              ${data.location && data.location !== '' ? `<p><strong>📍 Location:</strong> ${getLocationLabel(data.location)}</p>` : ''}
              ${data.meetingLink ? `
                <p style="margin-top: 12px;">
                  <strong>🔗 Meeting Link:</strong><br/>
                  <a href="${data.meetingLink}" style="color: #3b82f6; text-decoration: none; word-break: break-all;">
                    ${data.meetingLink}
                  </a>
                </p>
              ` : ''}
            </div>
            
            ${data.attendeeNotes ? `
              <div class="detail-box">
                <p><strong>Attendee's notes:</strong></p>
                <p>${data.attendeeNotes}</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/dashboard" class="button">
                View in Dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.hostEmail,
    subject: `New booking: ${data.eventName} with ${data.attendeeName}`,
    html,
  })
}

/**
 * Send meeting reminder (24 hours before)
 */
export async function sendMeetingReminder(
  data: BookingConfirmationData
): Promise<void> {
  const formattedDate = format(data.startTime, "EEEE, MMMM d, yyyy 'at' h:mm a")
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Meeting Reminder</h1>
          </div>
          <div class="content">
            <h2>Hi ${data.attendeeName},</h2>
            <p>This is a reminder about your upcoming meeting with <strong>${data.hostName}</strong></p>
            
            <p><strong>📅 ${data.eventName}</strong></p>
            <p><strong>🕐</strong> Tomorrow at ${format(data.startTime, 'h:mm a')}</p>
            <p><strong>⏱️</strong> ${data.duration} minutes</p>
            
            <p style="margin-top: 30px;">See you then!</p>
          </div>
        </div>
      </body>
    </html>
  `
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.attendeeEmail,
    subject: `Reminder: Meeting with ${data.hostName} tomorrow`,
    html,
  })
}

/**
 * Send cancellation email
 */
export async function sendCancellationEmail(
  attendeeEmail: string,
  attendeeName: string,
  hostName: string,
  eventName: string,
  reason?: string
): Promise<void> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Meeting Cancelled</h1>
          </div>
          <div class="content">
            <h2>Hi ${attendeeName},</h2>
            <p>Your meeting "<strong>${eventName}</strong>" with ${hostName} has been cancelled.</p>
            
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            
            <p>If you'd like to reschedule, please visit the booking page again.</p>
          </div>
        </div>
      </body>
    </html>
  `
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: attendeeEmail,
    subject: `Meeting cancelled: ${eventName}`,
    html,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 30px; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hi ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">
                Reset Password
              </a>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important:</strong></p>
              <p>This link will expire in 1 hour for security reasons.</p>
              <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>
          <div class="footer">
            <p>Powered by ${process.env.APP_NAME || 'SchedulePro'}</p>
          </div>
        </div>
      </body>
    </html>
  `
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password',
    html,
  })
}

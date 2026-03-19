import nodemailer from 'nodemailer'
import { formatInTimeZone } from 'date-fns-tz'

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
    zoom: 'Zoom Meeting',
    google_meet: 'Google Meet',
    phone: 'Phone Call',
    in_person: 'In Person',
    custom: 'Video Call',
  }
  return labels[location] || location
}

const BRAND = {
  name: 'Croodle',
  bg: '#000000',
  cardBg: '#171717',
  secondaryBg: '#262626',
  border: '#404040',
  text: '#fafafa',
  muted: '#a3a3a3',
  btnBg: '#f5f5f5',
  btnText: '#0a0a0a',
  destructiveBg: '#dc2626',
  destructiveText: '#ffffff',
  successBg: '#14532d',
  successText: '#bbf7d0',
  warningBg: '#713f12',
  warningText: '#fef08a',
  infoBg: '#1e3a5f',
  infoText: '#bfdbfe',
}

function emailLayout(content: string, opts?: { brandColor?: string; brandLogoUrl?: string; hidePoweredBy?: boolean }) {
  const showPoweredBy = !opts?.hidePoweredBy
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    body { margin: 0; padding: 0; background-color: ${BRAND.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background-color: ${BRAND.cardBg}; border: 1px solid ${BRAND.border}; border-radius: 12px; overflow: hidden; }
    .card-header { padding: 24px 28px 0; }
    .card-body { padding: 20px 28px 28px; }
    .card-footer { border-top: 1px solid ${BRAND.border}; padding: 16px 28px; text-align: center; }
    h1 { color: ${BRAND.text}; font-size: 20px; font-weight: 600; margin: 0 0 4px; letter-spacing: -0.3px; }
    h2 { color: ${BRAND.text}; font-size: 16px; font-weight: 600; margin: 0 0 4px; }
    p { color: ${BRAND.muted}; font-size: 14px; line-height: 1.6; margin: 0 0 12px; }
    .detail-box { background-color: ${BRAND.secondaryBg}; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
    .detail-row { display: flex; padding: 4px 0; }
    .detail-label { color: ${BRAND.muted}; font-size: 13px; min-width: 100px; }
    .detail-value { color: ${BRAND.text}; font-size: 13px; font-weight: 500; }
    .btn { display: inline-block; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; text-decoration: none !important; text-align: center; }
    .btn-primary { background-color: ${BRAND.btnBg} !important; color: ${BRAND.btnText} !important; }
    .btn-outline { background-color: transparent; color: ${BRAND.text} !important; border: 1px solid ${BRAND.border}; }
    .btn-destructive { background-color: #dc2626 !important; color: #ffffff !important; }
    .btn-group { text-align: center; margin: 24px 0 8px; }
    .btn-group .btn { margin: 0 6px; }
    .alert { border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 13px; }
    .alert-warning { background-color: ${BRAND.warningBg}; color: ${BRAND.warningText}; }
    .alert-info { background-color: ${BRAND.infoBg}; color: ${BRAND.infoText}; }
    .alert-success { background-color: ${BRAND.successBg}; color: ${BRAND.successText}; }
    .footer-text { color: #737373; font-size: 12px; margin: 0; }
    .logo-area { margin-bottom: 16px; }
    .logo-area img { max-width: 120px; max-height: 40px; }
    .link { color: ${BRAND.muted}; word-break: break-all; font-size: 12px; }
    .divider { border: none; border-top: 1px solid ${BRAND.border}; margin: 20px 0; }
    a { color: ${BRAND.text}; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="card-header">
        <div class="logo-area">
          ${opts?.brandLogoUrl
            ? `<img src="${opts.brandLogoUrl}" alt="Logo" />`
            : `<p style="color:${BRAND.text};font-size:16px;font-weight:600;margin:0;">${BRAND.name}</p>`
          }
        </div>
      </div>
      <div class="card-body">
        ${content}
      </div>
      <div class="card-footer">
        ${showPoweredBy ? `<p class="footer-text">Powered by ${BRAND.name}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`
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
  brandColor?: string
  brandLogoUrl?: string
  hidePoweredBy?: boolean
}

export async function sendBookingConfirmation(
  data: BookingConfirmationData
): Promise<void> {
  const formattedDate = formatInTimeZone(
    data.startTime,
    data.timezone,
    "EEEE, MMMM d, yyyy 'at' h:mm a"
  )

  const content = `
    <h1>Meeting Confirmed</h1>
    <p>Hi ${data.attendeeName}, your meeting with <strong style="color:${BRAND.text}">${data.hostName}</strong> is confirmed.</p>

    <div class="detail-box">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;width:100px;">Event</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${data.eventName}</td>
        </tr>
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">Date</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">Duration</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${data.duration} minutes</td>
        </tr>
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">Timezone</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${data.timezone}</td>
        </tr>
        ${data.location ? `
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">Location</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${getLocationLabel(data.location)}</td>
        </tr>` : ''}
        ${data.meetingLink ? `
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:8px 0 4px;">Link</td>
          <td style="font-size:13px;padding:8px 0 4px;"><a href="${data.meetingLink}" style="color:${BRAND.text};word-break:break-all;">${data.meetingLink}</a></td>
        </tr>` : ''}
      </table>
    </div>

    ${data.attendeeNotes ? `
    <div class="detail-box">
      <p style="color:${BRAND.text};font-size:13px;font-weight:500;margin:0 0 4px;">Your notes</p>
      <p style="margin:0;font-size:13px;">${data.attendeeNotes}</p>
    </div>` : ''}

    <div class="btn-group">
      <a href="${process.env.APP_URL}/booking/${data.bookingId}/reschedule" class="btn btn-primary" style="display:inline-block;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;background-color:${BRAND.btnBg};color:${BRAND.btnText};margin:0 6px;">Reschedule</a>
      <a href="${process.env.APP_URL}/booking/${data.bookingId}/cancel" class="btn btn-destructive" style="display:inline-block;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;background-color:${BRAND.destructiveBg};color:${BRAND.destructiveText};margin:0 6px;">Cancel</a>
    </div>

    <hr class="divider" />
    <p style="font-size:13px;">Looking forward to meeting you!<br/><strong style="color:${BRAND.text}">${data.hostName}</strong></p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.attendeeEmail,
    subject: `Meeting confirmed with ${data.hostName}`,
    html: emailLayout(content, {
      brandLogoUrl: data.brandLogoUrl,
      hidePoweredBy: data.hidePoweredBy,
    }),
  })
}

export async function sendBookingNotification(
  data: BookingConfirmationData & { hostEmail: string }
): Promise<void> {
  const formattedDate = formatInTimeZone(
    data.startTime,
    data.timezone,
    "EEEE, MMMM d, yyyy 'at' h:mm a"
  )

  const content = `
    <h1>New Booking</h1>
    <p>Hi ${data.hostName}, you have a new booking from <strong style="color:${BRAND.text}">${data.attendeeName}</strong>.</p>

    <div class="detail-box">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;width:100px;">Attendee</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${data.attendeeName} (${data.attendeeEmail})</td>
        </tr>
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">Event</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${data.eventName}</td>
        </tr>
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">Date</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">Duration</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${data.duration} minutes</td>
        </tr>
        ${data.location ? `
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">Location</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${getLocationLabel(data.location)}</td>
        </tr>` : ''}
        ${data.meetingLink ? `
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:8px 0 4px;">Link</td>
          <td style="font-size:13px;padding:8px 0 4px;"><a href="${data.meetingLink}" style="color:${BRAND.text};word-break:break-all;">${data.meetingLink}</a></td>
        </tr>` : ''}
      </table>
    </div>

    ${data.attendeeNotes ? `
    <div class="detail-box">
      <p style="color:${BRAND.text};font-size:13px;font-weight:500;margin:0 0 4px;">Attendee&rsquo;s notes</p>
      <p style="margin:0;font-size:13px;">${data.attendeeNotes}</p>
    </div>` : ''}

    <div class="btn-group">
      <a href="${process.env.APP_URL}/dashboard" class="btn btn-primary" style="display:inline-block;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;background-color:${BRAND.btnBg};color:${BRAND.btnText};">View in Dashboard</a>
    </div>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.hostEmail,
    subject: `New booking: ${data.eventName} with ${data.attendeeName}`,
    html: emailLayout(content),
  })
}

export async function sendMeetingReminder(
  data: BookingConfirmationData
): Promise<void> {
  const formattedDate = formatInTimeZone(
    data.startTime,
    data.timezone,
    "EEEE, MMMM d, yyyy 'at' h:mm a"
  )
  const formattedTime = formatInTimeZone(data.startTime, data.timezone, 'h:mm a')

  const content = `
    <h1>Meeting Reminder</h1>
    <p>Hi ${data.attendeeName}, this is a reminder about your upcoming meeting with <strong style="color:${BRAND.text}">${data.hostName}</strong>.</p>

    <div class="detail-box">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;width:100px;">Event</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${data.eventName}</td>
        </tr>
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">When</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">Tomorrow at ${formattedTime}</td>
        </tr>
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:4px 0;">Duration</td>
          <td style="color:${BRAND.text};font-size:13px;font-weight:500;padding:4px 0;">${data.duration} minutes</td>
        </tr>
        ${data.meetingLink ? `
        <tr>
          <td style="color:${BRAND.muted};font-size:13px;padding:8px 0 4px;">Link</td>
          <td style="font-size:13px;padding:8px 0 4px;"><a href="${data.meetingLink}" style="color:${BRAND.text};word-break:break-all;">${data.meetingLink}</a></td>
        </tr>` : ''}
      </table>
    </div>

    <p style="font-size:13px;">See you then!</p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: data.attendeeEmail,
    subject: `Reminder: Meeting with ${data.hostName} tomorrow`,
    html: emailLayout(content),
  })
}

export async function sendCancellationEmail(
  attendeeEmail: string,
  attendeeName: string,
  hostName: string,
  eventName: string,
  reason?: string
): Promise<void> {
  const content = `
    <h1>Meeting Cancelled</h1>
    <p>Hi ${attendeeName}, your meeting <strong style="color:${BRAND.text}">&ldquo;${eventName}&rdquo;</strong> with ${hostName} has been cancelled.</p>

    ${reason ? `
    <div class="alert alert-warning">
      <strong>Reason:</strong> ${reason}
    </div>` : ''}

    <p>If you&rsquo;d like to reschedule, please visit the booking page again.</p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: attendeeEmail,
    subject: `Meeting cancelled: ${eventName}`,
    html: emailLayout(content),
  })
}

export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.APP_URL}/auth/reset-password?token=${resetToken}`

  const content = `
    <h1>Reset your password</h1>
    <p>Hi ${name}, we received a request to reset your password. Click the button below to create a new one.</p>

    <div class="btn-group">
      <a href="${resetUrl}" class="btn btn-primary" style="display:inline-block;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;background-color:${BRAND.btnBg};color:${BRAND.btnText};">Reset Password</a>
    </div>

    <div class="alert alert-warning">
      <strong>Important:</strong> This link expires in 1 hour. If you didn&rsquo;t request this reset, you can safely ignore this email.
    </div>

    <hr class="divider" />
    <p class="link">If the button doesn&rsquo;t work, copy and paste this link:<br/><a href="${resetUrl}" class="link">${resetUrl}</a></p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password',
    html: emailLayout(content),
  })
}

export async function sendEmailVerification(
  email: string,
  name: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`

  const content = `
    <h1>Verify your email</h1>
    <p>Hi ${name}, welcome to ${BRAND.name}! Please verify your email address to get started.</p>

    <div class="btn-group">
      <a href="${verificationUrl}" class="btn btn-primary" style="display:inline-block;padding:10px 24px;border-radius:8px;font-size:14px;font-weight:500;text-decoration:none;background-color:${BRAND.btnBg};color:${BRAND.btnText};">Verify Email Address</a>
    </div>

    <div class="alert alert-info">
      This verification link expires in 24 hours. If you didn&rsquo;t create an account, you can safely ignore this email.
    </div>

    <hr class="divider" />
    <p class="link">If the button doesn&rsquo;t work, copy and paste this link:<br/><a href="${verificationUrl}" class="link">${verificationUrl}</a></p>
  `

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email Address',
    html: emailLayout(content),
  })
}

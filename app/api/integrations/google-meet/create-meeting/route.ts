import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, unauthorizedResponse } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { google } from 'googleapis'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/calendar/callback`
)

export async function POST(request: NextRequest) {
  try {
    const auth = await authMiddleware(request)
    if (!auth) return unauthorizedResponse()

    const { summary, duration, startTime, description } = await request.json()

    const calendarConnection = await prisma.calendarConnection.findFirst({
      where: { userId: auth.userId, provider: 'google' },
    })

    if (!calendarConnection) {
      return NextResponse.json(
        { error: 'Google Calendar not connected. Please connect your Google account first from Settings.' },
        { status: 400 }
      )
    }

    oauth2Client.setCredentials({
      access_token: calendarConnection.accessToken,
      refresh_token: calendarConnection.refreshToken,
    })

    if (calendarConnection.tokenExpiresAt && new Date() >= calendarConnection.tokenExpiresAt) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken()
        await prisma.calendarConnection.update({
          where: { id: calendarConnection.id },
          data: {
            accessToken: credentials.access_token!,
            tokenExpiresAt: credentials.expiry_date
              ? new Date(credentials.expiry_date)
              : null,
          },
        })
        oauth2Client.setCredentials(credentials)
      } catch {
        return NextResponse.json(
          { error: 'Google token expired. Please reconnect your Google account.' },
          { status: 401 }
        )
      }
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const eventStart = startTime
      ? new Date(startTime)
      : new Date(Date.now() + 24 * 60 * 60 * 1000)
    const eventEnd = new Date(eventStart.getTime() + (duration || 30) * 60 * 1000)

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: summary || 'Meeting',
        description,
        start: {
          dateTime: eventStart.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: eventEnd.toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    })

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      (e) => e.entryPointType === 'video'
    )?.uri

    if (!meetLink) {
      return NextResponse.json(
        { error: 'Google Meet link was not generated. Please try again.' },
        { status: 500 }
      )
    }

    // Clean up the placeholder calendar event since we just needed the Meet link
    if (response.data.id) {
      try {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: response.data.id,
        })
      } catch {
        // Non-critical, event will just remain in calendar
      }
    }

    return NextResponse.json({ meetingLink: meetLink })
  } catch (error: any) {
    console.error('Create Google Meet link error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create Google Meet link' },
      { status: 500 }
    )
  }
}

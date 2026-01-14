import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.APP_URL}/api/calendar/callback`
)

export interface CalendarEvent {
  id: string
  summary: string
  start: Date
  end: Date
}

/**
 * Get authorization URL for Google Calendar OAuth
 */
export function getAuthUrl(): string {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
    prompt: 'consent',
  })
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string) {
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })
  
  const { credentials } = await oauth2Client.refreshAccessToken()
  return credentials
}

/**
 * Get busy times from Google Calendar
 */
export async function getGoogleCalendarBusyTimes(
  accessToken: string,
  refreshToken: string,
  startTime: Date,
  endTime: Date
): Promise<Array<{ start: Date; end: Date }>> {
  try {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        items: [{ id: 'primary' }],
      },
    })

    const busyTimes = response.data.calendars?.primary?.busy || []

    return busyTimes.map((busy) => ({
      start: new Date(busy.start!),
      end: new Date(busy.end!),
    }))
  } catch (error) {
    console.error('Failed to fetch Google Calendar busy times:', error)
    return []
  }
}

/**
 * Create event in Google Calendar
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  refreshToken: string,
  event: {
    summary: string
    description?: string
    startTime: Date
    endTime: Date
    attendeeEmail: string
    timezone: string
  }
): Promise<string | null> {
  try {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.startTime.toISOString(),
          timeZone: event.timezone,
        },
        end: {
          dateTime: event.endTime.toISOString(),
          timeZone: event.timezone,
        },
        attendees: [
          { email: event.attendeeEmail },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      },
    })

    return response.data.id || null
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error)
    return null
  }
}

/**
 * Delete event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string
): Promise<boolean> {
  try {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    })

    return true
  } catch (error) {
    console.error('Failed to delete Google Calendar event:', error)
    return false
  }
}

/**
 * Update event in Google Calendar
 */
export async function updateGoogleCalendarEvent(
  accessToken: string,
  refreshToken: string,
  eventId: string,
  updates: {
    summary?: string
    description?: string
    startTime?: Date
    endTime?: Date
    timezone?: string
  }
): Promise<boolean> {
  try {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId,
    })

    const updatedEvent = {
      ...event.data,
      ...(updates.summary && { summary: updates.summary }),
      ...(updates.description && { description: updates.description }),
      ...(updates.startTime && {
        start: {
          dateTime: updates.startTime.toISOString(),
          timeZone: updates.timezone || event.data.start?.timeZone,
        },
      }),
      ...(updates.endTime && {
        end: {
          dateTime: updates.endTime.toISOString(),
          timeZone: updates.timezone || event.data.end?.timeZone,
        },
      }),
    }

    await calendar.events.update({
      calendarId: 'primary',
      eventId,
      requestBody: updatedEvent,
    })

    return true
  } catch (error) {
    console.error('Failed to update Google Calendar event:', error)
    return false
  }
}

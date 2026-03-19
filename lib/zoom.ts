const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID!
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET!
const ZOOM_REDIRECT_URI = process.env.ZOOM_REDIRECT_URI!

export function getZoomAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: ZOOM_CLIENT_ID,
    redirect_uri: ZOOM_REDIRECT_URI,
    state,
  })
  return `https://zoom.us/oauth/authorize?${params.toString()}`
}

export async function getZoomTokens(code: string) {
  const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')

  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: ZOOM_REDIRECT_URI,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Zoom token exchange failed: ${error}`)
  }

  return response.json()
}

export async function refreshZoomToken(refreshToken: string) {
  const credentials = Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')

  const response = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Zoom token refresh failed: ${error}`)
  }

  return response.json()
}

export async function getValidZoomToken(
  accessToken: string,
  refreshToken: string | null,
  expiresAt: Date | null
): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
  if (expiresAt && new Date() < expiresAt) {
    return { accessToken }
  }

  if (!refreshToken) {
    throw new Error('Zoom token expired and no refresh token available')
  }

  const tokens = await refreshZoomToken(refreshToken)
  return {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
  }
}

export async function createZoomMeeting(
  accessToken: string,
  options: {
    topic: string
    duration: number
    startTime?: string
    agenda?: string
  }
) {
  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: options.topic,
      type: options.startTime ? 2 : 1, // 2 = scheduled, 1 = instant
      start_time: options.startTime,
      duration: options.duration,
      agenda: options.agenda,
      settings: {
        join_before_host: true,
        waiting_room: false,
        auto_recording: 'none',
        meeting_authentication: false,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Zoom meeting creation failed: ${error}`)
  }

  const meeting = await response.json()
  return {
    meetingId: meeting.id,
    joinUrl: meeting.join_url,
    startUrl: meeting.start_url,
    password: meeting.password,
  }
}

export async function getZoomUserInfo(accessToken: string) {
  const response = await fetch('https://api.zoom.us/v2/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to get Zoom user info')
  }

  return response.json()
}

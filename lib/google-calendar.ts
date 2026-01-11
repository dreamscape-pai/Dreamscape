import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.GOOGLE_CALENDAR_ENCRYPTION_KEY!
const IV_LENGTH = 16

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
  throw new Error('GOOGLE_CALENDAR_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)')
}

export function encryptRefreshToken(token: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )
  let encrypted = cipher.update(token, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return iv.toString('hex') + ':' + encrypted
}

export function decryptRefreshToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':')
  const iv = Buffer.from(parts[0], 'hex')
  const encrypted = parts[1]
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  return decrypted
}

export interface GoogleTokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  scope: string
  token_type: string
}

export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/calendar/callback`,
      grant_type: 'authorization_code'
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for tokens: ${error}`)
  }

  return response.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token'
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh access token: ${error}`)
  }

  return response.json()
}

export interface GoogleCalendarEvent {
  id: string
  summary?: string
  description?: string
  location?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  status: string
  colorId?: string
  recurringEventId?: string
  originalStartTime?: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  updated?: string
  created?: string
  creator?: {
    email?: string
    displayName?: string
    self?: boolean
  }
  organizer?: {
    email?: string
    displayName?: string
    self?: boolean
  }
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
    self?: boolean
    organizer?: boolean
  }>
  htmlLink?: string
  visibility?: string
  transparency?: string
  reminders?: {
    useDefault?: boolean
    overrides?: Array<{
      method: string
      minutes: number
    }>
  }
  recurrence?: string[]
  // Allow any additional fields Google might send
  [key: string]: any
}

export interface GoogleCalendarListResponse {
  items: GoogleCalendarEvent[]
  nextPageToken?: string
  nextSyncToken?: string
}

export async function fetchCalendarEvents(
  accessToken: string,
  calendarId: string = 'primary',
  options: {
    timeMin?: Date
    timeMax?: Date
    syncToken?: string
    pageToken?: string
    maxResults?: number
  } = {}
): Promise<GoogleCalendarListResponse> {
  const params = new URLSearchParams({
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: (options.maxResults || 250).toString() // Max allowed by Google is 250
  })

  if (options.syncToken) {
    params.set('syncToken', options.syncToken)
  } else {
    if (options.timeMin) {
      params.set('timeMin', options.timeMin.toISOString())
    }
    if (options.timeMax) {
      params.set('timeMax', options.timeMax.toISOString())
    }
  }

  if (options.pageToken) {
    params.set('pageToken', options.pageToken)
  }

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to fetch calendar events: ${error}`)
  }

  return response.json()
}

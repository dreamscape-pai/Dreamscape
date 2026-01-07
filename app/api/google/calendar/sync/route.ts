import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import {
  decryptRefreshToken,
  refreshAccessToken,
  fetchCalendarEvents,
  GoogleCalendarEvent
} from '@/lib/google-calendar'

async function syncUserCalendar(userId: string) {
  const credential = await db.googleCalendarCredential.findUnique({
    where: { userId }
  })

  if (!credential) {
    throw new Error(`No calendar credential found for user ${userId}`)
  }

  // Decrypt refresh token and get access token
  const decryptedRefreshToken = decryptRefreshToken(credential.encryptedRefreshToken)
  const { access_token } = await refreshAccessToken(decryptedRefreshToken)

  const results = {
    created: 0,
    updated: 0,
    deleted: 0,
    errors: [] as string[]
  }

  // Sync each selected calendar
  for (const calendarId of credential.selectedCalendarIds) {
    try {
      const now = new Date()
      const horizon = new Date()
      horizon.setDate(horizon.getDate() + 90) // 90 days ahead

      // Fetch events (use syncToken for incremental if available)
      const response = await fetchCalendarEvents(access_token, calendarId, {
        timeMin: credential.syncToken ? undefined : now,
        timeMax: credential.syncToken ? undefined : horizon,
        syncToken: credential.syncToken || undefined
      })

      // Process each event
      for (const event of response.items) {
        await upsertGoogleCalendarEvent(event, calendarId, userId, results)
      }

      // Update sync token for next incremental sync
      if (response.nextSyncToken) {
        await db.googleCalendarCredential.update({
          where: { userId },
          data: {
            syncToken: response.nextSyncToken,
            lastSyncAt: new Date()
          }
        })
      }
    } catch (error: any) {
      // If sync token is invalid (410 Gone), clear it and retry with full sync
      if (error.message.includes('410')) {
        await db.googleCalendarCredential.update({
          where: { userId },
          data: { syncToken: null }
        })
        results.errors.push(`Sync token expired for calendar ${calendarId}, will retry on next sync`)
      } else {
        results.errors.push(`Error syncing calendar ${calendarId}: ${error.message}`)
      }
    }
  }

  return results
}

async function upsertGoogleCalendarEvent(
  event: GoogleCalendarEvent,
  calendarId: string,
  userId: string,
  results: { created: number; updated: number; deleted: number }
) {
  // Skip cancelled events or delete them if they exist
  if (event.status === 'cancelled') {
    const existing = await db.event.findFirst({
      where: {
        googleEventId: event.id,
        googleCalendarId: calendarId
      }
    })

    if (existing) {
      await db.event.delete({ where: { id: existing.id } })
      results.deleted++
    }
    return
  }

  // Parse start/end times
  const startTime = event.start.dateTime
    ? new Date(event.start.dateTime)
    : new Date(event.start.date!)
  const endTime = event.end.dateTime
    ? new Date(event.end.dateTime)
    : new Date(event.end.date!)

  // Generate slug from title
  const slug = `google-${calendarId}-${event.id}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

  const eventData = {
    title: event.summary || 'Untitled Event',
    slug,
    description: event.description || null,
    startTime,
    endTime,
    googleEventId: event.id,
    googleCalendarId: calendarId,
    googleColorId: event.colorId || null,
    published: true, // Auto-publish Google Calendar events
    type: 'OTHER' as const
  }

  try {
    const existing = await db.event.findFirst({
      where: {
        googleEventId: event.id,
        googleCalendarId: calendarId
      }
    })

    if (existing) {
      await db.event.update({
        where: { id: existing.id },
        data: eventData
      })
      results.updated++
    } else {
      await db.event.create({
        data: eventData
      })
      results.created++
    }
  } catch (error: any) {
    // If slug collision, append timestamp
    if (error.code === 'P2002' && error.meta?.target?.includes('slug')) {
      eventData.slug = `${eventData.slug}-${Date.now()}`
      await db.event.create({ data: eventData })
      results.created++
    } else {
      throw error
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { userId } = body

    if (userId) {
      // Sync specific user
      const results = await syncUserCalendar(userId)
      return NextResponse.json({ success: true, results })
    } else {
      // Sync all users with calendar credentials
      const credentials = await db.googleCalendarCredential.findMany()
      const allResults: Record<string, any> = {}

      for (const cred of credentials) {
        try {
          allResults[cred.userId] = await syncUserCalendar(cred.userId)
        } catch (error: any) {
          allResults[cred.userId] = { error: error.message }
        }
      }

      return NextResponse.json({ success: true, results: allResults })
    }
  } catch (error: any) {
    console.error('Error syncing Google Calendar:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

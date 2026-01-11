import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import {
  decryptRefreshToken,
  refreshAccessToken,
  fetchCalendarEvents,
  GoogleCalendarEvent
} from '@/lib/google-calendar'

// Google Calendar color IDs to space mapping
// Based on your description:
// Blue (9) = Dome
// Purple (3) = Cafe
// Green (10) = Stage
// Yellow (5) = Pole Studio
// Orange (6) = Sauna Lounge
const COLOR_TO_SPACE_SLUG: Record<string, string> = {
  '9': 'dome',        // Blue
  '3': 'cafe',        // Purple
  '10': 'stage',      // Green
  '11': 'stage',      // Red (also stage, as backup)
  '5': 'pole-studio', // Yellow
  '6': 'sauna-lounge', // Orange
  '4': 'sauna-lounge', // Flamingo/Pink (also sauna lounge)
  '7': 'stage',       // Peacock/Teal (default to stage)
  '8': 'dome',        // Gray (default to dome)
  '1': 'dome',        // Lavender (default to dome)
  '2': 'cafe',        // Sage (default to cafe)
}

// Space names to remove from titles
const SPACE_SUFFIXES = [
  ' - dome',
  ' - Dome',
  ' - shala',
  ' - Shala',
  ' - cafe',
  ' - Cafe',
  ' - stage',
  ' - Stage',
  ' - pole studio',
  ' - Pole Studio',
  ' - sauna lounge',
  ' - Sauna Lounge',
  ' - sauna',
  ' - Sauna'
]

function cleanEventTitle(title: string): string {
  if (!title) return 'Untitled Event'

  let cleaned = title

  // First, remove everything after the hyphen (including the hyphen)
  const hyphenIndex = cleaned.indexOf(' - ')
  if (hyphenIndex !== -1) {
    cleaned = cleaned.substring(0, hyphenIndex)
  }

  // Trim any extra whitespace
  cleaned = cleaned.trim()

  // Titleize: capitalize first letter of each word
  cleaned = cleaned.replace(/\w\S*/g, (txt) => {
    // Don't capitalize small words unless they're at the beginning
    const smallWords = ['a', 'an', 'and', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']
    const word = txt.toLowerCase()

    if (smallWords.includes(word) && cleaned.indexOf(txt) > 0) {
      return word
    }

    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })

  // Handle special cases
  cleaned = cleaned
    .replace(/\bDj\b/gi, 'DJ')
    .replace(/\bMc\b/gi, 'MC')
    .replace(/\bVip\b/gi, 'VIP')
    .replace(/\bVr\b/gi, 'VR')
    .replace(/\bAi\b/gi, 'AI')
    .replace(/\bUi\b/gi, 'UI')
    .replace(/\bUx\b/gi, 'UX')
    .replace(/\bApi\b/gi, 'API')
    .replace(/\bCbd\b/gi, 'CBD')
    .replace(/\bThc\b/gi, 'THC')

  return cleaned.trim()
}

function getEventType(title: string): string {
  const lowerTitle = title.toLowerCase()

  // Check for specific event types based on keywords
  if (lowerTitle.includes('jam')) return 'JAM'
  if (lowerTitle.includes('retreat')) return 'RETREAT'
  if (lowerTitle.includes('festival')) return 'FESTIVAL'
  if (lowerTitle.includes('member') || lowerTitle.includes('private booking')) return 'MEMBERSHIP_TRAINING'
  if (lowerTitle.includes('workshop')) return 'WORKSHOP'
  if (lowerTitle.includes('ecstatic') || lowerTitle.includes('event')) return 'EVENT'
  if (lowerTitle.includes('show') || lowerTitle.includes('performance')) return 'SHOW'
  if (lowerTitle.includes('everyday')) return 'EVERYDAY'

  // Default to WORKSHOP instead of OTHER for most events at Dreamscape
  return 'WORKSHOP'
}

async function ensureSpacesExist() {
  // Ensure all required spaces exist
  const requiredSpaces = [
    { name: 'Dome', slug: 'dome', description: 'Main dome space', color: 'blue' },
    { name: 'Cafe', slug: 'cafe', description: 'Cafe area', color: 'purple' },
    { name: 'Stage', slug: 'stage', description: 'Performance stage', color: 'green' },
    { name: 'Pole Studio', slug: 'pole-studio', description: 'Pole dance studio', color: 'yellow' },
    { name: 'Sauna Lounge', slug: 'sauna-lounge', description: 'Sauna and lounge area', color: 'orange' }
  ]

  for (const space of requiredSpaces) {
    const existing = await db.space.findUnique({ where: { slug: space.slug } })
    if (!existing) {
      await db.space.create({
        data: { ...space, published: true }
      })
      console.log(`[Sync] Created missing space: ${space.name}`)
    }
  }

  // Get all spaces for mapping
  const spaces = await db.space.findMany({
    select: { id: true, slug: true, name: true }
  })

  return new Map(spaces.map(s => [s.slug, s]))
}

async function syncServerCalendar() {
  // Calculate our sync window dates first (we'll use them multiple places)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const mostRecentMonday = new Date(now)
  mostRecentMonday.setDate(now.getDate() - daysToSubtract)
  mostRecentMonday.setHours(0, 0, 0, 0)

  const endOfNextWeek = new Date(mostRecentMonday)
  endOfNextWeek.setDate(mostRecentMonday.getDate() + 13)
  endOfNextWeek.setHours(23, 59, 59, 999)

  // Ensure all spaces exist and get mapping
  const spaceMap = await ensureSpacesExist()

  // Get the server credential (we only have one)
  const credential = await db.googleCalendarCredential.findFirst()

  if (!credential) {
    throw new Error('No server calendar credential found')
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

  // Delete Google Calendar events that are before our sync window
  const oldEventsCleanup = await db.event.deleteMany({
    where: {
      googleEventId: { not: null },
      startTime: { lt: mostRecentMonday }
    }
  })
  if (oldEventsCleanup.count > 0) {
    results.deleted += oldEventsCleanup.count
    console.log(`[Sync] Cleaned up ${oldEventsCleanup.count} old events before sync window`)
  }

  // Sync each selected calendar
  for (const calendarId of credential.selectedCalendarIds) {
    try {
      console.log(`[Sync] Fetching events from most recent Monday ${mostRecentMonday.toISOString()} to end of next week ${endOfNextWeek.toISOString()}`)

      // Fetch events (use syncToken for incremental if available)
      let allEvents: GoogleCalendarEvent[] = []
      let pageToken: string | undefined
      let nextSyncToken: string | undefined

      // Handle pagination - fetch ALL events before processing
      do {
        const response = await fetchCalendarEvents(access_token, calendarId, {
          timeMin: credential.syncToken ? undefined : mostRecentMonday,
          timeMax: credential.syncToken ? undefined : endOfNextWeek,
          syncToken: credential.syncToken || undefined,
          pageToken
        })

        // Log detailed info about first few events to see structure
        if (!pageToken && response.items.length > 0) {
          console.log('\n[Sync] Sample Google Calendar Event Data:')
          console.log('=====================================')

          // Show first 3 events in detail
          response.items.slice(0, 3).forEach((event, index) => {
            console.log(`\n--- Event ${index + 1} ---`)
            console.log('ID:', event.id)
            console.log('Summary:', event.summary)
            console.log('Color ID:', event.colorId)
            console.log('Start:', JSON.stringify(event.start))
            console.log('End:', JSON.stringify(event.end))
          })

          console.log('\n=====================================')
        }

        allEvents = allEvents.concat(response.items)
        pageToken = response.nextPageToken
        nextSyncToken = response.nextSyncToken || nextSyncToken

        console.log(`[Sync] Fetched ${response.items.length} events (total: ${allEvents.length})`)
      } while (pageToken)

      console.log(`[Sync] Total events to process: ${allEvents.length}`)

      // Process events in batches for better performance
      await processBatchEvents(allEvents, calendarId, results, spaceMap)

      // Update sync token for next incremental sync
      if (nextSyncToken) {
        await db.googleCalendarCredential.update({
          where: { id: credential.id },
          data: {
            syncToken: nextSyncToken,
            lastSyncAt: new Date()
          }
        })
      }
    } catch (error: any) {
      // If sync token is invalid (410 Gone), clear it and retry with full sync
      if (error.message.includes('410')) {
        await db.googleCalendarCredential.update({
          where: { id: credential.id },
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

async function processBatchEvents(
  events: GoogleCalendarEvent[],
  calendarId: string,
  results: { created: number; updated: number; deleted: number },
  spaceMap: Map<string, { id: number; slug: string; name: string }>
) {
  // Separate cancelled and active events
  const cancelledEvents = events.filter(e => e.status === 'cancelled')
  const activeEvents = events.filter(e => e.status !== 'cancelled')
  const activeEventIds = new Set(activeEvents.map(e => e.id))

  // Mark cancelled events as canceled instead of deleting them
  if (cancelledEvents.length > 0) {
    const cancelledEventIds = cancelledEvents.map(e => e.id)
    const updateResult = await db.event.updateMany({
      where: {
        googleEventId: { in: cancelledEventIds },
        googleCalendarId: calendarId
      },
      data: {
        canceled: true
      }
    })
    results.updated += updateResult.count
    console.log(`[Sync] Marked ${updateResult.count} events as cancelled`)
  }

  // Get ALL existing Google Calendar events for this calendar (not just the active ones)
  const allExistingGoogleEvents = await db.event.findMany({
    where: {
      googleCalendarId: calendarId,
      googleEventId: { not: null }
    },
    select: {
      id: true,
      googleEventId: true,
      preserveManualEdits: true,
      title: true,
      description: true,
      startTime: true
    }
  })

  // Find events that exist in DB but not in the current Google Calendar fetch
  const eventsToDelete = allExistingGoogleEvents.filter(
    dbEvent => dbEvent.googleEventId && !activeEventIds.has(dbEvent.googleEventId)
  )

  // Delete events that no longer exist in Google Calendar
  if (eventsToDelete.length > 0) {
    const deleteResult = await db.event.deleteMany({
      where: {
        id: { in: eventsToDelete.map(e => e.id) }
      }
    })
    results.deleted += deleteResult.count
    console.log(`[Sync] Deleted ${deleteResult.count} events that no longer exist in Google Calendar`)
  }

  // Get existing events that are still active
  const existingEvents = allExistingGoogleEvents.filter(
    dbEvent => dbEvent.googleEventId && activeEventIds.has(dbEvent.googleEventId)
  )

  const existingEventMap = new Map(
    existingEvents.map(e => [e.googleEventId!, e])
  )

  // Separate events to create vs update
  const eventsToCreate: any[] = []
  const eventsToUpdate: { id: number; data: any }[] = []

  for (const event of activeEvents) {
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

    // Determine space based on color (default to Dome if no color)
    let spaceId: number | undefined
    if (event.colorId) {
      const spaceSlug = COLOR_TO_SPACE_SLUG[event.colorId]
      const space = spaceSlug ? spaceMap.get(spaceSlug) : undefined
      if (space) {
        spaceId = space.id
        console.log(`[Sync] Event "${event.summary}" (color ${event.colorId}) → ${space.name}`)
      } else {
        console.log(`[Sync] Event "${event.summary}" has color ${event.colorId} but no space mapping`)
      }
    } else {
      // Default to Dome when no color is specified
      const domeSpace = spaceMap.get('dome')
      if (domeSpace) {
        spaceId = domeSpace.id
        console.log(`[Sync] Event "${event.summary}" has no color - defaulting to Dome`)
      } else {
        console.log(`[Sync] Event "${event.summary}" has no color and Dome space not found`)
      }
    }

    const originalTitle = event.summary || 'Untitled Event'
    const cleanedTitle = cleanEventTitle(originalTitle)
    const eventType = getEventType(originalTitle)

    const eventData = {
      title: cleanedTitle,
      originalTitle, // Store the full original title
      slug,
      description: event.description || null,
      startTime,
      endTime,
      spaceId, // Direct space assignment based on color
      googleEventId: event.id,
      googleCalendarId: calendarId,
      googleColorId: event.colorId || null,
      published: true,
      type: eventType as any
    }

    const existingEvent = existingEventMap.get(event.id)
    if (existingEvent) {
      // If manual edits are preserved, only update time and space
      let updateData: any
      if (existingEvent.preserveManualEdits) {
        console.log(`[Sync] Event "${existingEvent.title}" has manual edits - only updating times and space`)
        updateData = {
          startTime,
          endTime,
          spaceId,
          googleColorId: event.colorId || null,
          originalTitle, // Always update the original title
          // Don't update title or description
        }
      } else {
        // Normal update - all fields (including cleaned title and type)
        updateData = eventData
      }

      eventsToUpdate.push({
        id: existingEvent.id,
        data: updateData
      })
    } else {
      // Add unique slug suffix for new events to avoid collisions
      eventData.slug = `${eventData.slug}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      eventsToCreate.push(eventData)
    }
  }

  // Batch create new events
  if (eventsToCreate.length > 0) {
    console.log(`[Sync] Creating ${eventsToCreate.length} new events...`)
    const createResult = await db.event.createMany({
      data: eventsToCreate,
      skipDuplicates: true
    })
    results.created += createResult.count
    console.log(`[Sync] Created ${createResult.count} events with space assignments`)
  }

  // Batch update existing events (using transactions for efficiency)
  if (eventsToUpdate.length > 0) {
    console.log(`[Sync] Updating ${eventsToUpdate.length} existing events...`)

    // Process updates in chunks to avoid overwhelming the database
    const chunkSize = 50
    for (let i = 0; i < eventsToUpdate.length; i += chunkSize) {
      const chunk = eventsToUpdate.slice(i, i + chunkSize)

      await db.$transaction(
        chunk.map(({ id, data }) =>
          db.event.update({
            where: { id },
            data
          })
        )
      )

      results.updated += chunk.length
    }

    console.log(`[Sync] Updated ${eventsToUpdate.length} events with space assignments`)
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    console.log('[Sync] Starting calendar sync...')
    const startTime = Date.now()

    // Always sync the server calendar
    const results = await syncServerCalendar()

    const duration = Date.now() - startTime
    console.log(`[Sync] Completed in ${duration}ms:`, results)

    return NextResponse.json({
      success: true,
      results,
      duration: `${duration}ms`
    })
  } catch (error: any) {
    console.error('Error syncing Google Calendar:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

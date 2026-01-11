import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startParam = searchParams.get('start')
    const endParam = searchParams.get('end')

    // If no date range provided, return all events (original behavior)
    if (!startParam || !endParam) {
      const events = await db.event.findMany({
        include: {
          space: true,
        },
        orderBy: { startTime: 'desc' },
      })
      return NextResponse.json(events)
    }

    // Filter events for specific week
    const start = new Date(startParam)
    const end = new Date(endParam)

    // Fetch all published events including member events
    // Frontend will handle filtering based on user preferences
    const allEvents = await db.event.findMany({
      where: {
        published: true,
        canceled: false, // Exclude canceled events
      },
      include: {
        space: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    // Filter events for the specified date range (all are now one-time events)
    const relevantEvents = allEvents.filter(event => {
      // One-time events: check if they're in the current week
      return event.startTime >= start && event.startTime <= end
    })

    // Fetch daily events
    const dailyEvents = await db.dailyEvent.findMany({
      where: { published: true },
      include: { space: true }
    })

    // Expand recurring events into individual instances for the week
    const events: any[] = []
    const eventKeys = new Set<string>() // Track unique events by id+date

    // First, expand daily events for the date range
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay()

      for (const dailyEvent of dailyEvents) {
        if (dailyEvent.daysOfWeek.includes(dayOfWeek)) {
          const [startHour, startMinute] = dailyEvent.startTime.split(':').map(Number)
          const [endHour, endMinute] = dailyEvent.endTime.split(':').map(Number)

          const eventStart = new Date(currentDate)
          eventStart.setHours(startHour, startMinute, 0, 0)

          const eventEnd = new Date(currentDate)
          eventEnd.setHours(endHour, endMinute, 0, 0)

          const eventKey = `daily-${dailyEvent.id}-${eventStart.toISOString()}`
          if (!eventKeys.has(eventKey)) {
            eventKeys.add(eventKey)
            events.push({
              id: `daily-${dailyEvent.id}-${currentDate.getTime()}`, // Unique ID for daily events
              title: dailyEvent.title,
              startTime: eventStart,
              endTime: eventEnd,
              space: dailyEvent.space,
              spaceId: dailyEvent.spaceId,
              isDaily: true, // Flag to identify daily events in UI
              showInCalendar: dailyEvent.showInCalendar, // Pass through the showInCalendar flag
              daysOfWeek: dailyEvent.daysOfWeek, // Include days of week for display
              type: 'OTHER',
              published: true
            })
          }
        }
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Reset currentDate for regular events
    const currentDateRegular = new Date(start)

    for (const event of relevantEvents) {
      const eventKey = `${event.id}-${event.startTime.toISOString()}`
      if (!eventKeys.has(eventKey)) {
        eventKeys.add(eventKey)
        events.push(event)
      }
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()

    // Auto-generate slug if not provided
    const slug = body.slug ||
      `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`

    const event = await db.event.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        type: body.type || 'OTHER',
        published: body.published || false,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        spaceId: body.spaceId || null,
      },
      include: {
        space: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

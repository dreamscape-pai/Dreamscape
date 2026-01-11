import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dateParam = searchParams.get('date')

    // Use provided date or default to today
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    targetDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Fetch all spaces and events in parallel
    const [spaces, allEvents, dailyEvents] = await Promise.all([
      // Get all published spaces
      db.space.findMany({
        where: { published: true },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          color: true
        }
      }),

      // Get all events for today including member events
      // Frontend will handle filtering based on user preferences
      db.event.findMany({
        where: {
          published: true,
          canceled: false, // Exclude canceled events
        },
        include: {
          space: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      }),

      // Get daily events
      db.dailyEvent.findMany({
        where: { published: true },
        include: {
          space: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      })
    ])

    // Process events for target date
    const events: any[] = []
    const eventKeys = new Set<string>()
    const dayOfWeek = targetDate.getDay()

    // Add daily events for target date
    for (const dailyEvent of dailyEvents) {
      if (dailyEvent.daysOfWeek.includes(dayOfWeek)) {
        const [startHour, startMinute] = dailyEvent.startTime.split(':').map(Number)
        const [endHour, endMinute] = dailyEvent.endTime.split(':').map(Number)

        const eventStart = new Date(targetDate)
        eventStart.setHours(startHour, startMinute, 0, 0)

        const eventEnd = new Date(targetDate)
        eventEnd.setHours(endHour, endMinute, 0, 0)

        events.push({
          id: `daily-${dailyEvent.id}-${targetDate.getTime()}`,
          title: dailyEvent.title,
          startTime: eventStart,
          endTime: eventEnd,
          space: dailyEvent.space,
          spaceId: dailyEvent.spaceId,
          isDaily: true,
          type: 'OTHER',
          published: true
        })
      }
    }

    // Filter and process regular events - all are now one-time events
    for (const event of allEvents) {
      // One-time events: check if they're on target date
      if (event.startTime >= targetDate && event.startTime < nextDay) {
        events.push(event)
      }
    }

    // Sort events by start time
    events.sort((a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )

    // Return both spaces and events in a single response
    return NextResponse.json({
      spaces,
      events,
      date: targetDate.toISOString()
    })
  } catch (error) {
    console.error('Error fetching today schedule:', error)
    return NextResponse.json({ error: 'Failed to fetch today schedule' }, { status: 500 })
  }
}
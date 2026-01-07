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
          spaces: {
            include: {
              space: true,
            },
          },
          product: true,
        },
        orderBy: { startTime: 'desc' },
      })
      return NextResponse.json(events)
    }

    // Filter events for specific week
    const start = new Date(startParam)
    const end = new Date(endParam)

    // Fetch all published events (both one-time and recurring)
    const allEvents = await db.event.findMany({
      where: {
        published: true,
      },
      include: {
        spaces: {
          include: {
            space: true,
          },
        },
        cancellations: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    })

    // Filter events manually to handle complex recurring logic
    const relevantEvents = allEvents.filter(event => {
      if (!event.isRecurring) {
        // One-time events: check if they're in the current week
        return event.startTime >= start && event.startTime <= end
      } else {
        // Recurring events: check if they overlap with the current week
        const eventStart = new Date(event.startTime)
        const eventRecurrenceEnd = event.recurrenceEnd ? new Date(event.recurrenceEnd) : null

        // Event must have started before or during this week
        if (eventStart > end) return false

        // Event must not have ended before this week
        if (eventRecurrenceEnd && eventRecurrenceEnd < start) return false

        return true
      }
    })

    // Expand recurring events into individual instances for the week
    const events: typeof allEvents = []
    const eventKeys = new Set<string>() // Track unique events by id+date

    for (const event of relevantEvents) {
      if (!event.isRecurring) {
        const eventKey = `${event.id}-${event.startTime.toISOString()}`
        if (!eventKeys.has(eventKey)) {
          eventKeys.add(eventKey)
          events.push(event)
        }
      } else {
        // Simple weekly recurrence expansion
        const eventStart = new Date(event.startTime)
        const eventEnd = event.endTime ? new Date(event.endTime) : null
        const duration = eventEnd ? eventEnd.getTime() - eventStart.getTime() : 0
        const dayOfWeek = eventStart.getDay()

        // Generate instances for each week day
        const currentDate = new Date(start)
        while (currentDate <= end) {
          if (currentDate.getDay() === dayOfWeek) {
            const instanceStart = new Date(currentDate)
            instanceStart.setHours(eventStart.getHours(), eventStart.getMinutes(), 0, 0)

            // Check if this instance is cancelled
            const isCancelled = event.cancellations.some(cancellation => {
              const cancelledDate = new Date(cancellation.cancelledDate)
              return cancelledDate.toDateString() === instanceStart.toDateString()
            })

            // Check if within recurrence end date
            const isBeforeEnd = !event.recurrenceEnd || instanceStart <= new Date(event.recurrenceEnd)

            if (!isCancelled && isBeforeEnd && instanceStart >= eventStart) {
              const eventKey = `${event.id}-${instanceStart.toISOString()}`
              if (!eventKeys.has(eventKey)) {
                eventKeys.add(eventKey)
                const instanceEnd = eventEnd ? new Date(instanceStart.getTime() + duration) : null
                events.push({
                  ...event,
                  startTime: instanceStart,
                  endTime: instanceEnd,
                })
              }
            }
          }
          currentDate.setDate(currentDate.getDate() + 1)
        }
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

    const event = await db.event.create({
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        type: body.type || 'OTHER',
        published: body.published || false,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        productId: body.productId || null,
        spaces: {
          create: (body.spaceIds || []).map((spaceId: string) => ({
            spaceId,
          })),
        },
      },
      include: {
        spaces: {
          include: {
            space: true,
          },
        },
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

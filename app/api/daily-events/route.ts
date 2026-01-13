import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET() {
  try {
    const dailyEvents = await db.dailyEvent.findMany({
      include: {
        space: true,
      },
      orderBy: {
        title: 'asc',
      },
    })

    return NextResponse.json(dailyEvents)
  } catch (error) {
    console.error('Error fetching daily events:', error)
    return NextResponse.json({ error: 'Failed to fetch daily events' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const dailyEvent = await db.dailyEvent.create({
      data: {
        title: body.title,
        description: body.description,
        startTime: body.startTime,
        endTime: body.endTime,
        daysOfWeek: body.daysOfWeek,
        type: body.type,
        displayStyle: body.displayStyle,
        overridesOthers: body.overridesOthers,
        isActive: body.isActive,
        showInCalendar: body.showInCalendar,
        spaceId: body.spaceId,
      },
    })

    return NextResponse.json(dailyEvent)
  } catch (error) {
    console.error('Error creating daily event:', error)
    return NextResponse.json({ error: 'Failed to create daily event' }, { status: 500 })
  }
}
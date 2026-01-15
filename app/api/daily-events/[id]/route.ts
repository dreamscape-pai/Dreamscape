import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { id } = await params
    const dailyEvent = await db.dailyEvent.findUnique({
      where: { id: parseInt(id) },
      include: { space: true },
    })

    if (!dailyEvent) {
      return NextResponse.json({ error: 'Daily event not found' }, { status: 404 })
    }

    return NextResponse.json(dailyEvent)
  } catch (error) {
    console.error('Error fetching daily event:', error)
    return NextResponse.json({ error: 'Failed to fetch daily event' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const dailyEvent = await db.dailyEvent.update({
      where: { id: parseInt(id) },
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
    console.error('Error updating daily event:', error)
    return NextResponse.json({ error: 'Failed to update daily event' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await db.dailyEvent.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting daily event:', error)
    return NextResponse.json({ error: 'Failed to delete daily event' }, { status: 500 })
  }
}

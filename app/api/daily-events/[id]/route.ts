import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/auth'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dailyEvent = await db.dailyEvent.findUnique({
      where: { id: parseInt(params.id) },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const dailyEvent = await db.dailyEvent.update({
      where: { id: parseInt(params.id) },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await db.dailyEvent.delete({
      where: { id: parseInt(params.id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting daily event:', error)
    return NextResponse.json({ error: 'Failed to delete daily event' }, { status: 500 })
  }
}
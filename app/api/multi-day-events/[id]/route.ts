import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const eventId = parseInt(id)

    const event = await db.multiDayEvent.findUnique({
      where: { id: eventId },
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching multi-day event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const eventId = parseInt(id)
    const body = await request.json()

    const event = await db.multiDayEvent.update({
      where: { id: eventId },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        posterImage: body.posterImage,
        type: body.type,
        websiteUrl: body.websiteUrl,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        published: body.published,
        featured: body.featured,
      },
      include: {
        sections: true
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating multi-day event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const eventId = parseInt(id)

    await db.multiDayEvent.delete({
      where: { id: eventId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting multi-day event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
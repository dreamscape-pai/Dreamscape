import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const event = await db.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        space: true,
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const body = await request.json()

    // Get existing event to preserve slug
    const existingEvent = await db.event.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check if title or description changed (manual edit)
    const titleChanged = body.title !== existingEvent.title
    const descriptionChanged = body.description !== existingEvent.description
    const manuallyEdited = titleChanged || descriptionChanged

    // Update event (preserve existing slug unless somehow provided)
    const event = await db.event.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        slug: body.slug || existingEvent.slug, // Keep existing slug
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        type: body.type,
        published: body.published,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        spaceId: body.spaceId || null,
        // Set preserveManualEdits to true if title or description was changed
        preserveManualEdits: manuallyEdited ? true : existingEvent.preserveManualEdits,
      },
      include: {
        space: true,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params

    await db.event.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}

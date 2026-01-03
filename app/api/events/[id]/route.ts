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
      where: { id },
      include: {
        spaces: {
          include: {
            space: true,
          },
        },
        product: true,
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

    // Delete existing space associations
    await db.eventSpace.deleteMany({
      where: { eventId: id },
    })

    // Update event with new space associations
    const event = await db.event.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        type: body.type,
        published: body.published,
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
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params

    await db.event.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}

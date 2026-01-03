import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
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
  } catch (error) {
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

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const featured = searchParams.get('featured')

    const events = await db.multiDayEvent.findMany({
      where: {
        published: true,
        ...(featured === 'true' && { featured: true })
      },
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { startDate: 'asc' }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching multi-day events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    // Generate slug if not provided
    const slug = body.slug ||
      `${body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`

    const event = await db.multiDayEvent.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        posterImage: body.posterImage,
        type: body.type || 'FESTIVAL',
        websiteUrl: body.websiteUrl,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        published: body.published || false,
        featured: body.featured || false,
      },
      include: {
        sections: true
      }
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error creating multi-day event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
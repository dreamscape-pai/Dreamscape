import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  try {
    const spaces = await db.space.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(spaces)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch spaces' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json()

    const space = await db.space.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        images: body.images || [],
        published: body.published || false,
      },
    })

    return NextResponse.json(space)
  } catch (error) {
    console.error('Error creating space:', error)
    return NextResponse.json({ error: 'Failed to create space' }, { status: 500 })
  }
}

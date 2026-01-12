import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    const space = await db.space.findUnique({
      where: { id: parseInt(id) },
      include: {
        events: true,
      },
    })

    if (!space) {
      return NextResponse.json({ error: 'Space not found' }, { status: 404 })
    }

    return NextResponse.json(space)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch space' }, { status: 500 })
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params
    const body = await request.json()

    const space = await db.space.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        images: body.images || [],
        published: body.published,
      },
    })

    return NextResponse.json(space)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update space' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await context.params

    await db.space.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete space' }, { status: 500 })
  }
}

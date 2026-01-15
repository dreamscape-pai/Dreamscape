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

    const sections = await db.multiDayEventSection.findMany({
      where: { multiDayEventId: eventId },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(sections)
  } catch (error) {
    console.error('Error fetching sections:', error)
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    const eventId = parseInt(id)
    const body = await request.json()

    const section = await db.multiDayEventSection.create({
      data: {
        multiDayEventId: eventId,
        title: body.title,
        description: body.description,
        imageUrl: body.imageUrl,
        order: body.order || 0
      }
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error creating section:', error)
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { sectionId, ...updateData } = body

    const section = await db.multiDayEventSection.update({
      where: { id: sectionId },
      data: updateData
    })

    return NextResponse.json(section)
  } catch (error) {
    console.error('Error updating section:', error)
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const searchParams = request.nextUrl.searchParams
    const sectionId = searchParams.get('sectionId')

    if (!sectionId) {
      return NextResponse.json({ error: 'Section ID required' }, { status: 400 })
    }

    await db.multiDayEventSection.delete({
      where: { id: parseInt(sectionId) }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting section:', error)
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 })
  }
}
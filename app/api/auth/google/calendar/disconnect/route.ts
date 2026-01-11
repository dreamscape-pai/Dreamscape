import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find and delete the server credential
    const credential = await db.googleCalendarCredential.findFirst()

    if (credential) {
      await db.googleCalendarCredential.delete({
        where: { id: credential.id }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error)
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 })
  }
}

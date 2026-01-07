import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Create state parameter with CSRF protection and user info
    const state = Buffer.from(
      JSON.stringify({
        userId,
        csrf: crypto.randomBytes(16).toString('hex'),
        returnUrl: request.nextUrl.searchParams.get('returnUrl') || '/admin'
      })
    ).toString('base64')

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/calendar/callback`,
      response_type: 'code',
      scope: 'https://www.googleapis.com/auth/calendar.readonly',
      access_type: 'offline',
      prompt: 'consent', // Force to get refresh token
      state
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Error starting Google Calendar OAuth:', error)
    return NextResponse.json({ error: 'Failed to start OAuth flow' }, { status: 500 })
  }
}

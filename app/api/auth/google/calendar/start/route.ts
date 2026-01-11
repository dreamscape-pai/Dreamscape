import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    // This is now always a server-wide calendar setup
    // No user authentication required

    // Create state parameter with CSRF protection
    const state = Buffer.from(
      JSON.stringify({
        csrf: crypto.randomBytes(16).toString('hex'),
        returnUrl: request.nextUrl.searchParams.get('returnUrl') || '/admin/schedule'
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

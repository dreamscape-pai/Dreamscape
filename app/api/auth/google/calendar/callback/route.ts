import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { exchangeCodeForTokens, encryptRefreshToken } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const stateParam = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('[Calendar Callback] Received params:', {
      hasCode: !!code,
      hasState: !!stateParam,
      error
    })

    if (error) {
      console.error('[Calendar Callback] Google OAuth error:', error)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/schedule?error=oauth_failed`)
    }

    if (!code || !stateParam) {
      console.error('[Calendar Callback] Missing code or state')
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
    }

    // Decode and verify state
    const state = JSON.parse(Buffer.from(stateParam, 'base64').toString())
    const { userId, returnUrl } = state

    console.log('[Calendar Callback] State decoded:', { userId, returnUrl })

    if (!userId) {
      console.error('[Calendar Callback] Invalid state - no userId')
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }

    // Exchange code for tokens
    console.log('[Calendar Callback] Exchanging code for tokens...')
    const tokens = await exchangeCodeForTokens(code)
    console.log('[Calendar Callback] Got tokens:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token
    })

    if (!tokens.refresh_token) {
      console.error('[Calendar Callback] No refresh token received - user may have already connected')
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}${returnUrl}?error=no_refresh_token`
      )
    }

    // Get user info from Google to store email/id
    console.log('[Calendar Callback] Fetching Google user info...')
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`
      }
    })

    const userInfo = await userInfoResponse.json()
    console.log('[Calendar Callback] Got user info:', { email: userInfo.email, id: userInfo.id })

    // Encrypt and store refresh token
    const encryptedToken = encryptRefreshToken(tokens.refresh_token)

    console.log('[Calendar Callback] Saving credential to database for userId:', userId)
    const credential = await db.googleCalendarCredential.upsert({
      where: { userId },
      create: {
        userId,
        encryptedRefreshToken: encryptedToken,
        googleAccountEmail: userInfo.email,
        googleAccountId: userInfo.id,
        selectedCalendarIds: ['primary']
      },
      update: {
        encryptedRefreshToken: encryptedToken,
        googleAccountEmail: userInfo.email,
        googleAccountId: userInfo.id
      }
    })

    console.log('[Calendar Callback] Credential saved successfully:', credential.id)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}${returnUrl}?success=calendar_connected`
    )
  } catch (error: any) {
    console.error('[Calendar Callback] Error in Google Calendar callback:', error)
    console.error('[Calendar Callback] Error stack:', error.stack)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/admin/schedule?error=callback_failed`)
  }
}

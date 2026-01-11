import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { exchangeCodeForTokens, encryptRefreshToken } from '@/lib/google-calendar'

type OAuthStatePayload = {
  csrf?: string
  returnUrl?: string
}

function safeDecodeState(stateParam: string): OAuthStatePayload | null {
  try {
    const decoded = Buffer.from(stateParam, 'base64').toString('utf8')
    const parsed = JSON.parse(decoded) as OAuthStatePayload
    return parsed
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  try {
    const searchParams = request.nextUrl.searchParams
    const authorizationCode = searchParams.get('code')
    const stateParam = searchParams.get('state')
    const oauthError = searchParams.get('error')

    console.log('[Calendar Callback] Received params:', {
      hasCode: Boolean(authorizationCode),
      hasState: Boolean(stateParam),
      oauthError,
    })

    if (oauthError) {
      console.error('[Calendar Callback] Google OAuth error:', oauthError)
      return NextResponse.redirect(`${baseUrl}/admin/schedule?error=oauth_failed`)
    }

    if (!authorizationCode || !stateParam) {
      console.error('[Calendar Callback] Missing code or state')
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 })
    }

    const statePayload = safeDecodeState(stateParam)
    if (!statePayload) {
      console.error('[Calendar Callback] Invalid state (decode/parse failed)')
      return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
    }

    const returnUrl = statePayload.returnUrl ?? '/admin/schedule'

    console.log('[Calendar Callback] State decoded:', { returnUrl })

    // Exchange code for tokens
    console.log('[Calendar Callback] Exchanging code for tokens...')
    const tokenResponse = await exchangeCodeForTokens(authorizationCode)

    console.log('[Calendar Callback] Token exchange result:', {
      hasAccessToken: Boolean(tokenResponse.access_token),
      hasRefreshToken: Boolean(tokenResponse.refresh_token),
      tokenType: tokenResponse.token_type,
      expiresIn: tokenResponse.expires_in,
    })

    if (!tokenResponse.access_token) {
      console.error('[Calendar Callback] No access token received from token exchange')
      return NextResponse.redirect(`${baseUrl}${returnUrl}?error=no_access_token`)
    }

    // Optional but useful: validate the access token against a Calendar API endpoint allowed by calendar.readonly
    // If this fails with 401, your access token is missing/invalid or you're not attaching it correctly.
    const calendarListResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1',
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      }
    )

    if (!calendarListResponse.ok) {
      const calendarListErrorText = await calendarListResponse.text().catch(() => '')
      console.error('[Calendar Callback] Calendar API validation failed:', {
        status: calendarListResponse.status,
        body: calendarListErrorText.slice(0, 500),
      })
      return NextResponse.redirect(`${baseUrl}${returnUrl}?error=calendar_auth_failed`)
    }

    // IMPORTANT:
    // Google may NOT return refresh_token on subsequent authorizations (even though the connection is valid).
    // If refresh_token is missing, keep the previously stored one.

    // Find existing server credential (we only ever have one)
    const existingCredential = await db.googleCalendarCredential.findFirst({
      select: { id: true, encryptedRefreshToken: true },
    })

    const hasNewRefreshToken = Boolean(tokenResponse.refresh_token)
    const hasExistingRefreshToken = Boolean(existingCredential?.encryptedRefreshToken)

    if (!hasNewRefreshToken && !hasExistingRefreshToken) {
      console.error(
        '[Calendar Callback] No refresh token received and no existing refresh token stored'
      )
      return NextResponse.redirect(`${baseUrl}${returnUrl}?error=no_refresh_token`)
    }

    const encryptedRefreshToken = hasNewRefreshToken
      ? encryptRefreshToken(tokenResponse.refresh_token as string)
      : (existingCredential?.encryptedRefreshToken as string)

    console.log('[Calendar Callback] Saving server-wide calendar credential to database')

    // Update existing or create new server credential
    const savedCredential = existingCredential
      ? await db.googleCalendarCredential.update({
          where: { id: existingCredential.id },
          data: {
            encryptedRefreshToken,
          },
        })
      : await db.googleCalendarCredential.create({
          data: {
            // Don't include userId at all - it will default to null
            encryptedRefreshToken,
            googleAccountEmail: null,
            googleAccountId: null,
            selectedCalendarIds: ['primary'],
          },
        })

    console.log('[Calendar Callback] Credential saved successfully:', savedCredential.id)

    return NextResponse.redirect(`${baseUrl}${returnUrl}?success=calendar_connected`)
  } catch (caughtError: unknown) {
    const errorObject = caughtError instanceof Error ? caughtError : new Error(String(caughtError))
    console.error('[Calendar Callback] Error in Google Calendar callback:', errorObject.message)
    console.error('[Calendar Callback] Error stack:', errorObject.stack)
    return NextResponse.redirect(`${baseUrl}/admin/schedule?error=callback_failed`)
  }
}


import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Temporarily simplified middleware for MVP deployment
// TODO: Re-enable auth checks after optimizing bundle size
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // For MVP, only redirect unauthenticated users from /admin routes
  // Authentication will be handled at the page level
  if (pathname.startsWith('/admin')) {
    // Check for a simple session cookie (set by NextAuth)
    const sessionToken = request.cookies.get('authjs.session-token') ||
                        request.cookies.get('__Secure-authjs.session-token')

    if (!sessionToken) {
      const signInUrl = new URL('/auth/signin', request.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

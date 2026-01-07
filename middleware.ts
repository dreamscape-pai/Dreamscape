import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

const publicRoutes = [
  '/',
  '/about',
  '/schedule',
  '/spaces',
  '/cafe',
  '/memberships',
  '/contact',
  '/past-events',
  '/interactive',
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
  '/api/schedule-image',
  '/api/stripe/webhook',
  '/api/auth',
]

const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

export default auth((req) => {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!req.auth) {
      const signInUrl = new URL('/auth/signin', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}

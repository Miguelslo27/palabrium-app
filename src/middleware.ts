import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/story(.*)',
  '/stories',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/stories(.*)',
  '/api/webhooks/clerk'
])

// Middleware that protects private routes and redirects authenticated users
// away from the sign-in / sign-up pages to the home page.
export default clerkMiddleware(async (auth, req) => {
  // If the route is not public, require authentication
  if (!isPublicRoute(req)) {
    await auth.protect()
    return
  }

  // If the user is authenticated and is visiting sign-in or sign-up, redirect to /
  // `auth` provided by clerkMiddleware exposes the authenticated userId directly
  // in the middleware environment. Use that if available to redirect away from
  // sign-in/sign-up pages for already authenticated users.
  const userId = (auth as { userId?: string }).userId
  try {
    const url = new URL(req.url)
    const pathname = url.pathname

    if (userId && (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up'))) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  } catch {
    // malformed URL or other issue: ignore and let client handle it
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
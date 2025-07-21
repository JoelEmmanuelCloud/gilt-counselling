
//middleware.js
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin dashboard protection
    if (pathname.startsWith('/dashboard')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin?callbackUrl=' + encodeURIComponent(pathname), req.url))
      }
      
      if (token.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // Booking page protection - require authentication
    if (pathname.startsWith('/booking')) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin?callbackUrl=' + encodeURIComponent(pathname), req.url))
      }
    }

    // API route protection
    if (pathname.startsWith('/api/bookings') || pathname.startsWith('/api/admin')) {
      if (!token) {
        return new NextResponse(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    // Admin API routes - require admin role
    if (pathname.startsWith('/api/admin') || pathname.startsWith('/api/dashboard')) {
      if (token.role !== 'admin') {
        return new NextResponse(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        )
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl

        // Public routes that don't require authentication
        const publicRoutes = [
          '/',
          '/about',
          '/services',
          '/contact',
          '/blog',
          '/auth/signin',
          '/auth/verify',
          '/api/auth',
          '/api/contact',
          '/api/health'
        ]

        // Check if the current path is public
        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || 
          pathname.startsWith(route + '/') ||
          pathname.startsWith('/blog/') ||
          pathname.startsWith('/api/auth/')
        )

        if (isPublicRoute) {
          return true
        }

        // For protected routes, require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|images|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
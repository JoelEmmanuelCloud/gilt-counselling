import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Only handle admin dashboard protection here
    if (pathname.startsWith('/dashboard')) {
      if (!token || token.role !== 'admin') {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    // For booking page, let the authorized callback handle it
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Admin routes require admin role
        if (pathname.startsWith('/dashboard')) {
          return token?.role === 'admin'
        }
        
        // Booking routes require authentication
        if (pathname.startsWith('/booking')) {
          return !!token
        }
        
        // All other routes are public
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Only protect specific routes, not everything
    '/dashboard/:path*', 
    '/booking/:path*'
  ]
}
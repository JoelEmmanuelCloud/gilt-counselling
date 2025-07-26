// middleware.js
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
        
        // Remove booking route protection from middleware
        // Let the booking page handle authentication client-side
        
        // All other routes are public
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    // Only protect admin routes in middleware
    '/dashboard/:path*'
    // Remove '/booking/:path*' - let the page handle auth
  ]
}
//app/api/lib/auth-provide.js
'use client'
import { SessionProvider } from 'next-auth/react'

export function AuthProvider({ children }) {
  return (
    <SessionProvider
      // Refetch session every 5 minutes to keep it fresh
      refetchInterval={5 * 60}
      // Refetch session when window is focused
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}
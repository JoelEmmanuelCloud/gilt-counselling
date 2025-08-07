// components/dashboard/DashboardAuthWrapper.js
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardAuthWrapper({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      console.log('No session found, redirecting to signin')
      router.push('/auth/signin?callbackUrl=' + window.location.pathname)
      return
    }

    if (session.user.role !== 'admin') {
      console.log('User is not admin, redirecting. Role:', session.user.role)
      router.push('/')
      return
    }
  }, [session, status, router])

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-deepBlue">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render content if not authenticated or not admin
  if (!session || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-deepBlue">Checking permissions...</p>
        </div>
      </div>
    )
  }

  return children
}
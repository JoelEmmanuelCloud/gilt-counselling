// app/hooks/useAuth.js
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export function useAuth(requireAdmin = false) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (requireAdmin && session.user.role !== 'admin') {
      router.push('/')
      return
    }
  }, [session, status, requireAdmin, router])

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    isAdmin: session?.user?.role === 'admin'
  }
}

export function useRequireAuth() {
  return useAuth(false)
}

export function useRequireAdmin() {
  return useAuth(true)
}

// Hook specifically for profile completion check
export function useProfileCompletion() {
  const { data: session, status } = useSession()
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading' || !session) {
      setIsLoading(false)
      return
    }

    // Skip for admin users
    if (session.user.role === 'admin') {
      setIsLoading(false)
      return
    }

    fetchProfileData()
  }, [session, status])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/complete-profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error fetching profile data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (formData) => {
    try {
      const response = await fetch('/api/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProfileData() // Refresh profile data
        return { success: true }
      } else {
        const data = await response.json()
        return { success: false, error: data.error }
      }
    } catch (error) {
      return { success: false, error: 'Failed to update profile' }
    }
  }

  return {
    profileData,
    isLoading,
    isProfileComplete: profileData?.isProfileComplete || false,
    updateProfile,
    refreshProfile: fetchProfileData
  }
}

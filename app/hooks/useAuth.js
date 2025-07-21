// src/hooks/useAuth.js
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

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
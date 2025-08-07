// app/complete-profile/page.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function CompleteProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle authentication client-side (similar to booking/dashboard pages)
  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin?callbackUrl=/complete-profile')
      return
    }

    // Redirect admins away from this page - they don't need profile completion
    if (session.user.role === 'admin') {
      router.push('/dashboard')
      return
    }

    // For regular users, check if profile is already complete
    checkProfileStatus()
  }, [session, status, router])

  const checkProfileStatus = async () => {
    try {
      const response = await fetch('/api/complete-profile')
      if (response.ok) {
        const data = await response.json()
        if (data.isProfileComplete) {
          // Profile already complete, redirect to booking
          router.push('/booking')
          return
        }
        // Pre-fill form with existing data
        setFormData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          phone: data.user.phone || ''
        })
      }
    } catch (error) {
      console.error('Error checking profile status:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Profile completed successfully, redirect to booking
        router.push('/booking')
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch (error) {
      setError('Failed to complete profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Loading state (similar to booking/dashboard pages)
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-deepBlue">Loading profile...</p>
          <p className="text-sm text-gray-500 mt-2">Status: {status}</p>
        </div>
      </div>
    )
  }

  // Don't render content if not authenticated or is admin
  if (!session || session.user.role === 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-deepBlue">Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-deepBlue">
            Complete Your Profile
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            Just a few more details to get you started with Gilt Counselling
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-deepBlue mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-deepBlue mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-deepBlue mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll use this to confirm your appointments
              </p>
            </div>

            <div className="text-xs text-gray-500">
              <p className="font-medium text-deepBlue mb-1">Signed in as:</p>
              <p>{session.user.email}</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gold hover:bg-yellow-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Completing Profile...
                </span>
              ) : (
                'Complete Profile & Continue'
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Your information is secure and will only be used for appointment scheduling
          </p>
        </div>
      </div>
    </div>
  )
}
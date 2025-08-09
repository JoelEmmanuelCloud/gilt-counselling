//app/dashboard/page.js
'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import AdminLayout from '@/components/dashboard/AdminLayout'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  // Debug logging
  useEffect(() => {
 
  }, [session, status])

  // Handle authentication client-side
  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/auth/signin?callbackUrl=/dashboard')
      return
    }

    if (session.user.role !== 'admin') {
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
          <p className="text-deepBlue">Loading dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Status: {status}</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard content if not authenticated or not admin
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

  // Mock data - in real app, fetch from database
  const stats = {
    totalBookings: 45,
    pendingBookings: 8,
    totalMessages: 23,
    unreadMessages: 5,
    totalUsers: 67,
    newUsersThisWeek: 12
  }

  return (
    <AdminLayout pageTitle="Admin Dashboard">
      <div className="space-y-6">
        {/* Welcome message */}
        <div>
          <p className="text-gray-600">
            Welcome back, {session.user.email}!
            Here's an overview of your practice activity at Gilt Counselling.
          </p>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800">Debug Info (Remove in production):</h3>
          <p className="text-sm text-yellow-700">Email: {session.user.email}</p>
          <p className="text-sm text-yellow-700">Role: {session.user.role}</p>
          <p className="text-sm text-yellow-700">User ID: {session.user.id}</p>
          <p className="text-sm text-yellow-700">Session Status: {status}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-deepBlue">{stats.totalBookings}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-yellow-600 font-medium">
                {stats.pendingBookings} pending approval
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✉️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-deepBlue">{stats.totalMessages}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-red-600 font-medium">
                {stats.unreadMessages} unread messages
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-deepBlue">{stats.totalUsers}</p>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-medium">
                +{stats.newUsersThisWeek} this week
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h2 className="font-playfair text-xl font-semibold text-deepBlue mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/dashboard/bookings"
              className="p-4 border border-gray-200 rounded-lg hover:border-gold hover:shadow-md transition-all duration-200 text-center group"
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform duration-200">📋</span>
              <span className="font-medium text-deepBlue">View Bookings</span>
            </Link>
            
            <Link 
              href="/dashboard/messages"
              className="p-4 border border-gray-200 rounded-lg hover:border-gold hover:shadow-md transition-all duration-200 text-center group"
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform duration-200">💬</span>
              <span className="font-medium text-deepBlue">Check Messages</span>
            </Link>
            
            <Link 
              href="/dashboard/users"
              className="p-4 border border-gray-200 rounded-lg hover:border-gold hover:shadow-md transition-all duration-200 text-center group"
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform duration-200">👤</span>
              <span className="font-medium text-deepBlue">Manage Users</span>
            </Link>
            
            <Link 
              href="/dashboard/blog"
              className="p-4 border border-gray-200 rounded-lg hover:border-gold hover:shadow-md transition-all duration-200 text-center group"
            >
              <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform duration-200">✍️</span>
              <span className="font-medium text-deepBlue">Write Blog Post</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair text-lg font-semibold text-deepBlue">
                Recent Bookings
              </h3>
              <Link 
                href="/dashboard/bookings"
                className="text-sm text-gold hover:text-yellow-600 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div>
                    <p className="font-medium text-deepBlue">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Family Therapy - Dec 15, 2:00 PM</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-playfair text-lg font-semibold text-deepBlue">
                Recent Messages
              </h3>
              <Link 
                href="/dashboard/messages"
                className="text-sm text-gold hover:text-yellow-600 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex-1">
                    <p className="font-medium text-deepBlue">Michael Chen</p>
                    <p className="text-sm text-gray-600 truncate">
                      Hi, I'm interested in teen counselling services for my daughter...
                    </p>
                  </div>
                  <span className="ml-3 w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
//app/dashboard/page.js
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/dashboard/AdminLayout'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getServerSession()
  
  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin')
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
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-playfair text-3xl font-bold text-deepBlue">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, Dr. Ugwu. Here's what's happening with your practice.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
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

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
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

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/dashboard/bookings"
              className="p-4 border border-gray-200 rounded-lg hover:border-gold transition-colors text-center"
            >
              <span className="text-2xl block mb-2">📋</span>
              <span className="font-medium text-deepBlue">View Bookings</span>
            </Link>
            
            <Link 
              href="/dashboard/messages"
              className="p-4 border border-gray-200 rounded-lg hover:border-gold transition-colors text-center"
            >
              <span className="text-2xl block mb-2">💬</span>
              <span className="font-medium text-deepBlue">Check Messages</span>
            </Link>
            
            <Link 
              href="/dashboard/users"
              className="p-4 border border-gray-200 rounded-lg hover:border-gold transition-colors text-center"
            >
              <span className="text-2xl block mb-2">👤</span>
              <span className="font-medium text-deepBlue">Manage Users</span>
            </Link>
            
            <Link 
              href="/dashboard/blog"
              className="p-4 border border-gray-200 rounded-lg hover:border-gold transition-colors text-center"
            >
              <span className="text-2xl block mb-2">✍️</span>
              <span className="font-medium text-deepBlue">Write Blog Post</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair text-lg font-semibold text-deepBlue">
                Recent Bookings
              </h3>
              <Link 
                href="/dashboard/bookings"
                className="text-sm text-gold hover:text-yellow-600"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-deepBlue">Sarah Johnson</p>
                    <p className="text-sm text-gray-600">Family Therapy - Dec 15, 2:00 PM</p>
                  </div>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Pending
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-playfair text-lg font-semibold text-deepBlue">
                Recent Messages
              </h3>
              <Link 
                href="/dashboard/messages"
                className="text-sm text-gold hover:text-yellow-600"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-deepBlue">Michael Chen</p>
                    <p className="text-sm text-gray-600 truncate">
                      Hi, I'm interested in teen counselling services for my daughter...
                    </p>
                  </div>
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
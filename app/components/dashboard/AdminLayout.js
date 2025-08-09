//components/dashboard/AdminLayout.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function AdminLayout({ children, pageTitle = "Admin Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Bookings', href: '/dashboard/bookings', icon: '📅' },
    { name: 'Messages', href: '/dashboard/messages', icon: '💬' },
    { name: 'Users', href: '/dashboard/users', icon: '👥' },
    { name: 'Blog', href: '/dashboard/blog', icon: '✍️' },
  ]

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:flex lg:flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
    

        <nav className="flex-1 mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.href)
                    ? 'bg-gold text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-deepBlue'
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              href="/"
              className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-deepBlue"
            >
              <span className="mr-3 text-lg">🏠</span>
              Back to Website
            </Link>
            
            <button
              onClick={() => signOut()}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-deepBlue"
            >
              <span className="mr-3 text-lg">🚪</span>
              Sign Out
            </button>
          </div>
        </nav>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header bar */}
        <div className="flex items-center justify-between h-16 px-4 lg:px-6 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 focus:outline-none focus:text-gray-700 lg:hidden"
            >
              <span className="sr-only">Open sidebar</span>
              <div className="w-6 h-6">
                <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-600 mb-1"></div>
                <div className="w-6 h-0.5 bg-gray-600"></div>
              </div>
            </button>

            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">G</span>
              </div>
              <span className="font-playfair font-semibold text-deepBlue">
                Gilt Counselling Admin
              </span>
            </div>
          </div>

          <div className="flex-1 text-center">
            <h1 className="font-playfair text-xl font-bold text-deepBlue">
              {pageTitle}
            </h1>
          </div>

          <div className="w-16"></div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
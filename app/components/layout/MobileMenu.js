// components/layout/MobileMenu.js
'use client'
import Link from 'next/link'
import { signIn, signOut } from 'next-auth/react'

export default function MobileMenu({ isOpen, navigation, session }) {
  if (!isOpen) return null

  return (
    <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
      <div className="flex flex-col space-y-4">
        {/* Navigation Links */}
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="text-deepBlue hover:text-gold transition-colors duration-200 font-medium py-2"
          >
            {item.name}
          </Link>
        ))}

        {/* Book Session Button */}
        <Link href="/booking" className="btn-primary text-center mt-4">
          Book Session
        </Link>

        {/* Auth Section */}
        <div className="pt-4 border-t border-gray-200">
          {session ? (
            <div className="space-y-3">
              {session.user.role === 'admin' && (
                <Link 
                  href="/dashboard"
                  className="block text-deepBlue hover:text-gold transition-colors py-2"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => signOut()}
                className="block text-left text-deepBlue hover:text-gold transition-colors py-2"
              >
                Sign Out
              </button>
              <div className="text-sm text-gray-600 py-2">
                Welcome, {session.user.name || session.user.email}
              </div>
            </div>
          ) : (
            <button
              onClick={() => signIn()}
              className="btn-secondary w-full text-center"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

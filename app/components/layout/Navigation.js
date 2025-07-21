//components/layout/Navigation.js
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (href) => {
    if (href === '/') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container-max">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" onClick={closeMobileMenu}>
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="font-playfair text-2xl font-bold text-deepBlue">
              Gilt Counselling
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-gold border-b-2 border-gold pb-1'
                    : 'text-deepBlue hover:text-gold'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Auth & CTA */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-gold border-t-transparent"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                {session.user.role === 'admin' && (
                  <Link 
                    href="/dashboard"
                    className="text-sm text-deepBlue hover:text-gold transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <div className="text-sm text-gray-600">
                  Welcome, {session.user.name || session.user.email.split('@')[0]}
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-deepBlue hover:text-gold transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-sm text-deepBlue hover:text-gold transition-colors font-medium"
              >
                Sign In
              </button>
            )}

            {/* Book Session Button */}
            <Link href="/booking" className="btn-primary">
              Book Session
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={handleMobileMenuToggle}
            className="lg:hidden p-2 rounded-md text-deepBlue hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gold"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className={`block h-0.5 w-6 bg-current transition-transform duration-300 ${
                mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}></span>
              <span className={`block h-0.5 w-6 bg-current transition-opacity duration-300 ${
                mobileMenuOpen ? 'opacity-0' : ''
              }`}></span>
              <span className={`block h-0.5 w-6 bg-current transition-transform duration-300 ${
                mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen 
            ? 'max-h-screen opacity-100 border-t border-gray-200' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="px-4 py-4 space-y-4">
            {/* Navigation Links */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMobileMenu}
                className={`block py-2 font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-gold border-l-4 border-gold pl-3'
                    : 'text-deepBlue hover:text-gold hover:pl-3 hover:border-l-4 hover:border-gold'
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {status === 'loading' ? (
                <div className="flex items-center justify-center py-2">
                  <div className="w-6 h-6 animate-spin rounded-full border-2 border-gold border-t-transparent"></div>
                </div>
              ) : session ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 py-2">
                    Welcome, {session.user.name || session.user.email.split('@')[0]}
                  </div>
                  {session.user.role === 'admin' && (
                    <Link 
                      href="/dashboard"
                      onClick={closeMobileMenu}
                      className="block py-2 text-deepBlue hover:text-gold transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut()
                      closeMobileMenu()
                    }}
                    className="block py-2 text-left text-deepBlue hover:text-gold transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    signIn()
                    closeMobileMenu()
                  }}
                  className="block py-2 text-left text-deepBlue hover:text-gold transition-colors font-medium"
                >
                  Sign In
                </button>
              )}

              {/* Mobile Book Session Button */}
              <Link 
                href="/booking" 
                onClick={closeMobileMenu}
                className="btn-primary w-full text-center"
              >
                Book Session
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
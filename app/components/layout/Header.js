'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signIn, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import MobileMenu from './MobileMenu'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  // Hide header on admin/dashboard pages
  if (pathname?.startsWith('/dashboard')) {
    return null
  }

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 relative">
      <nav className="container-max section-padding py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.svg"
              alt="Gilt Counselling Logo"
              width={200}
              height={80}
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-deepBlue hover:text-gold transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Auth Section */}
            <div className="flex items-center space-x-4 ml-8 pl-8 border-l border-gray-200">
              {session ? (
                <div className="flex items-center space-x-4">
                  {session.user.role === 'admin' && (
                    <Link 
                      href="/dashboard"
                      className="text-sm text-deepBlue hover:text-gold transition-colors"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="text-sm text-deepBlue hover:text-gold transition-colors"
                  >
                    Sign Out
                  </button>
                  <span className="text-sm text-gray-600">
                    Welcome, {session.user.name || session.user.email}
                  </span>
                </div>
              ) : (
                <button
                  onClick={() => signIn()}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          {/* Book Session Button */}
          <Link href="/booking" className="hidden md:block btn-primary">
            Book Session
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <span className={`block h-0.5 w-6 bg-deepBlue transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-deepBlue transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-deepBlue transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu isOpen={mobileMenuOpen} navigation={navigation} session={session} />
      </nav>
    </header>
  )
}
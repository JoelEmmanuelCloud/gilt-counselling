// components/layout/Footer.js
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-deepBlue text-white">
      <div className="container-max section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="font-playfair text-xl md:text-2xl font-bold">
                Gilt Counselling
              </span>
            </div>
            <p className="text-gray-300 mb-4 text-sm md:text-base max-w-md leading-relaxed">
              Professional counselling services for teens, youth, and families. 
              Creating safe spaces for growth, healing, and positive change.
            </p>
            {/* Mobile Contact Info - Stacked */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
              <Link 
                href="tel:+2348033094050" 
                className="text-gold hover:text-yellow-300 transition-colors text-sm md:text-base break-all"
              >
                (+234) 803-309-4050
              </Link>
              <Link 
                href="mailto:support@giltcounselling.com"
                className="text-gold hover:text-yellow-300 transition-colors text-sm md:text-base break-all"
              >
                support@giltcounselling.com
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-6 md:mt-0">
            <h3 className="font-playfair text-base md:text-lg font-semibold mb-3 md:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { name: 'About Dr. Ugwu', href: '/about' },
                { name: 'Services', href: '/services' },
                { name: 'Blog', href: '/blog' },
                { name: 'Contact', href: '/contact' },
                { name: 'Book Session', href: '/booking' },
              ].map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-gray-300 hover:text-gold transition-colors text-sm md:text-base block py-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="mt-6 md:mt-0">
            <h3 className="font-playfair text-base md:text-lg font-semibold mb-3 md:mb-4">Services</h3>
            <ul className="space-y-2 text-gray-300 text-sm md:text-base">
              <li className="py-1">Teen Counselling</li>
              <li className="py-1">Family Therapy</li>
              <li className="py-1">Parent Coaching</li>
              <li className="py-1">Group Sessions</li>
              <li className="py-1">Mental Health Advocacy</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Mobile Optimized */}
        <div className="border-t border-gray-700 mt-6 md:mt-8 pt-6 md:pt-8">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
            <p className="text-gray-400 text-xs md:text-sm text-center md:text-left">
              © 2025 Gilt Counselling. All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 items-center">
              <Link href="/privacy" className="text-gray-400 hover:text-gold text-xs md:text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-gold text-xs md:text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
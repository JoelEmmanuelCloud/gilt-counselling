// app/booking/confirmation/page.js
'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function BookingConfirmationPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-max py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>

          {/* Main Message */}
          <h1 className="font-playfair text-4xl font-bold text-deepBlue mb-4">
            Booking Confirmed!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Thank you for choosing Gilt Counselling. Your session has been successfully booked.
          </p>

          {/* What's Next Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="font-playfair text-2xl font-semibold text-deepBlue mb-6">
              What happens next?
            </h2>
            
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Check your email</p>
                  <p className="text-gray-600 text-sm">You'll receive a confirmation email with your appointment details and Google Meet link.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-medium text-deepBlue">We'll contact you</p>
                  <p className="text-gray-600 text-sm">Our team will reach out within 24 hours to confirm and answer any questions.</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Attend your session</p>
                  <p className="text-gray-600 text-sm">Join your counselling session at the scheduled time using the provided link.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Link href="/booking" className="btn-primary">
              Book Another Session
            </Link>
            <a href="tel:+2348033094050" className="btn-secondary">
              📞 Contact Us
            </a>
            <Link href="/blog" className="btn-secondary">
              📖 Read Our Blog
            </Link>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-playfair text-lg font-semibold text-blue-800 mb-3">
              Need help or have questions?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <span>📞</span>
                <span>+234 803 309 4050</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-blue-700">
                <span>✉️</span>
                <span>support@giltcounselling.com</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3">
              Office Hours: Monday - Friday, 9:00 AM - 6:00 PM (WAT)
            </p>
          </div>

          {/* Crisis Support - Simplified */}
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Crisis Support:</strong> If you need immediate help, call 
              <a href="tel:+2348033094050" className="underline ml-1">+234 803 309 4050</a> 
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
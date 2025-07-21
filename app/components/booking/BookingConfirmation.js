//components/booking/BookingConfirmation.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'

export default function BookingConfirmation({ bookingData }) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  useEffect(() => {
    // Send confirmation email when component mounts
    if (bookingData && !confirmationSent) {
      sendConfirmationEmail()
    }
  }, [bookingData, confirmationSent])

  const sendConfirmationEmail = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingData.id,
          sendEmail: true
        }),
      })

      if (response.ok) {
        setConfirmationSent(true)
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCalendar = () => {
    const startDate = new Date(`${bookingData.date}T${bookingData.time}`)
    const endDate = new Date(startDate.getTime() + (60 * 60 * 1000)) // Add 1 hour

    const eventDetails = {
      title: `Counselling Session - ${bookingData.service}`,
      start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      description: `Counselling session with Dr. Ugwu at Gilt Counselling.\\n\\nService: ${bookingData.service}\\nLocation: 123 Wellness Drive, Suite 200`,
      location: '123 Wellness Drive, Suite 200, Your City, ST 12345'
    }

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`
    
    window.open(googleCalendarUrl, '_blank')
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="font-playfair text-2xl font-bold text-deepBlue mb-2">
            Booking Error
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your booking information. Please try again.
          </p>
          <Link href="/booking" className="btn-primary">
            Book Another Session
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-max py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="font-playfair text-3xl font-bold text-deepBlue mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-lg text-gray-600">
              Your counselling session has been successfully scheduled.
            </p>
          </div>

          {/* Booking Details Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
            <h2 className="font-playfair text-xl font-semibold text-deepBlue mb-6">
              Appointment Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">👤</span>
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Client</p>
                  <p className="text-gray-600">{session?.user?.name || session?.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600">🎯</span>
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Service</p>
                  <p className="text-gray-600">{bookingData.service}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">📅</span>
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Date & Time</p>
                  <p className="text-gray-600">
                    {formatDate(bookingData.date)} at {formatTime(bookingData.time)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">📍</span>
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Location</p>
                  <p className="text-gray-600">
                    123 Wellness Drive, Suite 200<br />
                    Your City, ST 12345
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-white">📋</span>
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending Confirmation
                  </span>
                </div>
              </div>

              {bookingData.notes && (
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600">💭</span>
                  </div>
                  <div>
                    <p className="font-medium text-deepBlue">Notes</p>
                    <p className="text-gray-600">{bookingData.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={addToCalendar}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <span>📅</span>
              <span>Add to Calendar</span>
            </button>
            
            <Link
              href="/contact"
              className="btn-secondary w-full text-center flex items-center justify-center space-x-2"
            >
              <span>💬</span>
              <span>Contact Us</span>
            </Link>
          </div>

          {/* Email Confirmation Status */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                confirmationSent ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <span className={confirmationSent ? 'text-green-600' : 'text-gray-600'}>
                  {isLoading ? '⏳' : confirmationSent ? '✉️' : '📧'}
                </span>
              </div>
              <div>
                <p className="font-medium text-deepBlue">
                  {isLoading ? 'Sending confirmation...' : 
                   confirmationSent ? 'Confirmation email sent!' : 
                   'Preparing confirmation email...'}
                </p>
                <p className="text-sm text-gray-600">
                  {confirmationSent ? 
                    'Check your email for appointment details and reminders.' :
                    'You\'ll receive a confirmation email shortly.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-playfair text-lg font-semibold text-deepBlue mb-4">
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Please arrive 10 minutes early for your appointment</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Bring a valid ID and insurance information if applicable</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>If you need to cancel or reschedule, please call at least 24 hours in advance</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>We'll contact you within 24 hours to confirm your appointment</span>
              </li>
            </ul>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-playfair text-lg font-semibold text-deepBlue mb-4">
              What Happens Next?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Confirmation Call</p>
                  <p className="text-sm text-gray-600">
                    Our team will contact you within 24 hours to confirm your appointment and answer any questions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Pre-Session Preparation</p>
                  <p className="text-sm text-gray-600">
                    You'll receive intake forms and preparation materials via email.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gold text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Your Session</p>
                  <p className="text-sm text-gray-600">
                    Attend your scheduled appointment with Dr. Ugwu and begin your journey toward wellness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="text-center mt-8">
            <Link href="/" className="btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
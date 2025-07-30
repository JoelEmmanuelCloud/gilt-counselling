//components/booking/BookingConfirmation.js
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDate, formatTime } from '@/lib/utils'

export default function BookingConfirmation({ bookingData }) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Send confirmation email when component mounts
    if (bookingData && !confirmationSent && !error) {
      sendConfirmationEmail()
    }
  }, [bookingData, confirmationSent, error])

  const sendConfirmationEmail = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/bookings/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingData.id || bookingData._id,
          sendEmail: true
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setConfirmationSent(true)
        if (result.emailError) {
          setError(result.emailError)
        }
      } else {
        throw new Error(result.error || 'Failed to send confirmation')
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
      setError('Unable to send confirmation email. Please contact us if you don\'t receive it.')
    } finally {
      setIsLoading(false)
    }
  }

  const addToCalendar = () => {
    try {
      const startDate = new Date(`${bookingData.date}T${bookingData.time}`)
      const endDate = new Date(startDate.getTime() + (60 * 60 * 1000)) // Add 1 hour

      const eventDetails = {
        title: `Counselling Session - ${bookingData.service}`,
        start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        description: `Counselling Session at Gilt Counselling.\\n\\nService: ${bookingData.service}\\nLocation: No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria`,
        location: 'No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria'
      }

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`
      
      window.open(googleCalendarUrl, '_blank')
    } catch (error) {
      console.error('Error creating calendar event:', error)
      alert('Unable to add to calendar. Please add the appointment manually.')
    }
  }

  const copyBookingDetails = () => {
    const details = `
Gilt Counselling - Appointment Confirmation

Service: ${bookingData.service}
Date: ${formatDate(bookingData.date)}
Time: ${formatTime(bookingData.time)}
Location: No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria

Status: Pending Confirmation
Booking Reference: ${bookingData.id || bookingData._id || 'N/A'}

Contact: +234 803 309 4050
Email: support@giltcounselling.com
    `.trim()

    navigator.clipboard.writeText(details).then(() => {
      alert('Booking details copied to clipboard!')
    }).catch(() => {
      alert('Unable to copy to clipboard')
    })
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
                <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-white">💰</span>
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Fee</p>
                  <p className="text-gray-600 font-semibold text-green-600">Free of Charge</p>
                  <p className="text-sm text-gray-500">Community mental health support</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">📍</span>
                </div>
                <div>
                  <p className="font-medium text-deepBlue">Location</p>
                  <p className="text-gray-600">
                    No 88 Woji Road, GRA Phase 2<br />
                    Port Harcourt, Rivers State, Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">📋</span>
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

              {(bookingData.id || bookingData._id) && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600">#</span>
                  </div>
                  <div>
                    <p className="font-medium text-deepBlue">Booking Reference</p>
                    <p className="text-gray-600 font-mono text-sm">{bookingData.id || bookingData._id}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={addToCalendar}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <span>📅</span>
              <span>Add to Calendar</span>
            </button>
            
            <button
              onClick={copyBookingDetails}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Copy Details</span>
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
                confirmationSent ? 'bg-green-100' : error ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <span className={
                  confirmationSent ? 'text-green-600' : 
                  error ? 'text-red-600' : 
                  isLoading ? 'text-gray-600' : 'text-gray-600'
                }>
                  {isLoading ? '⏳' : confirmationSent ? '✉️' : error ? '⚠️' : '📧'}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-deepBlue">
                  {isLoading ? 'Sending confirmation...' : 
                   confirmationSent ? 'Confirmation email sent!' : 
                   error ? 'Email delivery issue' :
                   'Preparing confirmation email...'}
                </p>
                <p className="text-sm text-gray-600">
                  {confirmationSent ? 
                    'Check your email for appointment details and reminders.' :
                    error ? error :
                    'You\'ll receive a confirmation email shortly.'
                  }
                </p>
              </div>
              {error && (
                <button
                  onClick={sendConfirmationEmail}
                  className="btn-primary text-sm px-3 py-1"
                  disabled={isLoading}
                >
                  Retry
                </button>
              )}
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
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Keep your booking reference number for future communications</span>
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
                    You'll receive intake forms and preparation materials via email to help make your session more effective.
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
                    Attend your scheduled session with one of our qualified counsellors, led by Dr. Ugwu, and take the next step toward healing and personal growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mt-6">
            <h3 className="font-playfair text-lg font-semibold text-red-800 mb-3">
              Crisis Support
            </h3>
            <p className="text-sm text-red-700 mb-3">
              If you're experiencing a mental health emergency, please contact emergency services immediately or reach out to our crisis line.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a href="tel:199" className="btn-secondary bg-red-100 border-red-300 text-red-800 hover:bg-red-200 text-center">
                Emergency: 199
              </a>
              <a href="tel:+2348033094050" className="btn-secondary bg-red-100 border-red-300 text-red-800 hover:bg-red-200 text-center">
                Crisis Line: +234 803 309 4050
              </a>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="text-center mt-8">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary">
                Return to Home
              </Link>
              <Link href="/booking" className="btn-secondary">
                Book Another Session
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                View My Bookings
              </Link>
            </div>
          </div>

          {/* Contact Information Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-lg font-medium text-deepBlue mb-2">
              Questions about your appointment?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <a href="tel:+2348033094050" className="text-gold hover:text-yellow-600 flex items-center justify-center space-x-1">
                <span>📞</span>
                <span>+234 803 309 4050</span>
              </a>
              <a href="mailto:support@giltcounselling.com" className="text-gold hover:text-yellow-600 flex items-center justify-center space-x-1">
                <span>✉️</span>
                <span>Email Support</span>
              </a>
              <a href="/contact" className="text-gold hover:text-yellow-600 flex items-center justify-center space-x-1">
                <span>🌐</span>
                <span>Contact Form</span>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Office Hours: Monday - Friday, 9:00 AM - 6:00 PM (WAT)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
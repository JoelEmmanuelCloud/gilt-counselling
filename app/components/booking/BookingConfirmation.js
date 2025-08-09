//components/booking/BookingConfirmation.js - Updated for TidyCal integration
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function BookingConfirmation({ bookingData }) {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // Check if this is a TidyCal redirect (no specific booking details)
  const isTidyCalRedirect = bookingData?.isTidyCalRedirect
  
  useEffect(() => {
    // Only send confirmation email for regular bookings, not TidyCal redirects
    if (bookingData && !isTidyCalRedirect && !confirmationSent && !error && retryCount === 0) {
      sendConfirmationEmail()
    }
  }, [bookingData, confirmationSent, error, retryCount, isTidyCalRedirect])

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
          setError(`Email sent with issues: ${result.emailError}`)
        }
      } else {
        throw new Error(result.error || 'Failed to send confirmation')
      }
    } catch (error) {
      console.error('Failed to send confirmation email:', error)
      setRetryCount(prev => prev + 1)
      
      if (retryCount < 2) {
        setError('Unable to send confirmation email. We\'ll retry automatically.')
        setTimeout(() => {
          if (retryCount < 2) {
            sendConfirmationEmail()
          }
        }, 3000)
      } else {
        setError('Email delivery is experiencing issues. Your booking is confirmed, but please contact us if you don\'t receive the confirmation email.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const addToCalendar = () => {
    try {
      let startDate, endDate

      if (isTidyCalRedirect) {
        // Generic calendar reminder for TidyCal bookings
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        startDate = nextWeek
        endDate = new Date(nextWeek.getTime() + 60 * 60 * 1000)
      } else {
        // Specific calendar event for regular bookings
        startDate = new Date(`${bookingData.date}T${bookingData.time}`)
        
        if (isNaN(startDate.getTime())) {
          const [year, month, day] = bookingData.date.split('-')
          const [hours, minutes] = bookingData.time.split(':')
          startDate = new Date(year, month - 1, day, hours, minutes)
        }
        
        endDate = new Date(startDate.getTime() + (60 * 60 * 1000))
      }

      const eventDetails = {
        title: `Counselling Session - ${bookingData.service}`,
        start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        description: isTidyCalRedirect 
          ? `Counselling session at Gilt Counselling\\n\\nLocation: No 88 Woji Road, GRA Phase 2, Port Harcourt\\n\\nNote: Check your TidyCal confirmation email for exact time and Google Meet link.`
          : `Counselling Session at Gilt Counselling\\n\\nService: ${bookingData.service}\\nLocation: No 88 Woji Road, GRA Phase 2, Port Harcourt\\n\\nBooking Reference: ${bookingData.id || bookingData._id}`,
        location: 'No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria'
      }

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`
      
      window.open(googleCalendarUrl, '_blank')
    } catch (error) {
      alert(`Please add this appointment manually:\\n\\nService: ${bookingData.service}\\nLocation: Gilt Counselling, Port Harcourt\\n\\nCheck your TidyCal email for specific details.`)
    }
  }

  const copyBookingDetails = () => {
    const details = isTidyCalRedirect ? `
Gilt Counselling - Appointment Confirmation

Your counselling session has been successfully booked!

Service: ${bookingData.service}
Location: No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria

Status: Confirmed
Reference: ${bookingData.bookingReference}

IMPORTANT: 
- Check your TidyCal confirmation email for specific appointment date, time, and Google Meet link
- We'll contact you within 24 hours to confirm your appointment

Contact Information:
Phone: +234 803 309 4050
Email: wecare@giltcounselling.com
Website: https://giltcounselling.com

Important Notes:
- Please arrive 10 minutes early (or join the Google Meet early)
- We'll contact you within 24 hours to confirm your appointment
- Check your email for the Google Meet link
    `.trim() : `
Gilt Counselling - Appointment Confirmation

Service: ${bookingData.service}
Date: ${bookingData.date}
Time: ${bookingData.time}
Duration: ${bookingData.duration || '60 minutes'}
Location: No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria

Status: Pending Confirmation
Booking Reference: ${bookingData.bookingReference || bookingData.id || bookingData._id || 'N/A'}

Contact Information:
Phone: +234 803 309 4050
Email: wecare@giltcounselling.com
Website: https://giltcounselling.com

Important Notes:
- Please arrive 10 minutes early
- Bring a valid ID
- Call 24 hours ahead if you need to reschedule
- Your appointment will be confirmed within 24 hours
    `.trim()

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(details).then(() => {
        alert('Booking details copied to clipboard!')
      }).catch(() => {
        fallbackCopy(details)
      })
    } else {
      fallbackCopy(details)
    }
  }

  const fallbackCopy = (text) => {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    try {
      document.execCommand('copy')
      alert('Booking details copied to clipboard!')
    } catch (err) {
      alert('Unable to copy to clipboard. Please copy the details manually from the confirmation email.')
    } finally {
      document.body.removeChild(textArea)
    }
  }

  // Handle missing or invalid booking data
  if (!bookingData) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="font-playfair text-2xl font-bold text-deepBlue mb-2">
            Booking Information Missing
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your booking information. This might be due to a connection issue.
          </p>
          <div className="space-y-3">
            <Link href="/booking" className="btn-primary w-full">
              Try Booking Again
            </Link>
            <a href="tel:+2348033094050" className="btn-secondary w-full">
              Call Us: +234 803 309 4050
            </a>
          </div>
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
              {isTidyCalRedirect ? 'Booking Confirmed!' : 'Booking Received!'}
            </h1>
            <p className="text-lg text-gray-600">
              {isTidyCalRedirect 
                ? 'Thank you for choosing Gilt Counselling.'
                : 'Your counselling session request has been successfully submitted.'
              }
            </p>
          </div>

          {/* TidyCal-specific message */}
          {isTidyCalRedirect && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="text-center">
                <h2 className="font-playfair text-xl font-semibold text-deepBlue mb-3">
                  Your session has been successfully booked!
                </h2>
                <p className="text-gray-600 mb-4">
                  You should receive a confirmation email from TidyCal with all your appointment details, 
                  including the Google Meet link for your session.
                </p>
                <div className="flex items-center justify-center space-x-2 text-green-600 pt-4 border-t">
                  <span className="text-lg">📧</span>
                  <span className="font-medium">Confirmation email sent by TidyCal</span>
                </div>
              </div>
            </div>
          )}

          {/* Regular booking details for non-TidyCal bookings */}
          {!isTidyCalRedirect && (
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
                      {bookingData.date} at {bookingData.time}
                    </p>
                    {bookingData.duration && (
                      <p className="text-sm text-gray-500">Duration: {bookingData.duration}</p>
                    )}
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
                      {isTidyCalRedirect ? 'Confirmed' : 'Pending Confirmation'}
                    </span>
                  </div>
                </div>

                {(bookingData.bookingReference || bookingData.id || bookingData._id) && (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600">#</span>
                    </div>
                    <div>
                      <p className="font-medium text-deepBlue">Booking Reference</p>
                      <p className="text-gray-600 font-mono text-sm">
                        {bookingData.bookingReference || bookingData.id || bookingData._id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={addToCalendar}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <span>📅</span>
              <span>{isTidyCalRedirect ? 'Add Reminder' : 'Add to Calendar'}</span>
            </button>
            
            <button
              onClick={copyBookingDetails}
              className="btn-secondary w-full flex items-center justify-center space-x-2"
            >
              <span>📋</span>
              <span>Copy Details</span>
            </button>
            
            <a
              href="tel:+2348033094050"
              className="btn-secondary w-full text-center flex items-center justify-center space-x-2"
            >
              <span>📞</span>
              <span>Call Us</span>
            </a>
          </div>

          {/* Email Confirmation Status - Only for regular bookings */}
          {!isTidyCalRedirect && (
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
                     error ? 'Email delivery notice' :
                     'Preparing confirmation email...'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {confirmationSent ? 
                      'Check your email for appointment details and next steps.' :
                      error ? error :
                      'You\'ll receive a confirmation email shortly.'
                    }
                  </p>
                  {retryCount > 0 && retryCount < 3 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Retry attempt {retryCount} of 3...
                    </p>
                  )}
                </div>
                {error && retryCount >= 2 && (
                  <button
                    onClick={sendConfirmationEmail}
                    className="btn-primary text-sm px-3 py-1"
                    disabled={isLoading}
                  >
                    Retry Email
                  </button>
                )}
              </div>
            </div>
          )}

          {/* What Happens Next - Simplified for TidyCal */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-playfair text-lg font-semibold text-deepBlue mb-4">
              What Happens Next?
            </h3>
            {isTidyCalRedirect ? (
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="text-sm text-blue-700">
                    <strong>Check your email</strong> for the TidyCal confirmation with Google Meet link
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="text-sm text-blue-700">
                    <strong>We'll call you</strong> within 24 hours to confirm and answer questions
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="text-sm text-blue-700">
                    <strong>Join your session</strong> using the Google Meet link at your scheduled time
                  </div>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Emergency Contact */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <h3 className="font-playfair text-lg font-semibold text-red-800 mb-3">
              Crisis Support
            </h3>
            <p className="text-sm text-red-700 mb-3">
              If you're experiencing a mental health emergency, please contact emergency services immediately or reach out to our crisis line.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a href="tel:+2348033094050" className="btn-secondary bg-red-100 border-red-300 text-red-800 hover:bg-red-200 text-center">
                Crisis Line: +234 803 309 4050
              </a>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/" className="btn-primary">
                Return to Home
              </Link>
              <Link href="/booking" className="btn-secondary">
                Book Another Session
              </Link>
            </div>

            {/* Contact Information Footer */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-lg font-medium text-deepBlue mb-2">
                Questions about your appointment?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <a href="tel:+2348033094050" className="text-gold hover:text-yellow-600 flex items-center justify-center space-x-1">
                  <span>📞</span>
                  <span>+234 803 309 4050</span>
                </a>
                <a href="mailto:wecare@giltcounselling.com" className="text-gold hover:text-yellow-600 flex items-center justify-center space-x-1">
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
    </div>
  )
}
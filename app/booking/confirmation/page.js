// app/booking/confirmation/page.js - Streamlined version
'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [bookingData, setBookingData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    // Extract booking data from URL parameters
    const service = searchParams.get('service')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const tidyCalId = searchParams.get('id')

    console.log('URL Parameters:', { service, date, time, tidyCalId })

    if (service && date && time) {
      const formattedBookingData = {
        service: service,
        date: date,
        time: time,
        duration: getServiceDuration(service),
        tidyCalBookingId: tidyCalId,
        bookingReference: tidyCalId ? `TC-${tidyCalId}` : `TEMP-${Date.now()}`,
        status: 'confirmed'
      }

      setBookingData(formattedBookingData)

      // Save to database if user is authenticated
      if (session) {
        saveBookingToDatabase(formattedBookingData)
      }
    } else {
      console.log('Missing booking parameters')
    }
    
    setIsLoading(false)
  }, [searchParams, session])

  function getServiceDuration(service) {
    const durations = {
      'Individual Teen Session': '50 minutes',
      'Family Therapy': '75 minutes', 
      'Parent Coaching': '60 minutes',
      'Teen Group Session': '90 minutes',
      'Group Session': '90 minutes'
    }
    return durations[service] || '60 minutes'
  }

  const saveBookingToDatabase = async (bookingData) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: bookingData.service,
          date: bookingData.date,
          time: bookingData.time,
          duration: bookingData.duration,
          tidyCalBookingId: bookingData.tidyCalBookingId,
          notes: `Booked via TidyCal - Reference: ${bookingData.tidyCalBookingId}`
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Booking saved to database:', result)
        setBookingData(prev => ({
          ...prev,
          id: result.bookingId,
          bookingReference: result.bookingReference || prev.bookingReference
        }))
      } else {
        throw new Error('Failed to save booking')
      }
    } catch (error) {
      console.error('Error saving booking to database:', error)
      setSaveError('Unable to sync with our system, but your booking is confirmed with TidyCal.')
    } finally {
      setIsSaving(false)
    }
  }

  const addToCalendar = () => {
    try {
      const startDate = new Date(`${bookingData.date}T${bookingData.time}`)
      const endDate = new Date(startDate.getTime() + (60 * 60 * 1000))

      const eventDetails = {
        title: `${bookingData.service} - Gilt Counselling`,
        start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        description: `Counselling session at Gilt Counselling\\n\\nService: ${bookingData.service}\\nDuration: ${bookingData.duration}\\nLocation: No 88 Woji Road, GRA Phase 2, Port Harcourt\\n\\nReference: ${bookingData.bookingReference}`,
        location: 'No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria'
      }

      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&dates=${eventDetails.start}/${eventDetails.end}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}`
      
      window.open(googleCalendarUrl, '_blank')
    } catch (error) {
      alert(`Please add this appointment manually:\\n\\nService: ${bookingData.service}\\nDate: ${bookingData.date}\\nTime: ${bookingData.time}`)
    }
  }

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const formatTime = (timeStr) => {
    try {
      const [hours, minutes] = timeStr.split(':')
      const time = new Date()
      time.setHours(parseInt(hours), parseInt(minutes))
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timeStr
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-deepBlue font-medium">Loading your booking confirmation...</p>
        </div>
      </div>
    )
  }

  // Handle missing booking data
  if (!bookingData || !bookingData.service) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-md mx-auto bg-white rounded-xl shadow-sm p-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h1 className="font-playfair text-2xl font-bold text-deepBlue mb-4">
            Booking Information Missing
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't retrieve your booking details from TidyCal. Your booking may still be confirmed in TidyCal.
          </p>
          <div className="space-y-3">
            <Link href="/booking" className="btn-primary w-full">
              Make a New Booking
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
          
          {/* Success Header - More Compact */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <h1 className="font-playfair text-2xl font-bold text-deepBlue mb-2">
              Booking Confirmed!
            </h1>
            <p className="text-gray-600">
              Your counselling session has been successfully scheduled.
            </p>
          </div>

          {/* Compact Booking Details */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="font-playfair text-lg font-semibold text-deepBlue mb-4">
              Your Appointment
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-gray-600 font-medium">Service:</span>
                <span className="text-deepBlue text-right">{bookingData.service}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-gray-600 font-medium">Date:</span>
                <span className="text-deepBlue text-right font-medium">
                  {formatDate(bookingData.date)}
                </span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-gray-600 font-medium">Time:</span>
                <span className="text-deepBlue text-right">
                  {formatTime(bookingData.time)} ({bookingData.duration})
                </span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-gray-600 font-medium">Location:</span>
                <span className="text-deepBlue text-right text-sm">
                  No 88 Woji Road, GRA Phase 2<br />
                  Port Harcourt, Rivers State
                </span>
              </div>
              
              {bookingData.bookingReference && (
                <div className="flex justify-between items-start pt-2 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">Reference:</span>
                  <span className="text-deepBlue font-mono text-sm">
                    {bookingData.bookingReference}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Database Save Status - Compact */}
          {isSaving && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <p className="text-blue-800 text-sm">Syncing with our system...</p>
              </div>
            </div>
          )}

          {saveError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-yellow-600">⚠️</span>
                <p className="text-yellow-800 text-sm">{saveError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <button
              onClick={addToCalendar}
              className="btn-secondary flex items-center justify-center space-x-2 text-sm py-2"
            >
              <span>📅</span>
              <span>Add to Calendar</span>
            </button>
            
            <a
              href="tel:+2348033094050"
              className="btn-secondary flex items-center justify-center space-x-2 text-sm py-2"
            >
              <span>📞</span>
              <span>Call Us</span>
            </a>
            
            <Link
              href="/contact"
              className="btn-secondary flex items-center justify-center space-x-2 text-sm py-2"
            >
              <span>💬</span>
              <span>Contact Us</span>
            </Link>
          </div>

          {/* Next Steps - Simplified */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-playfair text-lg font-semibold text-blue-800 mb-3">
              What Happens Next?
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p>• You'll receive a Google Meet link via email before your session</p>
              <p>• We'll contact you within 24 hours to confirm your appointment</p>
              <p>• Please test your audio/video setup beforehand</p>
              <p>• Find a quiet, private space for your session</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="text-center">
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link href="/" className="btn-primary">
                Return to Home
              </Link>
              <Link href="/booking" className="btn-secondary">
                Book Another Session
              </Link>
            </div>

            {/* Contact Info - Compact */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-deepBlue mb-2">
                Questions about your appointment?
              </p>
              <div className="flex justify-center space-x-6 text-sm">
                <a href="tel:+2348033094050" className="text-gold hover:text-yellow-600">
                  📞 +234 803 309 4050
                </a>
                <a href="mailto:support@giltcounselling.com" className="text-gold hover:text-yellow-600">
                  ✉️ Email Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
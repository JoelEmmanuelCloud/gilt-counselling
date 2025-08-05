// app/booking/confirmation/page.js
'use client'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import BookingConfirmation from '@/components/booking/BookingConfirmation'

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [bookingData, setBookingData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Extract booking data from URL parameters (sent by TidyCal redirect)
    const service = searchParams.get('service')
    const date = searchParams.get('date')
    const time = searchParams.get('time')
    const tidyCalId = searchParams.get('id')

    if (service && date && time) {
      // Format the booking data to match your existing BookingConfirmation component
      const formattedBookingData = {
        service: service,
        date: date,
        time: time,
        duration: getServiceDuration(service),
        tidyCalBookingId: tidyCalId,
        id: tidyCalId, // For compatibility with your existing component
        _id: tidyCalId, // For compatibility with your existing component
        bookingReference: `TC-${tidyCalId}`, // Create a reference from TidyCal ID
        status: 'confirmed',
        notes: `Booked via TidyCal - Reference: ${tidyCalId}`,
        // Add any other fields your BookingConfirmation component expects
      }

      // Save to database if user is authenticated
      if (session) {
        saveBookingToDatabase(formattedBookingData)
      }

      setBookingData(formattedBookingData)
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
          notes: bookingData.notes
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Booking saved to database:', result)
        // Update booking data with database ID
        setBookingData(prev => ({
          ...prev,
          id: result.bookingId,
          bookingReference: result.bookingReference || prev.bookingReference
        }))
      }
    } catch (error) {
      console.error('Error saving booking to database:', error)
      // Don't fail the confirmation page if database save fails
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

  // Use your existing BookingConfirmation component
  return <BookingConfirmation bookingData={bookingData} />
}
'use client'
import { useEffect, useRef, useState } from 'react'

export default function TidyCalEmbed({ serviceId, onBookingComplete }) {
  const iframeRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Service mapping to TidyCal booking links
  const tidyCalLinks = {
    'teen-individual': 'https://book.tidycal.com/giltcounselling/individual-teen-session',
    'family-therapy': 'https://book.tidycal.com/giltcounselling/family-therapy',
    'parent-coaching': 'https://book.tidycal.com/giltcounselling/parent-coaching',
    'group-session': 'https://book.tidycal.com/giltcounselling/group-session'
  }

  useEffect(() => {
    // Listen for messages from TidyCal iframe
    const handleMessage = (event) => {
      // Verify origin for security
      if (!event.origin.includes('tidycal.com')) return

      // Handle different TidyCal events
      if (event.data.type === 'booking_completed') {
        const bookingData = {
          service: getServiceName(serviceId),
          date: event.data.date,
          time: event.data.time,
          duration: event.data.duration,
          tidyCalBookingId: event.data.bookingId,
          notes: event.data.notes || ''
        }
        
        onBookingComplete && onBookingComplete(bookingData)
      }

      if (event.data.type === 'iframe_loaded') {
        setIsLoading(false)
      }

      if (event.data.type === 'booking_error') {
        setError('Failed to complete booking. Please try again.')
      }
    }

    window.addEventListener('message', handleMessage)
    
    // Set a fallback timeout to hide loading
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false)
    }, 5000)

    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(loadingTimeout)
    }
  }, [serviceId, onBookingComplete])

  const getServiceName = (serviceId) => {
    const serviceNames = {
      'teen-individual': 'Individual Teen Session',
      'family-therapy': 'Family Therapy',
      'parent-coaching': 'Parent Coaching', 
      'group-session': 'Teen Group Session'
    }
    return serviceNames[serviceId] || 'Counselling Session'
  }

  const getTidyCalUrl = () => {
    const baseUrl = tidyCalLinks[serviceId]
    if (!baseUrl) {
      setError('Service not available for booking')
      return null
    }

    // Add query parameters for better integration
    const params = new URLSearchParams({
      embed: 'true',
      hideHeader: 'true',
      theme: 'light'
    })

    return `${baseUrl}?${params.toString()}`
  }

  const tidyCalUrl = getTidyCalUrl()

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Booking Error</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null)
            setIsLoading(true)
          }}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!tidyCalUrl) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Service Unavailable</h3>
        <p className="text-yellow-700">
          This service is not available for online booking. Please contact us directly.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-deepBlue font-medium">Loading calendar...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we prepare your booking options</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <iframe
          ref={iframeRef}
          src={tidyCalUrl}
          width="100%"
          height="600"
          frameBorder="0"
          title="Book Your Appointment"
          className="w-full"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false)
            setError('Failed to load booking calendar. Please refresh and try again.')
          }}
        />
      </div>

      {/* Alternative booking method */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Having trouble with the calendar?
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <a 
            href={tidyCalLinks[serviceId]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-secondary text-sm"
          >
            Open in New Window
          </a>
          <a 
            href="/contact" 
            className="btn-secondary text-sm"
          >
            Book by Phone
          </a>
        </div>
      </div>
    </div>
  )
}
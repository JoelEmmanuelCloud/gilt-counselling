'use client'
import { useEffect, useRef, useState } from 'react'

export default function TidyCalEmbed({ serviceId, onBookingComplete }) {
  const iframeRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [fallbackMode, setFallbackMode] = useState(false)

  // Updated service mapping to match your actual TidyCal URLs
  const tidyCalLinks = {
    'teen-individual': 'https://tidycal.com/giltcounselling/individual-teen-session',
    'family-therapy': 'https://tidycal.com/giltcounselling/family-therapy',
    'parent-coaching': 'https://tidycal.com/giltcounselling/parent-coaching',
    'group-session': 'https://tidycal.com/giltcounselling/group-session',

  }

  // Alternative booking links in case TidyCal is down
  const fallbackLinks = {
    'teen-individual': '/contact?service=individual-teen-session',
    'family-therapy': '/contact?service=family-therapy',
    'parent-coaching': '/contact?service=parent-coaching', 
    'group-session': '/contact?service=group-session',
  }

  useEffect(() => {
    // Listen for messages from TidyCal iframe
    const handleMessage = (event) => {
      // Verify origin for security - check for tidycal.com domain
      if (!event.origin.includes('tidycal.com')) return

      try {
        // Handle different TidyCal events
        if (event.data.type === 'booking_completed') {
          const bookingData = {
            service: getServiceName(serviceId),
            date: event.data.date,
            time: event.data.time,
            duration: '1 hour', // All services are 1 hour as per your setup
            tidyCalBookingId: event.data.bookingId,
            notes: event.data.notes || ''
          }
          
          onBookingComplete && onBookingComplete(bookingData)
        }

        if (event.data.type === 'iframe_loaded') {
          setIsLoading(false)
          setError(null)
        }

        if (event.data.type === 'booking_error') {
          setError('Failed to complete booking. Please try again or use alternative booking methods.')
        }
      } catch (msgError) {
        console.error('Error handling TidyCal message:', msgError)
      }
    }

    window.addEventListener('message', handleMessage)
    
    // Set a fallback timeout to hide loading
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false)
        if (!fallbackMode) {
          setError('Booking calendar is taking longer than expected to load.')
        }
      }
    }, 8000) // 8 second timeout

    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(loadingTimeout)
    }
  }, [serviceId, onBookingComplete, isLoading, fallbackMode])

  const getServiceName = (serviceId) => {
    const serviceNames = {
      'teen-individual': 'Individual Teen Session',
      'family-therapy': 'Family Therapy',
      'parent-coaching': 'Parent Coaching', 
      'group-session': 'Group Session',
      '60-minute-meeting': '60 Minute Meeting'
    }
    return serviceNames[serviceId] || 'Counselling Session'
  }

  const getTidyCalUrl = () => {
    const baseUrl = tidyCalLinks[serviceId]
    if (!baseUrl) {
      setError('Service not available for booking')
      return null
    }

    // Enhanced query parameters for better integration
    const params = new URLSearchParams({
      embed: 'true',
      hideHeader: 'true',
      hideFooter: 'true',
      hideBranding: 'false', // Keep TidyCal branding for trust
      theme: 'light',
      primary_color: 'D4AF37', // Gold color to match your theme
      background_color: 'FFFFFF',
      text_color: '000000',
      timezone: 'Africa/Lagos', // Set correct timezone for Nigeria
      start_date: new Date().toISOString().split('T')[0], // Start from today
      autosize: 'true'
    })

    return `${baseUrl}?${params.toString()}`
  }

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setRetryCount(prev => prev + 1)
    
    // Force iframe reload
    if (iframeRef.current) {
      iframeRef.current.src = getTidyCalUrl()
    }
  }

  const handleDirectBooking = () => {
    // Open TidyCal in new window for better experience
    const tidyCalUrl = tidyCalLinks[serviceId]
    if (tidyCalUrl) {
      window.open(tidyCalUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const getServiceDuration = (serviceId) => {
    // All services are 1 hour as per your TidyCal setup
    return '1 hour'
  }

  const tidyCalUrl = getTidyCalUrl()

  // Show fallback booking options if TidyCal is unavailable
  if (fallbackMode || error) {
    return (
      <div className="space-y-6">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Booking Calendar Unavailable
                </h3>
                <p className="text-yellow-700 mb-4">{error}</p>
                
                {!fallbackMode && retryCount < 3 && (
                  <button 
                    onClick={handleRetry}
                    className="btn-primary mr-3"
                  >
                    Try Again ({3 - retryCount} attempts left)
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alternative Booking Methods */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-deepBlue mb-4">
            Alternative Booking Methods
          </h3>
          <p className="text-gray-600 mb-6">
            Choose one of these options to schedule your {getServiceName(serviceId)}:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Phone Booking */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-gold transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">📞</span>
                <h4 className="font-semibold text-deepBlue">Call to Book</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Speak directly with our booking team to schedule your appointment.
              </p>
              <a 
                href="tel:+2348033094050"
                className="btn-primary w-full text-center"
              >
                Call +234 803 309 4050
              </a>
            </div>

            {/* Email Booking */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-gold transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">✉️</span>
                <h4 className="font-semibold text-deepBlue">Email Request</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Send us your preferred times and we'll confirm your appointment.
              </p>
              <a 
                href={`mailto:support@giltcounselling.com?subject=Booking Request - ${getServiceName(serviceId)}&body=I would like to book a ${getServiceName(serviceId)}. Please let me know your available times.`}
                className="btn-primary w-full text-center"
              >
                Email Us
              </a>
            </div>

            {/* Contact Form */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-gold transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">📝</span>
                <h4 className="font-semibold text-deepBlue">Contact Form</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Fill out our contact form with your booking request.
              </p>
              <a 
                href={fallbackLinks[serviceId]}
                className="btn-primary w-full text-center"
              >
                Contact Form
              </a>
            </div>

            {/* WhatsApp Booking */}
            <div className="border border-gray-200 rounded-lg p-4 hover:border-gold transition-colors">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">💬</span>
                <h4 className="font-semibold text-deepBlue">WhatsApp</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Quick booking via WhatsApp message.
              </p>
              <a 
                href={`https://wa.me/2348033094050?text=Hi! I'd like to book a ${getServiceName(serviceId)}. When do you have availability?`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full text-center"
              >
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Emergency Note */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If this is urgent or you're experiencing a mental health crisis, 
              please call our emergency line at <a href="tel:+2348033094050" className="underline">+234 803 309 4050</a> 
              or contact emergency services at 199.
            </p>
          </div>
        </div>
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
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-deepBlue font-medium">Loading calendar...</p>
            <p className="text-sm text-gray-500 mt-1">Please wait while we prepare your booking options</p>
            <div className="mt-4">
              <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                <div className="bg-gold h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden min-h-[700px]">
        <iframe
          ref={iframeRef}
          src={tidyCalUrl}
          width="100%"
          height="700"
          frameBorder="0"
          title={`Book Your ${getServiceName(serviceId)}`}
          className="w-full"
          onLoad={() => {
            setIsLoading(false)
            setError(null)
          }}
          onError={(e) => {
            console.error('TidyCal iframe error:', e)
            setIsLoading(false)
            setError('Failed to load booking calendar. Our booking system may be temporarily unavailable.')
          }}
          sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-popups"
          allow="camera; microphone; geolocation"
        />
      </div>

      {/* Alternative booking method always visible */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Having trouble with the calendar?
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={handleDirectBooking}
            className="btn-secondary text-sm"
          >
            Open in New Window
          </button>
          <a 
            href="tel:+2348033094050" 
            className="btn-secondary text-sm"
          >
            📞 Book by Phone
          </a>
          <a 
            href="/contact" 
            className="btn-secondary text-sm"
          >
            📝 Contact Form
          </a>
        </div>
      </div>
    </div>
  )
}
// app/booking/page.js 
'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import TidyCalEmbed from '@/components/booking/TidyCalEmbed'
import AuthForm from '@/components/forms/AuthForm'

export default function BookingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showAuthForm, setShowAuthForm] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [bookingStep, setBookingStep] = useState('select') // 'select', 'calendar', 'confirmation'
  const [bookingData, setBookingData] = useState({})
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)

  // Handle authentication and profile completion check
  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) return // Will show auth form

    // Admin users can access booking directly
    if (session.user.role === 'admin') return

    // For regular users, check if profile is complete
    checkProfileCompletion()
  }, [session, status, router, checkProfileCompletion])

  const checkProfileCompletion = async () => {
    setIsCheckingProfile(true)
    try {
      const response = await fetch('/api/complete-profile')
      if (response.ok) {
        const data = await response.json()
        if (!data.isProfileComplete) {
          // Profile not complete, redirect to complete profile
          router.push('/complete-profile')
          return
        }
      } else {
        // If API fails, redirect to complete profile to be safe
        router.push('/complete-profile')
        return
      }
    } catch (error) {
      console.error('Error checking profile completion:', error)
      // On error, redirect to complete profile to be safe
      router.push('/complete-profile')
      return
    } finally {
      setIsCheckingProfile(false)
    }
  }

  const services = [
    {
      id: 'teen-individual',
      name: 'Individual Teen Session',
      duration: '50 minutes',
      description: 'One-on-one counselling focused on teen-specific challenges and development.',
      features: ['Anxiety & Depression Support', 'Identity Development', 'Social Skills', 'Academic Stress']
    },
    {
      id: 'family-therapy',
      name: 'Family Therapy',
      duration: '75 minutes',
      description: 'Collaborative sessions to improve family communication and relationships.',
      features: ['Communication Skills', 'Conflict Resolution', 'Family Dynamics', 'Parenting Support']
    },
    {
      id: 'parent-coaching',
      name: 'Parent Coaching',
      duration: '60 minutes',
      description: 'Guidance for parents navigating teenage challenges and development.',
      features: ['Parenting Strategies', 'Setting Boundaries', 'Teen Mental Health', 'Crisis Management']
    },
    {
      id: 'group-session',
      name: 'Teen Group Session',
      duration: '90 minutes',
      description: 'Peer support groups for teens facing similar challenges.',
      features: ['Peer Support', 'Social Skills', 'Shared Learning', 'Community Connection']
    }
  ]

  // Handle service selection
  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setBookingStep('calendar')
    setBookingData({ ...bookingData, service: service })
  }

  // Handle booking completion from TidyCal
  const handleBookingComplete = async (tidyCalData) => {
    const completeBookingData = {
      ...bookingData,
      ...tidyCalData,
      status: 'pending'
    }
    
    setBookingData(completeBookingData)
    
    // Save booking to database
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: tidyCalData.service,
          date: tidyCalData.date,
          time: tidyCalData.time,
          duration: tidyCalData.duration,
          notes: tidyCalData.notes || '',
          tidyCalBookingId: tidyCalData.tidyCalBookingId
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setBookingData(prev => ({ ...prev, id: result.bookingId, bookingReference: result.bookingReference }))
        setBookingStep('confirmation')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save booking')
      }
    } catch (error) {
      console.error('Error saving booking:', error)
      alert('Booking saved in TidyCal but there was an issue with our system. Please contact us with your booking details.')
      // Still show confirmation but with a warning
      setBookingStep('confirmation')
    }
  }

  // Loading states
  if (status === 'loading' || (session && session.user.role !== 'admin' && isCheckingProfile)) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-deepBlue">
            {status === 'loading' ? 'Loading session...' : 'Checking profile...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">Status: {status}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <section className="bg-white shadow-sm">
        <div className="container-max section-padding py-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-playfair text-4xl font-bold text-deepBlue mb-4">
              Book Your Session
            </h1>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 font-semibold mb-2">✨ Professional Mental Health Support</p>
              <p className="text-blue-700 text-sm">
                Quality counselling services to support your mental health and wellbeing journey.
              </p>
            </div>
            <p className="text-lg text-gray-600">
              Schedule your counselling session with Gilt Counselling.
              Choose a time that works best for you or your family, and begin your journey with our lead counsellor, Dr. Ugwu.
            </p>
            
            {/* Progress Indicator - Only show when authenticated */}
            {session && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center ${bookingStep === 'select' ? 'text-gold' : bookingStep === 'calendar' || bookingStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${bookingStep === 'select' ? 'bg-gold text-white' : bookingStep === 'calendar' || bookingStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      1
                    </div>
                    <span className="ml-2 text-sm font-medium">Select Service</span>
                  </div>
                  
                  <div className={`w-8 h-0.5 ${bookingStep === 'calendar' || bookingStep === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                  
                  <div className={`flex items-center ${bookingStep === 'calendar' ? 'text-gold' : bookingStep === 'confirmation' ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${bookingStep === 'calendar' ? 'bg-gold text-white' : bookingStep === 'confirmation' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      2
                    </div>
                    <span className="ml-2 text-sm font-medium">Choose Time</span>
                  </div>
                  
                  <div className={`w-8 h-0.5 ${bookingStep === 'confirmation' ? 'bg-green-600' : 'bg-gray-200'}`}></div>
                  
                  <div className={`flex items-center ${bookingStep === 'confirmation' ? 'text-gold' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${bookingStep === 'confirmation' ? 'bg-gold text-white' : 'bg-gray-200 text-gray-600'}`}>
                      3
                    </div>
                    <span className="ml-2 text-sm font-medium">Confirmation</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-max section-padding">
        {!session ? (
          // Authentication Section
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="font-playfair text-2xl font-semibold text-deepBlue mb-4 text-center">
                Sign In to Continue
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Please sign in to your account to book a session. We'll send you a magic link 
                via email - no password needed!
              </p>
              
              {!showAuthForm ? (
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="btn-primary w-full"
                >
                  Continue with Email
                </button>
              ) : (
                <AuthForm />
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                New to Gilt Counselling? Creating an account only takes a moment.
              </p>
            </div>
          </div>
        ) : bookingStep === 'select' ? (
          // Service Selection Step
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-playfair text-2xl font-semibold text-deepBlue mb-2">
                Choose Your Session Type
              </h2>
              <p className="text-gray-600">
                Select the counselling service that best fits your needs. All services are completely free.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div 
                  key={service.id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-gold"
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-1">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500">{service.duration}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-deepBlue">{service.duration}</div>
                      <div className="text-xs text-gray-500">session length</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{service.description}</p>

                  <div className="space-y-2 mb-6">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 bg-gold rounded-full mr-2 flex-shrink-0"></span>
                        {feature}
                      </div>
                    ))}
                  </div>

                  <button className="w-full btn-primary">
                    Select This Service
                  </button>
                </div>
              ))}
            </div>

            {/* Additional Information */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">🏥</div>
                <h3 className="font-semibold text-deepBlue mb-2">Professional Care</h3>
                <p className="text-sm text-gray-600">Licensed counsellors providing evidence-based mental health support.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">💻</div>
                <h3 className="font-semibold text-deepBlue mb-2">In-Person & Virtual</h3>
                <p className="text-sm text-gray-600">Choose between in-office visits or secure video sessions.</p>
              </div>
              
              <div className="bg-white rounded-lg p-6 text-center">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-semibold text-deepBlue mb-2">Confidential & Safe</h3>
                <p className="text-sm text-gray-600">Your privacy is protected with professional confidentiality standards.</p>
              </div>
            </div>
          </div>
        ) : bookingStep === 'calendar' ? (
          // Calendar Selection Step
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Back Button */}
            <div className="lg:col-span-3 mb-4">
              <button
                onClick={() => setBookingStep('select')}
                className="flex items-center text-gold hover:text-yellow-600 transition-colors"
              >
                <span className="mr-2">←</span>
                Back to Service Selection
              </button>
            </div>

            {/* Booking Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="mb-6">
                  <h2 className="font-playfair text-2xl font-semibold text-deepBlue mb-2">
                    Select Your Appointment Time
                  </h2>
                  <p className="text-gray-600">
                    Service: <span className="font-medium text-deepBlue">{selectedService?.name}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Duration: {selectedService?.duration}
                  </p>
                </div>
                
                <TidyCalEmbed 
                  serviceId={selectedService?.id}
                  onBookingComplete={handleBookingComplete}
                />
              </div>
            </div>

            {/* Sidebar Information */}
            <div className="space-y-6">
              {/* Selected Service Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
                  Your Selection
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-deepBlue">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-deepBlue">{selectedService?.duration}</span>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
                  Need Help?
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-gold">📞</span>
                    <div>
                      <p className="font-medium text-deepBlue">Phone</p>
                      <a href="tel:+2348033094050" className="text-sm text-gray-600 hover:text-gold">
                        +234 803 309 4050
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gold">✉️</span>
                    <div>
                      <p className="font-medium text-deepBlue">Email</p>
                      <a href="mailto:wecare@giltcounselling.com" className="text-sm text-gray-600 hover:text-gold">
                        wecare@giltcounselling.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-gold">🕒</span>
                    <div>
                      <p className="font-medium text-deepBlue">Hours</p>
                      <p className="text-sm text-gray-600">Mon-Fri 9AM-6PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Support Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-playfair text-lg font-semibold text-blue-800 mb-3">
                  Professional Mental Health Support
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Quality counselling services provided by licensed professionals to support your wellbeing journey.
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Licensed, qualified counsellors</li>
                  <li>• Confidential and safe environment</li>
                  <li>• Evidence-based therapeutic approaches</li>
                  <li>• Flexible scheduling options</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Confirmation Step - Use your existing BookingConfirmation component
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">✅</span>
              </div>
              
              <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-4">
                Booking Confirmed!
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                Thank you for booking with Gilt Counselling. We've sent a confirmation 
                email with your appointment details.
              </p>

              {/* Booking Details */}
              <div className="bg-cream rounded-lg p-6 mb-8 text-left">
                <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
                  Your Appointment Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-deepBlue">{bookingData.service}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-deepBlue">{bookingData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-deepBlue">{bookingData.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-deepBlue">{bookingData.duration}</span>
                  </div>
                  {bookingData.bookingReference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reference:</span>
                      <span className="font-mono text-sm text-deepBlue">{bookingData.bookingReference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/" className="btn-primary flex-1">
                  Return to Home
                </Link>
                <button
                  onClick={() => {
                    setBookingStep('select')
                    setSelectedService(null)
                    setBookingData({})
                  }}
                  className="btn-secondary flex-1"
                >
                  Book Another Session
                </button>
              </div>

              {/* Contact Information */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">
                  Questions about your appointment?
                </p>
                <div className="flex justify-center space-x-6 text-sm">
                  <a href="tel:+2348033094050" className="text-gold hover:text-yellow-600">
                    📞 +234 803 309 4050
                  </a>
                  <a href="mailto:wecare@giltcounselling.com" className="text-gold hover:text-yellow-600">
                    ✉️ Email Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
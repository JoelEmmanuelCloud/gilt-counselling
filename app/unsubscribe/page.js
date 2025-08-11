//app/unsubscribe/page.js
'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Component that uses useSearchParams - wrapped in Suspense
function UnsubscribeContent() {
  const [status, setStatus] = useState('loading')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const handleUnsubscribe = async () => {
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      
      if (response.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
        <img 
          src="http://cdn.mcauto-images-production.sendgrid.net/f638e50cb4cb3520/34bd0630-cd7e-4a70-8826-a64f790e3fba/1024x1024.png" 
          alt="Gilt Counselling" 
          className="w-16 h-16 rounded-full mx-auto mb-4"
        />
        
        {status === 'loading' && email && (
          <>
            <h1 className="font-playfair text-2xl font-bold text-deepBlue mb-4">
              Unsubscribe from Newsletter
            </h1>
            <p className="text-gray-600 mb-6">
              Are you sure you want to unsubscribe {email} from our newsletter?
            </p>
            <div className="space-y-3">
              <button onClick={handleUnsubscribe} className="btn-primary w-full">
                Yes, Unsubscribe
              </button>
              <button onClick={() => window.history.back()} className="btn-secondary w-full">
                Cancel
              </button>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <h1 className="font-playfair text-2xl font-bold text-deepBlue mb-4">
              Successfully Unsubscribed
            </h1>
            <p className="text-gray-600 mb-6">
              You have been removed from our newsletter list. We&apos;re sorry to see you go!
            </p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <h1 className="font-playfair text-2xl font-bold text-red-600 mb-4">
              Error
            </h1>
            <p className="text-gray-600 mb-6">
              There was an error processing your request. Please try again or contact us directly.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// Loading component
function UnsubscribeLoading() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function UnsubscribePage() {
  return (
    <Suspense fallback={<UnsubscribeLoading />}>
      <UnsubscribeContent />
    </Suspense>
  )
}
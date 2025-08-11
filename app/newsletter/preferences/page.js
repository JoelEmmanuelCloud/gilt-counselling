//app/newsletter/preferences/page.js
'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

// Component that uses useSearchParams - wrapped in Suspense
function NewsletterPreferencesContent() {
  const [preferences, setPreferences] = useState({
    weekly_newsletter: true,
    blog_updates: true,
    event_notifications: false,
    special_offers: true
  })
  const [status, setStatus] = useState('loading')
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const handleSave = async () => {
    try {
      const response = await fetch('/api/newsletter/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, preferences })
      })
      
      if (response.ok) {
        setStatus('saved')
      } else {
        setStatus('error')
      }
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="text-center mb-8">
          <img 
            src="http://cdn.mcauto-images-production.sendgrid.net/f638e50cb4cb3520/34bd0630-cd7e-4a70-8826-a64f790e3fba/1024x1024.png" 
            alt="Gilt Counselling" 
            className="w-16 h-16 rounded-full mx-auto mb-4"
          />
          <h1 className="font-playfair text-3xl font-bold text-deepBlue mb-2">
            Email Preferences
          </h1>
          <p className="text-gray-600">Customize what emails you receive from us</p>
        </div>

        <div className="space-y-6">
          {Object.entries({
            weekly_newsletter: 'Weekly Newsletter - Mental health insights and tips',
            blog_updates: 'Blog Updates - New articles and resources',
            event_notifications: 'Event Notifications - Workshops and webinars',
            special_offers: 'Special Offers - Discounts and promotions'
          }).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <span className="text-deepBlue">{label}</span>
              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={(e) => setPreferences({
                  ...preferences,
                  [key]: e.target.checked
                })}
                className="w-5 h-5 text-gold focus:ring-gold border-gray-300 rounded"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button onClick={handleSave} className="btn-primary">
            Save Preferences
          </button>
          {status === 'saved' && (
            <p className="text-green-600 mt-4">Preferences saved successfully!</p>
          )}
        </div>
      </div>
    </div>
  )
}

// Loading component
function PreferencesLoading() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading preferences...</p>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function NewsletterPreferencesPage() {
  return (
    <Suspense fallback={<PreferencesLoading />}>
      <NewsletterPreferencesContent />
    </Suspense>
  )
}
//components/forms/NewsletterSignup.js
'use client'
import { useState } from 'react'

export default function NewsletterSignup({ className = '', variant = 'default' }) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(true)
        setMessage('Thank you for subscribing! Check your email to confirm.')
        setEmail('')
      } else {
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setMessage('Network error. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubscribed && variant === 'inline') {
    return (
      <div className={`text-center p-4 bg-green-50 border border-green-200 rounded-lg ${className}`}>
        <div className="text-2xl mb-2">✉️</div>
        <p className="text-green-800 font-medium">Successfully subscribed!</p>
        <p className="text-green-600 text-sm">Check your email to confirm your subscription.</p>
      </div>
    )
  }

  // Compact inline variant
  if (variant === 'inline') {
    return (
      <div className={`bg-cream rounded-lg p-4 ${className}`}>
        <div className="text-center mb-3">
          <h3 className="font-playfair text-lg font-semibold text-deepBlue mb-1">
            Stay Updated
          </h3>
          <p className="text-sm text-gray-600">
            Get mental health tips and resources weekly
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gold focus:border-transparent"
          />
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gold hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>

          {message && (
            <p className={`text-xs text-center ${
              message.includes('Thank you') || message.includes('Success')
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {message}
            </p>
          )}
        </form>
      </div>
    )
  }

  // Full-width footer variant
  return (
    <div className={`${className}`}>
      <div className="text-center mb-6">
        <h3 className="font-playfair text-2xl font-bold text-deepBlue mb-2">
          Mental Health Newsletter
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Get weekly insights on teen mental health, parenting tips, and family wellness 
          delivered to your inbox.
        </p>
      </div>

      {isSubscribed ? (
        <div className="max-w-md mx-auto text-center p-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-4xl mb-3">🎉</div>
          <h4 className="font-playfair text-xl font-semibold text-green-800 mb-2">
            Welcome to Our Community!
          </h4>
          <p className="text-green-700 mb-3">
            Thank you for subscribing to our mental health newsletter.
          </p>
          <p className="text-green-600 text-sm">
            Check your email for a confirmation link to complete your subscription.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          {message && (
            <p className={`mt-3 text-sm text-center ${
              message.includes('Thank you') || message.includes('Success')
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {message}
            </p>
          )}

          <p className="text-xs text-gray-500 text-center mt-3">
            No spam, unsubscribe anytime. We respect your privacy and will never sell your information.
          </p>
        </form>
      )}
    </div>
  )
}

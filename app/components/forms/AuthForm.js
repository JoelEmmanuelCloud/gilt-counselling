//components/forms/AuthForm.js
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/booking'
      })

      if (result?.error) {
        setMessage('There was an error sending the magic link. Please try again.')
      } else {
        setMessage('Check your email! We\'ve sent you a magic link to sign in.')
      }
    } catch (error) {
      setMessage('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-deepBlue mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
          placeholder="your@email.com"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Sending Magic Link...' : 'Send Magic Link'}
      </button>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('error') || message.includes('wrong')
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        We'll send you a secure link to access your account. No password required!
      </p>
    </form>
  )
}
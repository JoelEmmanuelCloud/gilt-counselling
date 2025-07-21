//app/auth/verify/page.js
import Link from 'next/link'

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📧</span>
          </div>
          
          <h1 className="font-playfair text-2xl font-bold text-deepBlue mb-4">
            Check Your Email
          </h1>
          
          <p className="text-gray-600 mb-6">
            We've sent you a magic link to sign in to your account. 
            Please check your email and click the link to continue.
          </p>

          <div className="bg-cream p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">
              <strong>Didn't receive the email?</strong><br />
              Check your spam folder or try signing in again.
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/signin" className="btn-primary w-full">
              Try Again
            </Link>
            <Link 
              href="/"
              className="block text-sm text-gold hover:text-yellow-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// components/dashboard/MessageReplyModal.js
'use client'
import { useState } from 'react'

export default function MessageReplyModal({ message, isOpen, onClose, onReplySuccess }) {
  const [replyForm, setReplyForm] = useState({
    subject: message ? `Re: ${message.subject}` : '',
    message: '',
    senderName: 'Dr. Ugwu - Gilt Counselling'
  })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError('')

    try {
      const response = await fetch('/api/messages/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageId: message._id,
          replySubject: replyForm.subject,
          replyMessage: replyForm.message,
          senderName: replyForm.senderName
        }),
      })

      const result = await response.json()

      if (response.ok) {
        onReplySuccess?.()
        onClose()
        // Reset form
        setReplyForm({
          subject: '',
          message: '',
          senderName: 'Dr. Ugwu - Gilt Counselling'
        })
        alert('Reply sent successfully!')
      } else {
        setError(result.error || 'Failed to send reply')
      }
    } catch (error) {
      console.error('Error sending reply:', error)
      setError('Failed to send reply. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleInputChange = (field, value) => {
    setReplyForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!isOpen || !message) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-deepBlue to-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-playfair text-xl font-semibold text-white">
                Reply to Message
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                Sending reply to {message.name} ({message.email})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl p-2"
            >
              ×
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Original Message */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-playfair text-lg font-semibold text-deepBlue mb-4">
              Original Message
            </h4>
            
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">From:</span>
                  <p className="text-gray-900">{message.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{message.email}</p>
                </div>
              </div>
              
              {message.phone && (
                <div>
                  <span className="font-medium text-gray-700">Phone:</span>
                  <p className="text-gray-900">{message.phone}</p>
                </div>
              )}
              
              <div>
                <span className="font-medium text-gray-700">Subject:</span>
                <p className="text-gray-900 font-medium">{message.subject}</p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Priority:</span>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                  message.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                  message.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {message.urgency}
                </span>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Received:</span>
                <p className="text-gray-900">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
              
              <div>
                <span className="font-medium text-gray-700">Message:</span>
                <div className="bg-white p-3 rounded border mt-2 max-h-40 overflow-y-auto">
                  <p className="text-gray-900 whitespace-pre-wrap text-sm">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reply Form */}
          <div>
            <h4 className="font-playfair text-lg font-semibold text-deepBlue mb-4">
              Compose Reply
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={replyForm.senderName}
                  onChange={(e) => handleInputChange('senderName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={replyForm.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Reply *
                </label>
                <textarea
                  value={replyForm.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                  placeholder="Type your professional reply here..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This message will be sent via email with Gilt Counselling branding
                </p>
              </div>

              {/* Quick Reply Templates */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quick Templates
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    {
                      label: 'Thank you & Appointment',
                      text: `Thank you for reaching out to Gilt Counselling. I appreciate you taking the time to contact us about your mental health needs.

I would love to schedule a consultation to discuss how we can best support you. Please visit our booking page or call us at +234 803 309 4050 to schedule an appointment that works for your schedule.

Looking forward to supporting you on your wellness journey.`
                    },
                    {
                      label: 'Information Request',
                      text: `Thank you for your inquiry about our counselling services. I'm happy to provide you with more information about how we can support your mental health and wellness goals.

Our services include individual therapy, family counselling, and specialized teen support. All sessions are conducted in a safe, confidential environment designed to promote healing and growth.

Please feel free to call us at +234 803 309 4050 if you'd like to discuss your specific needs or have any questions.`
                    },
                    {
                      label: 'Crisis Support',
                      text: `Thank you for reaching out during what may be a difficult time. Your wellbeing is our priority, and I want to ensure you get the support you need.

If this is an emergency, please contact emergency services immediately or call our crisis line at +234 803 309 4050.

For ongoing support, I'd like to schedule a priority consultation to discuss how we can best help you. Please let me know your availability, and we'll arrange something as soon as possible.`
                    }
                  ].map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleInputChange('message', template.text)}
                      className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border text-sm transition-colors"
                    >
                      <span className="font-medium text-deepBlue">{template.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={sending || !replyForm.message.trim()}
                  className="flex-1 bg-gold text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sending ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending Reply...
                    </span>
                  ) : (
                    '📧 Send Reply'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            This reply will be sent with professional Gilt Counselling branding and contact information
          </p>
        </div>
      </div>
    </div>
  )
}
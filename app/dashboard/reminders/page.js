// app/dashboard/reminders/page.js
'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/dashboard/AdminLayout'
import DashboardAuthWrapper from '@/components/dashboard/DashboardAuthWrapper'
import { useBookings } from '@/hooks/useBookings'
import { formatDate, formatTime, getRelativeTime } from '@/lib/utils'

export default function RemindersPage() {
  const { bookings, loading } = useBookings()
  const [sending, setSending] = useState(false)
  const [testResults, setTestResults] = useState(null)
  const [customReminder, setCustomReminder] = useState({
    bookingId: '',
    subject: '',
    message: '',
    sending: false
  })

  // Filter upcoming bookings that need reminders
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date)
    const now = new Date()
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return bookingDate >= now && 
           bookingDate <= next7Days && 
           ['pending', 'confirmed'].includes(booking.status)
  }).sort((a, b) => new Date(a.date) - new Date(b.date))

  // Test reminder system
  const testReminderSystem = async () => {
    setSending(true)
    setTestResults(null)
    
    try {
      const response = await fetch('/api/reminders/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      setTestResults(result)
    } catch (error) {
      setTestResults({
        success: false,
        error: error.message
      })
    } finally {
      setSending(false)
    }
  }

  // Send custom reminder
  const sendCustomReminder = async (e) => {
    e.preventDefault()
    
    if (!customReminder.bookingId || !customReminder.message) {
      alert('Please select a booking and enter a message')
      return
    }
    
    setCustomReminder(prev => ({ ...prev, sending: true }))
    
    try {
      const response = await fetch('/api/reminders/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: customReminder.bookingId,
          subject: customReminder.subject || 'Important Message - Gilt Counselling',
          message: customReminder.message
        }),
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Custom reminder sent successfully!')
        setCustomReminder({
          bookingId: '',
          subject: '',
          message: '',
          sending: false
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      alert(`Error sending reminder: ${error.message}`)
    } finally {
      setCustomReminder(prev => ({ ...prev, sending: false }))
    }
  }

  // Get reminder status for a booking
  const getReminderStatus = (booking) => {
    const now = new Date()
    const bookingDate = new Date(booking.date)
    const hoursUntil = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    const reminders = booking.reminders || {}
    const status = []
    
    if (hoursUntil <= 192 && hoursUntil >= 144) { // 6-8 days
      status.push({
        type: '7-day',
        sent: !!reminders.weekBeforeSent,
        due: !reminders.weekBeforeSent
      })
    }
    
    if (hoursUntil <= 25 && hoursUntil >= 23) { // 23-25 hours
      status.push({
        type: '24-hour',
        sent: !!reminders.dayBeforeSent,
        due: !reminders.dayBeforeSent
      })
    }
    
    if (hoursUntil <= 2.5 && hoursUntil >= 1.5) { // 1.5-2.5 hours
      status.push({
        type: '2-hour',
        sent: !!reminders.twoHoursSent,
        due: !reminders.twoHoursSent
      })
    }
    
    return status
  }

  if (loading) {
    return (
      <DashboardAuthWrapper>
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      </AdminLayout>
      </DashboardAuthWrapper>
    )
  }

  return (
    <DashboardAuthWrapper>
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-deepBlue">
              Reminder Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage appointment reminders and notifications
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={testReminderSystem}
              disabled={sending}
              className="btn-secondary flex items-center space-x-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-deepBlue"></div>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <span>🧪</span>
                  <span>Test System</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Test Results */}
        {testResults && (
          <div className={`p-4 rounded-lg border ${
            testResults.success 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <h3 className="font-semibold mb-2">Test Results</h3>
            {testResults.success ? (
              <div>
                <p>✅ Reminder system test completed successfully</p>
                <p className="text-sm mt-1">
                  Sent: {testResults.results?.sent || 0} | 
                  Failed: {testResults.results?.failed || 0}
                </p>
              </div>
            ) : (
              <p>❌ Test failed: {testResults.error}</p>
            )}
          </div>
        )}

        {/* Reminder System Status */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">7-Day Reminders</h3>
              <p className="text-sm text-blue-600">Sent 1 week before appointment</p>
              <p className="text-xs text-blue-500 mt-1">Includes preparation tips</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">24-Hour Reminders</h3>
              <p className="text-sm text-green-600">Sent 1 day before appointment</p>
              <p className="text-xs text-green-500 mt-1">Includes what to bring</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-800">2-Hour Reminders</h3>
              <p className="text-sm text-orange-600">Sent 2 hours before appointment</p>
              <p className="text-xs text-orange-500 mt-1">Final preparation reminder</p>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
            Upcoming Appointments ({upcomingBookings.length})
          </h2>
          
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📅</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
              <p className="text-gray-500">No appointments scheduled for the next 7 days.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Until
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reminder Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingBookings.map((booking) => {
                    const reminderStatus = getReminderStatus(booking)
                    
                    return (
                      <tr key={booking._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.userName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.userEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{booking.service}</div>
                            <div className="text-sm text-gray-500">
                              {formatDate(booking.date)} at {formatTime(booking.time)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getRelativeTime(booking.date)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {reminderStatus.length === 0 ? (
                              <span className="text-xs text-gray-500">No reminders due</span>
                            ) : (
                              reminderStatus.map((status, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    status.sent
                                      ? 'bg-green-100 text-green-800'
                                      : status.due
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {status.type} {status.sent ? '✓' : status.due ? '⏳' : ''}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => setCustomReminder(prev => ({
                              ...prev,
                              bookingId: booking._id
                            }))}
                            className="text-gold hover:text-yellow-600 transition-colors"
                          >
                            Send Custom
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Custom Reminder Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
            Send Custom Reminder
          </h2>
          
          <form onSubmit={sendCustomReminder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Booking
              </label>
              <select
                value={customReminder.bookingId}
                onChange={(e) => setCustomReminder(prev => ({
                  ...prev,
                  bookingId: e.target.value
                }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              >
                <option value="">Choose a booking...</option>
                {upcomingBookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    {booking.userName} - {booking.service} - {formatDate(booking.date)} at {formatTime(booking.time)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject (Optional)
              </label>
              <input
                type="text"
                value={customReminder.subject}
                onChange={(e) => setCustomReminder(prev => ({
                  ...prev,
                  subject: e.target.value
                }))}
                placeholder="Important Message - Gilt Counselling"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gold focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={customReminder.message}
                onChange={(e) => setCustomReminder(prev => ({
                  ...prev,
                  message: e.target.value
                }))}
                placeholder="Enter your custom message for the client..."
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be sent along with the appointment details.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setCustomReminder({
                  bookingId: '',
                  subject: '',
                  message: '',
                  sending: false
                })}
                className="btn-secondary"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={customReminder.sending}
                className="btn-primary flex items-center space-x-2"
              >
                {customReminder.sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>📧</span>
                    <span>Send Reminder</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Setup Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="font-playfair text-xl font-semibold text-blue-800 mb-4">
            Automated Reminder Setup
          </h2>
          <div className="space-y-3 text-sm text-blue-700">
            <p>
              <strong>Current Status:</strong> Manual testing available. Set up automated reminders using one of these methods:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Vercel Cron:</strong> Add cron configuration to vercel.json</li>
              <li><strong>External Cron:</strong> Use cron-job.org to call /api/reminders/send every 2 hours</li>
              <li><strong>GitHub Actions:</strong> Set up workflow for automated reminders</li>
            </ul>
            <p className="mt-3">
              <strong>Recommendation:</strong> Run reminder checks every 2 hours for optimal timing.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
    </DashboardAuthWrapper>
  )
}
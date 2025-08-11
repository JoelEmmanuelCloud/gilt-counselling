// components/dashboard/BookingsTable.js
'use client'
import { useState, useEffect } from 'react'
import { formatDate, formatTime, getStatusColor } from '@/lib/utils'

export default function BookingsTable() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showUrgentMessage, setShowUrgentMessage] = useState(false)
  const [urgentMessage, setUrgentMessage] = useState('')

  useEffect(() => {
    fetchBookings()
    // Auto-sync every 5 minutes
    const interval = setInterval(syncWithTidyCal, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const syncWithTidyCal = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/bookings/sync', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        // Refresh bookings after sync
        await fetchBookings()
      }
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  const sendUrgentMessage = async () => {
    if (!selectedBooking || !urgentMessage.trim()) return

    try {
      const response = await fetch('/api/bookings/urgent-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedBooking._id,
          tidyCalBookingId: selectedBooking.tidyCalBookingId,
          message: urgentMessage
        })
      })

      if (response.ok) {
        setShowUrgentMessage(false)
        setUrgentMessage('')
        setSelectedBooking(null)
        await fetchBookings() // Refresh to show the message was sent
        alert('Urgent message sent successfully!')
      }
    } catch (error) {
      console.error('Error sending urgent message:', error)
      alert('Failed to send urgent message')
    }
  }

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true
    if (filter === 'today') {
      const today = new Date().toISOString().split('T')[0]
      return booking.date === today
    }
    if (filter === 'upcoming') {
      const today = new Date()
      const bookingDate = new Date(booking.date)
      return bookingDate >= today
    }
    return booking.status === filter
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt)
    if (sortBy === 'date') return new Date(a.date) - new Date(b.date)
    return 0
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with Sync Button */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-playfair text-2xl font-semibold text-deepBlue mb-4 sm:mb-0">
            TidyCal Bookings
          </h2>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={syncWithTidyCal}
              disabled={syncing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <span className={`mr-2 ${syncing ? 'animate-spin' : ''}`}>
                {syncing ? '🔄' : '🔄'}
              </span>
              {syncing ? 'Syncing...' : 'Sync with TidyCal'}
            </button>
            
            {bookings.length > 0 && bookings[0].lastSyncedAt && (
              <span className="text-xs text-gray-500">
                Last sync: {formatTime(bookings[0].lastSyncedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['all', 'today', 'upcoming', 'confirmed', 'cancelled'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-gold text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-deepBlue">{bookings.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'confirmed').length}
            </div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => {
                const today = new Date().toISOString().split('T')[0]
                return b.date === today
              }).length}
            </div>
            <div className="text-sm text-gray-600">Today</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {bookings.filter(b => {
                const today = new Date()
                const bookingDate = new Date(b.date)
                const diffTime = bookingDate - today
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                return diffDays >= 0 && diffDays <= 7
              }).length}
            </div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TidyCal ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <div className="text-4xl mb-2">📅</div>
                  <div>No bookings found</div>
                  <div className="text-sm mt-1">
                    {filter !== 'all' ? `No ${filter} bookings` : 'No bookings yet'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium text-deepBlue">{booking.userName}</div>
                      <div className="text-sm text-gray-600">{booking.userEmail}</div>
                      {booking.phoneNumber && (
                        <div className="text-sm text-gray-500">{booking.phoneNumber}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{booking.service}</div>
                    <div className="text-sm text-gray-600">{booking.duration}</div>
                    {booking.notes && (
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {booking.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {formatDate(booking.date)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.time}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.timezone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-600">
                      {booking.tidyCalBookingId}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ref: {booking.bookingReference}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex flex-col space-y-1">
                      {booking.meetingUrl && (
                        <a
                          href={booking.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          📹 Join Meeting
                        </a>
                      )}
                      <button
                        onClick={() => {
                          setSelectedBooking(booking)
                          setShowUrgentMessage(true)
                        }}
                        className="text-orange-600 hover:text-orange-800 font-medium text-left"
                      >
                        📧 Send Message
                      </button>
                      <button className="text-gold hover:text-yellow-600 font-medium text-left">
                        👁️ View Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Urgent Message Modal */}
      {showUrgentMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
              Send Urgent Message
            </h3>
            <p className="text-gray-600 mb-4">
              Sending to: <strong>{selectedBooking?.userName}</strong>
            </p>
            <textarea
              value={urgentMessage}
              onChange={(e) => setUrgentMessage(e.target.value)}
              placeholder="Enter your urgent message..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
              rows="4"
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={sendUrgentMessage}
                disabled={!urgentMessage.trim()}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Send Message
              </button>
              <button
                onClick={() => {
                  setShowUrgentMessage(false)
                  setUrgentMessage('')
                  setSelectedBooking(null)
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
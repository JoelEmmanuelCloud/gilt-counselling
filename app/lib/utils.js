// lib/utils.js

/**
 * Format a date string or Date object to a readable format
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date'
  
  const defaultOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

/**
 * Format a time string to a readable format
 * @param {string} time - Time string (e.g., "14:30")
 * @returns {string} Formatted time string
 */
export function formatTime(time) {
  if (!time) return 'N/A'
  
  try {
    // Handle different time formats
    let timeObj
    
    if (time.includes(':')) {
      // Format: "14:30" or "2:30 PM"
      const [hours, minutes] = time.split(':')
      timeObj = new Date()
      timeObj.setHours(parseInt(hours), parseInt(minutes.replace(/[^\d]/g, '')), 0, 0)
    } else {
      // Try to parse as a full date/time string
      timeObj = new Date(time)
    }
    
    if (isNaN(timeObj.getTime())) return time // Return original if can't parse
    
    return timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch (error) {
    return time // Return original time if formatting fails
  }
}

/**
 * Get CSS classes for booking status badges
 * @param {string} status - The booking status
 * @returns {string} CSS classes for styling
 */
export function getStatusColor(status) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800', 
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    rescheduled: 'bg-orange-100 text-orange-800'
  }
  
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get human-readable status text
 * @param {string} status - The booking status
 * @returns {string} Human-readable status
 */
export function getStatusText(status) {
  const statusTexts = {
    pending: 'Pending Confirmation',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rescheduled: 'Rescheduled'
  }
  
  return statusTexts[status] || status
}

/**
 * Format a date for HTML date input
 * @param {string|Date} date - The date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date) {
  if (!date) return ''
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return ''
  
  return dateObj.toISOString().split('T')[0]
}

/**
 * Check if a date is in the past
 * @param {string|Date} date - The date to check
 * @returns {boolean} True if date is in the past
 */
export function isPastDate(date) {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  return dateObj < today
}

/**
 * Check if a booking is upcoming (within next 7 days)
 * @param {string|Date} date - The booking date
 * @returns {boolean} True if booking is upcoming
 */
export function isUpcoming(date) {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  
  return dateObj >= today && dateObj <= nextWeek
}

/**
 * Calculate time difference between two dates
 * @param {string|Date} date1 - First date
 * @param {string|Date} date2 - Second date (defaults to now)
 * @returns {Object} Object with days, hours, minutes difference
 */
export function getTimeDifference(date1, date2 = new Date()) {
  const dateObj1 = typeof date1 === 'string' ? new Date(date1) : date1
  const dateObj2 = typeof date2 === 'string' ? new Date(date2) : date2
  
  const diffMs = Math.abs(dateObj1 - dateObj2)
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  return { days: diffDays, hours: diffHours, minutes: diffMinutes }
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 * @param {string|Date} date - The date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return 'Unknown'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = dateObj - now
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (Math.abs(diffDays) >= 1) {
    return diffDays > 0 ? `in ${diffDays} day${diffDays !== 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`
  } else if (Math.abs(diffHours) >= 1) {
    return diffHours > 0 ? `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}` : `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ago`
  } else if (Math.abs(diffMinutes) >= 1) {
    return diffMinutes > 0 ? `in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}` : `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) !== 1 ? 's' : ''} ago`
  } else {
    return 'Just now'
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid
 */
export function isValidPhone(phone) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Format phone number for display
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
  if (!phone) return ''
  
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.startsWith('234') && cleaned.length === 13) {
    // Nigerian number with country code
    return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  } else if (cleaned.length === 10) {
    // Nigerian number without country code
    return `0${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    // Nigerian number with leading 0
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  
  return phone // Return original if can't format
}

/**
 * Generate a random booking reference
 * @returns {string} Random booking reference
 */
export function generateBookingReference() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = 'GB-' // Gilt Booking prefix
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Capitalize first letter of each word
 * @param {string} str - String to capitalize
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return ''
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} Truncated text
 */
export function truncate(text, length = 100) {
  if (!text || text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

/**
 * Sort bookings by date and time
 * @param {Array} bookings - Array of booking objects
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted bookings
 */
export function sortBookingsByDate(bookings, order = 'asc') {
  return [...bookings].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`)
    const dateB = new Date(`${b.date} ${b.time}`)
    
    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}

/**
 * Filter bookings by status
 * @param {Array} bookings - Array of booking objects
 * @param {string|Array} status - Status or array of statuses to filter by
 * @returns {Array} Filtered bookings
 */
export function filterBookingsByStatus(bookings, status) {
  if (!status || status === 'all') return bookings
  
  const statuses = Array.isArray(status) ? status : [status]
  return bookings.filter(booking => statuses.includes(booking.status))
}

/**
 * Get booking statistics
 * @param {Array} bookings - Array of booking objects
 * @returns {Object} Statistics object
 */
export function getBookingStats(bookings) {
  const total = bookings.length
  const pending = bookings.filter(b => b.status === 'pending').length
  const confirmed = bookings.filter(b => b.status === 'confirmed').length
  const completed = bookings.filter(b => b.status === 'completed').length
  const cancelled = bookings.filter(b => b.status === 'cancelled').length
  
  const today = new Date()
  const thisWeek = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
    return bookingDate >= startOfWeek && bookingDate < endOfWeek
  }).length
  
  const thisMonth = bookings.filter(b => {
    const bookingDate = new Date(b.date)
    return bookingDate.getMonth() === today.getMonth() && 
           bookingDate.getFullYear() === today.getFullYear()
  }).length
  
  return {
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    thisWeek,
    thisMonth,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  }
}
// lib/message-utils.js

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length (default: 150)
 * @returns {string} Truncated text
 */
export function truncateText(text, length = 150) {
  if (!text || text.length <= length) return text || ''
  return text.substring(0, length).trim() + '...'
}

/**
 * Get urgency color classes for Tailwind CSS
 * @param {string} urgency - The urgency level
 * @returns {string} Tailwind CSS classes
 */
export function getUrgencyColor(urgency) {
  switch (urgency) {
    case 'emergency':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'urgent':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'normal':
      return 'bg-green-100 text-green-800 border-green-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get urgency priority for sorting (higher number = higher priority)
 * @param {string} urgency - The urgency level
 * @returns {number} Priority number
 */
export function getUrgencyPriority(urgency) {
  switch (urgency) {
    case 'emergency':
      return 3
    case 'urgent':
      return 2
    case 'normal':
      return 1
    default:
      return 0
  }
}

/**
 * Format message preview for display
 * @param {Object} message - The message object
 * @param {number} maxLength - Maximum length for message preview
 * @returns {Object} Formatted message data
 */
export function formatMessagePreview(message, maxLength = 100) {
  return {
    ...message,
    messagePreview: truncateText(message.message, maxLength),
    formattedDate: formatDate(message.createdAt),
    formattedTime: formatTime(message.createdAt),
    urgencyColor: getUrgencyColor(message.urgency),
    urgencyPriority: getUrgencyPriority(message.urgency)
  }
}

/**
 * Format date for message display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date'
  
  const now = new Date()
  const diffMs = now - dateObj
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }
}

/**
 * Format time for message display
 * @param {string|Date} date - The date to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isNaN(dateObj.getTime())) return 'Invalid Time'
  
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - The date to compare
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  if (!date) return 'Unknown'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now - dateObj
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) {
    return 'Just now'
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  } else {
    return formatDate(date)
  }
}

/**
 * Sort messages by various criteria
 * @param {Array} messages - Array of message objects
 * @param {string} sortBy - Sort criteria ('date', 'name', 'urgency', 'read')
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted messages
 */
export function sortMessages(messages, sortBy = 'date', order = 'desc') {
  return [...messages].sort((a, b) => {
    let aValue, bValue
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
        break
      case 'name':
        aValue = a.name.toLowerCase()
        bValue = b.name.toLowerCase()
        break
      case 'subject':
        aValue = a.subject.toLowerCase()
        bValue = b.subject.toLowerCase()
        break
      case 'urgency':
        aValue = getUrgencyPriority(a.urgency)
        bValue = getUrgencyPriority(b.urgency)
        break
      case 'read':
        aValue = a.read ? 1 : 0
        bValue = b.read ? 1 : 0
        break
      default:
        aValue = new Date(a.createdAt)
        bValue = new Date(b.createdAt)
    }
    
    if (order === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })
}

/**
 * Filter messages by various criteria
 * @param {Array} messages - Array of message objects
 * @param {Object} filters - Filter options
 * @returns {Array} Filtered messages
 */
export function filterMessages(messages, filters = {}) {
  let filtered = [...messages]
  
  // Filter by read status
  if (filters.read !== undefined) {
    filtered = filtered.filter(message => message.read === filters.read)
  }
  
  // Filter by urgency
  if (filters.urgency && filters.urgency !== 'all') {
    if (Array.isArray(filters.urgency)) {
      filtered = filtered.filter(message => filters.urgency.includes(message.urgency))
    } else {
      filtered = filtered.filter(message => message.urgency === filters.urgency)
    }
  }
  
  // Filter by date range
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom)
    filtered = filtered.filter(message => new Date(message.createdAt) >= fromDate)
  }
  
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo)
    toDate.setHours(23, 59, 59, 999) // End of day
    filtered = filtered.filter(message => new Date(message.createdAt) <= toDate)
  }
  
  // Filter by search term
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    filtered = filtered.filter(message =>
      message.name.toLowerCase().includes(searchTerm) ||
      message.email.toLowerCase().includes(searchTerm) ||
      message.subject.toLowerCase().includes(searchTerm) ||
      message.message.toLowerCase().includes(searchTerm) ||
      (message.phone && message.phone.includes(searchTerm))
    )
  }
  
  return filtered
}

/**
 * Get message statistics
 * @param {Array} messages - Array of message objects
 * @returns {Object} Statistics object
 */
export function getMessageStats(messages) {
  const total = messages.length
  const unread = messages.filter(m => !m.read).length
  const emergency = messages.filter(m => m.urgency === 'emergency').length
  const urgent = messages.filter(m => m.urgency === 'urgent').length
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const todaysMessages = messages.filter(m => {
    const messageDate = new Date(m.createdAt)
    messageDate.setHours(0, 0, 0, 0)
    return messageDate.getTime() === today.getTime()
  }).length
  
  const thisWeek = messages.filter(m => {
    const messageDate = new Date(m.createdAt)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    return messageDate >= startOfWeek
  }).length
  
  const thisMonth = messages.filter(m => {
    const messageDate = new Date(m.createdAt)
    return messageDate.getMonth() === today.getMonth() &&
           messageDate.getFullYear() === today.getFullYear()
  }).length
  
  return {
    total,
    unread,
    read: total - unread,
    emergency,
    urgent,
    normal: total - emergency - urgent,
    today: todaysMessages,
    thisWeek,
    thisMonth,
    unreadPercentage: total > 0 ? Math.round((unread / total) * 100) : 0,
    urgentPercentage: total > 0 ? Math.round(((emergency + urgent) / total) * 100) : 0
  }
}

/**
 * Validate message data
 * @param {Object} messageData - Message data to validate
 * @returns {Object} Validation result
 */
export function validateMessage(messageData) {
  const errors = {}
  
  if (!messageData.name || messageData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long'
  }
  
  if (!messageData.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(messageData.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (!messageData.subject || messageData.subject.trim().length < 3) {
    errors.subject = 'Subject must be at least 3 characters long'
  }
  
  if (!messageData.message || messageData.message.trim().length < 10) {
    errors.message = 'Message must be at least 10 characters long'
  }
  
  if (messageData.phone && messageData.phone.trim() && 
      !/^[\+]?[1-9][\d\s\-\(\)]{7,15}$/.test(messageData.phone.replace(/\s/g, ''))) {
    errors.phone = 'Please enter a valid phone number'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
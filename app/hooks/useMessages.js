// hooks/useMessages.js
'use client'
import { useState, useEffect, useCallback } from 'react'

export function useMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/messages', {
        headers: {
          'Cache-Control': 'no-cache',
        },
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized access')
        }
        throw new Error(`Failed to fetch messages: ${response.status}`)
      }
      
      const data = await response.json()
      setMessages(data.messages || [])
      setRetryCount(0) // Reset retry count on success
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err.message)
      
      // Auto-retry logic for temporary failures
      if (retryCount < 3 && !err.message.includes('Unauthorized')) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchMessages()
        }, 2000 * (retryCount + 1)) // Exponential backoff
      }
    } finally {
      setLoading(false)
    }
  }, [retryCount])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark message as read')
      }

      // Optimistic update
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message._id === messageId 
            ? { ...message, read: true, updatedAt: new Date().toISOString() }
            : message
        )
      )
    } catch (err) {
      console.error('Error marking message as read:', err)
      throw new Error(err.message)
    }
  }

  const markAsUnread = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: false }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark message as unread')
      }

      // Optimistic update
      setMessages(prevMessages => 
        prevMessages.map(message => 
          message._id === messageId 
            ? { ...message, read: false, updatedAt: new Date().toISOString() }
            : message
        )
      )
    } catch (err) {
      console.error('Error marking message as unread:', err)
      throw new Error(err.message)
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete message')
      }

      // Optimistic update
      setMessages(prevMessages => 
        prevMessages.filter(message => message._id !== messageId)
      )
    } catch (err) {
      console.error('Error deleting message:', err)
      throw new Error(err.message)
    }
  }

  const markMultipleAsRead = async (messageIds) => {
    try {
      const promises = messageIds.map(id => markAsRead(id))
      await Promise.all(promises)
    } catch (err) {
      console.error('Error marking multiple messages as read:', err)
      throw new Error(err.message)
    }
  }

  const deleteMultiple = async (messageIds) => {
    try {
      const promises = messageIds.map(id => deleteMessage(id))
      await Promise.all(promises)
    } catch (err) {
      console.error('Error deleting multiple messages:', err)
      throw new Error(err.message)
    }
  }

  // Utility functions
  const getUnreadMessages = () => {
    return messages.filter(message => !message.read)
  }

  const getMessagesByUrgency = (urgency) => {
    return messages.filter(message => message.urgency === urgency)
  }

  const getEmergencyMessages = () => {
    return messages.filter(message => message.urgency === 'emergency')
  }

  const getUrgentMessages = () => {
    return messages.filter(message => message.urgency === 'urgent')
  }

  const getRecentMessages = (days = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return messages.filter(message => 
      new Date(message.createdAt) >= cutoffDate
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const getTodaysMessages = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    return messages.filter(message => {
      const messageDate = new Date(message.createdAt)
      return messageDate >= today && messageDate < tomorrow
    })
  }

  const getMessageStats = () => {
    const total = messages.length
    const unread = getUnreadMessages().length
    const emergency = getEmergencyMessages().length
    const urgent = getUrgentMessages().length
    const today = getTodaysMessages().length
    const thisWeek = getRecentMessages(7).length

    return {
      total,
      unread,
      emergency,
      urgent,
      today,
      thisWeek,
      read: total - unread
    }
  }

  const searchMessages = (query) => {
    if (!query) return messages
    
    const searchTerm = query.toLowerCase()
    return messages.filter(message => 
      message.name.toLowerCase().includes(searchTerm) ||
      message.email.toLowerCase().includes(searchTerm) ||
      message.subject.toLowerCase().includes(searchTerm) ||
      message.message.toLowerCase().includes(searchTerm) ||
      (message.phone && message.phone.includes(searchTerm))
    )
  }

  const sortMessages = (sortBy = 'date', order = 'desc') => {
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
          const urgencyOrder = { emergency: 3, urgent: 2, normal: 1 }
          aValue = urgencyOrder[a.urgency] || 0
          bValue = urgencyOrder[b.urgency] || 0
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

  return {
    // Data
    messages,
    loading,
    error,
    
    // Actions
    markAsRead,
    markAsUnread,
    deleteMessage,
    markMultipleAsRead,
    deleteMultiple,
    refetch: fetchMessages,
    
    // Getters
    getUnreadMessages,
    getMessagesByUrgency,
    getEmergencyMessages,
    getUrgentMessages,
    getRecentMessages,
    getTodaysMessages,
    getMessageStats,
    
    // Utilities
    searchMessages,
    sortMessages
  }
}
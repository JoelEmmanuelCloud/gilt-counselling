// hooks/useMessages.js
import { useState, useEffect } from 'react'

export function useMessages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
            
      const response = await fetch('/api/messages')
            
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }
            
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true })
      })
            
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark message as read')
      }
            
      // Update the message in local state
      setMessages(messages.map(message =>
        message._id === messageId
          ? { ...message, read: true, updatedAt: new Date().toISOString() }
          : message
      ))
            
      return true
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE'
      })
            
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete message')
      }
            
      // Remove message from local state
      setMessages(messages.filter(message => message._id !== messageId))
            
      return true
    } catch (error) {
      console.error('Error deleting message:', error)
      throw error
    }
  }

  const sendReply = async (messageId, replyData) => {
    try {
      const response = await fetch('/api/messages/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          ...replyData
        })
      })
            
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send reply')
      }
            
      const result = await response.json()
            
      // Update the message in local state to show it's been replied to
      setMessages(messages.map(message =>
        message._id === messageId
          ? { 
              ...message, 
              replied: true, 
              repliedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          : message
      ))
            
      return result
    } catch (error) {
      console.error('Error sending reply:', error)
      throw error
    }
  }

  const getMessageStats = () => {
    const total = messages.length
    const unread = messages.filter(m => !m.read).length
    const urgent = messages.filter(m => m.urgency === 'urgent' || m.urgency === 'emergency').length
    const unreplied = messages.filter(m => !m.replied).length
    
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
    
    return {
      total,
      unread,
      urgent,
      unreplied,
      today: todaysMessages,
      thisWeek,
      readPercentage: total > 0 ? Math.round(((total - unread) / total) * 100) : 0,
      replyPercentage: total > 0 ? Math.round(((total - unreplied) / total) * 100) : 0
    }
  }

  const filterMessages = (filters = {}) => {
    let filtered = [...messages]
    
    // Filter by read status
    if (filters.read !== undefined) {
      filtered = filtered.filter(message => message.read === filters.read)
    }
    
    // Filter by reply status
    if (filters.replied !== undefined) {
      filtered = filtered.filter(message => message.replied === filters.replied)
    }
    
    // Filter by urgency
    if (filters.urgency && filters.urgency !== 'all') {
      if (Array.isArray(filters.urgency)) {
        filtered = filtered.filter(message => filters.urgency.includes(message.urgency))
      } else {
        filtered = filtered.filter(message => message.urgency === filters.urgency)
      }
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

  const sortMessages = (sortBy = 'newest') => {
    return [...messages].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'unread':
          if (a.read === b.read) return new Date(b.createdAt) - new Date(a.createdAt)
          return a.read ? 1 : -1
        case 'urgent':
          const urgencyOrder = { emergency: 3, urgent: 2, normal: 1 }
          const aValue = urgencyOrder[a.urgency] || 0
          const bValue = urgencyOrder[b.urgency] || 0
          if (aValue === bValue) return new Date(b.createdAt) - new Date(a.createdAt)
          return bValue - aValue
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })
  }

  return {
    messages,
    loading,
    error,
    markAsRead,
    deleteMessage,
    sendReply,
    getMessageStats,
    filterMessages,
    sortMessages,
    refetch: fetchMessages
  }
}
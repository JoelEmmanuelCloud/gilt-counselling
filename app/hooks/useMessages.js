//hooks/useMessages.js
'use client'
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
      const response = await fetch('/api/messages')
      
      if (!response.ok) {
        throw new Error('Failed to fetch messages')
      }
      
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

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

      // Update local state
      setMessages(messages.map(message => 
        message._id === messageId 
          ? { ...message, read: true }
          : message
      ))
    } catch (err) {
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

      // Update local state
      setMessages(messages.map(message => 
        message._id === messageId 
          ? { ...message, read: false }
          : message
      ))
    } catch (err) {
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

      // Update local state
      setMessages(messages.filter(message => message._id !== messageId))
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const getUnreadMessages = () => {
    return messages.filter(message => !message.read)
  }

  const getMessagesByUrgency = (urgency) => {
    return messages.filter(message => message.urgency === urgency)
  }

  const getEmergencyMessages = () => {
    return messages.filter(message => message.urgency === 'emergency')
  }

  const getRecentMessages = (days = 7) => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    return messages.filter(message => 
      new Date(message.createdAt) >= cutoffDate
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return {
    messages,
    loading,
    error,
    markAsRead,
    markAsUnread,
    deleteMessage,
    getUnreadMessages,
    getMessagesByUrgency,
    getEmergencyMessages,
    getRecentMessages,
    refetch: fetchMessages
  }
}
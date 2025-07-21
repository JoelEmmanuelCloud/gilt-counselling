//components/dashboard/MessagesTable.js
'use client'
import { useState, useEffect } from 'react'
import { formatDate, truncateText } from '@/lib/utils'

export default function MessagesTable() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/messages')
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
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

      if (response.ok) {
        setMessages(prevMessages => 
          prevMessages.map(message => 
            message._id === messageId 
              ? { ...message, read: true }
              : message
          )
        )
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessages(prevMessages => 
          prevMessages.filter(message => message._id !== messageId)
        )
        setSelectedMessage(null)
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true
    if (filter === 'unread') return !message.read
    if (filter === 'urgent') return message.urgency === 'urgent'
    if (filter === 'emergency') return message.urgency === 'emergency'
    return true
  })

  const urgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

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
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-playfair text-2xl font-semibold text-deepBlue mb-4 sm:mb-0">
            Contact Messages
          </h2>
          
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
            >
              <option value="all">All Messages</option>
              <option value="unread">Unread Only</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-deepBlue">{messages.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {messages.filter(m => !m.read).length}
            </div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {messages.filter(m => m.urgency === 'urgent').length}
            </div>
            <div className="text-sm text-gray-600">Urgent</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {messages.filter(m => m.urgency === 'emergency').length}
            </div>
            <div className="text-sm text-gray-600">Emergency</div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="divide-y divide-gray-200">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <div>No messages found</div>
            <div className="text-sm mt-1">
              {filter !== 'all' ? `No ${filter} messages` : 'No messages yet'}
            </div>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div 
              key={message._id}
              className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                !message.read ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                setSelectedMessage(message)
                if (!message.read) {
                  markAsRead(message._id)
                }
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-deepBlue truncate">
                      {message.name}
                    </h3>
                    {!message.read && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColor(message.urgency)}`}>
                      {message.urgency}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <span>{message.email}</span>
                    {message.phone && <span>{message.phone}</span>}
                    <span>{formatDate(message.createdAt)}</span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                  <p className="text-gray-600 text-sm">{truncateText(message.message, 150)}</p>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMessage(message._id)
                    }}
                    className="text-red-400 hover:text-red-600 p-1"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-playfair text-xl font-semibold text-deepBlue">
                  Message Details
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-gray-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{selectedMessage.email}</p>
                  </div>
                  {selectedMessage.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-gray-900">{selectedMessage.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${urgencyColor(selectedMessage.urgency)}`}>
                      {selectedMessage.urgency}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <p className="text-gray-900 font-medium">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  Received on {formatDate(selectedMessage.createdAt)}
                </div>
              </div>
              
              <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => deleteMessage(selectedMessage._id)}
                  className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete Message
                </button>
                
                <div className="space-x-3">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="px-4 py-2 bg-gold text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    Reply via Email
                  </a>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
//app/dashboard/messages/page.js
'use client'
import { useState } from 'react'
import AdminLayout from '@/components/dashboard/AdminLayout'
import DashboardAuthWrapper from '@/components/dashboard/DashboardAuthWrapper'
import { useMessages } from '@/hooks/useMessages'
import { formatDate } from '@/lib/utils'

export default function MessagesPage() {
  const { messages, loading, error, markAsRead, deleteMessage } = useMessages()
  const [filter, setFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true
    if (filter === 'unread') return !message.read
    if (filter === 'read') return message.read
    return message.urgency === filter
  })

  const handleMarkAsRead = async (messageId) => {
    try {
      await markAsRead(messageId)
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(messageId)
        setSelectedMessage(null)
      } catch (error) {
        console.error('Failed to delete message:', error)
      }
    }
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  if (error) {
    return (
      <DashboardAuthWrapper>
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error loading messages: {error}
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
              Messages
            </h1>
            <p className="text-gray-600 mt-1">
              Manage contact form submissions and inquiries
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredMessages.length} messages
            </span>
            {messages.filter(m => !m.read).length > 0 && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {messages.filter(m => !m.read).length} unread
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
            {['all', 'unread', 'read', 'emergency', 'urgent', 'normal'].map((filterOption) => (
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredMessages.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <span className="text-4xl mb-4 block">💬</span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                <p className="text-gray-500">
                  {filter === 'all' 
                    ? 'No messages have been received yet.' 
                    : `No ${filter} messages found.`
                  }
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message._id}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (!message.read) handleMarkAsRead(message._id)
                  }}
                  className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md ${
                    !message.read ? 'border-l-4 border-gold' : ''
                  } ${selectedMessage?._id === message._id ? 'ring-2 ring-gold' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-deepBlue">
                          {message.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(message.urgency)}`}>
                          {message.urgency}
                        </span>
                        {!message.read && (
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                      <p className="font-medium text-gray-900 mb-2">{message.subject}</p>
                      <p className="text-gray-600 text-sm line-clamp-2">{message.message}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-500">{formatDate(message.createdAt)}</p>
                      {message.phone && (
                        <p className="text-xs text-gray-500 mt-1">{message.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-1">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-playfair text-lg font-semibold text-deepBlue">
                    Message Details
                  </h3>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">From</label>
                    <p className="text-deepBlue font-medium">{selectedMessage.name}</p>
                    <p className="text-sm text-gray-600">{selectedMessage.email}</p>
                    {selectedMessage.phone && (
                      <p className="text-sm text-gray-600">{selectedMessage.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Subject</label>
                    <p className="text-deepBlue">{selectedMessage.subject}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Priority</label>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getUrgencyColor(selectedMessage.urgency)}`}>
                      {selectedMessage.urgency}
                    </span>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Received</label>
                    <p className="text-sm text-gray-600">{formatDate(selectedMessage.createdAt)}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Message</label>
                    <div className="bg-gray-50 rounded-lg p-3 mt-1">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <button className="flex-1 btn-primary text-sm py-2">
                        Reply via Email
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage._id)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 text-sm font-medium transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <span className="text-4xl mb-4 block">📧</span>
                <p className="text-gray-500">Select a message to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
    </DashboardAuthWrapper>
  )
}
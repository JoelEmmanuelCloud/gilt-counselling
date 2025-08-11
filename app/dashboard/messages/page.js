//app/dashboard/messages/page.js
'use client'
import { useState } from 'react'
import AdminLayout from '@/components/dashboard/AdminLayout'
import DashboardAuthWrapper from '@/components/dashboard/DashboardAuthWrapper'
import MessageReplyModal from '@/components/dashboard/MessageReplyModal'
import { useMessages } from '@/hooks/useMessages'
import { formatDate } from '@/lib/utils'

export default function MessagesPage() {
  const { messages, loading, error, markAsRead, deleteMessage, refetch } = useMessages()
  const [filter, setFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [replyingToMessage, setReplyingToMessage] = useState(null)

  const filteredMessages = messages.filter(message => {
    if (filter === 'all') return true
    if (filter === 'unread') return !message.read
    if (filter === 'read') return message.read
    if (filter === 'replied') return message.replied
    if (filter === 'unreplied') return !message.replied
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

  const handleReplyClick = (message) => {
    setReplyingToMessage(message)
    setShowReplyModal(true)
    // Mark as read when opening reply
    if (!message.read) {
      handleMarkAsRead(message._id)
    }
  }

  const handleReplySuccess = () => {
    // Refresh messages to show reply status
    refetch()
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800'
      case 'urgent': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMessageStats = () => {
    const total = messages.length
    const unread = messages.filter(m => !m.read).length
    const urgent = messages.filter(m => m.urgency === 'urgent' || m.urgency === 'emergency').length
    const unreplied = messages.filter(m => !m.replied).length
    
    return { total, unread, urgent, unreplied }
  }

  const stats = getMessageStats()

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
              Messages & Inquiries
            </h1>
            <p className="text-gray-600 mt-1">
              Manage contact form submissions and client communications
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {filteredMessages.length} messages
            </span>
            {stats.unread > 0 && (
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                {stats.unread} unread
              </span>
            )}
            {stats.unreplied > 0 && (
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                {stats.unreplied} need reply
              </span>
            )}
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-deepBlue">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Messages</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.urgent}</div>
            <div className="text-sm text-gray-600">Urgent</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.unreplied}</div>
            <div className="text-sm text-gray-600">Need Reply</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Filter:</span>
            {[
              'all', 'unread', 'read', 'unreplied', 'replied', 
              'emergency', 'urgent', 'normal'
            ].map((filterOption) => (
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
                {filterOption === 'unread' && stats.unread > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">
                    {stats.unread}
                  </span>
                )}
                {filterOption === 'unreplied' && stats.unreplied > 0 && (
                  <span className="ml-1 bg-orange-500 text-white text-xs px-1 rounded-full">
                    {stats.unreplied}
                  </span>
                )}
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
                  className={`bg-white rounded-lg shadow-sm p-6 cursor-pointer transition-all hover:shadow-md border-l-4 ${
                    !message.read ? 'border-gold bg-blue-50' : 
                    message.replied ? 'border-green-500' : 'border-gray-200'
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
                        {message.replied && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Replied
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{message.email}</p>
                      <p className="font-medium text-gray-900 mb-2">{message.subject}</p>
                      <p className="text-gray-600 text-sm line-clamp-2">{message.message}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xs text-gray-500 mb-2">{formatDate(message.createdAt)}</p>
                      {message.phone && (
                        <p className="text-xs text-gray-500 mb-2">{message.phone}</p>
                      )}
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReplyClick(message)
                          }}
                          className="text-xs bg-gold text-white px-2 py-1 rounded hover:bg-yellow-600 transition-colors"
                        >
                          📧 Reply
                        </button>
                        <a
                          href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors text-center"
                        >
                          ✉️ Email
                        </a>
                        {message.phone && (
                          <a
                            href={`tel:${message.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors text-center"
                          >
                            📞 Call
                          </a>
                        )}
                      </div>
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
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="flex space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedMessage.read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedMessage.read ? 'Read' : 'Unread'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedMessage.replied ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedMessage.replied ? 'Replied' : 'No Reply'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Received</label>
                    <p className="text-sm text-gray-600">{formatDate(selectedMessage.createdAt)}</p>
                    {selectedMessage.replied && selectedMessage.repliedAt && (
                      <p className="text-sm text-green-600">
                        Replied: {formatDate(selectedMessage.repliedAt)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Message</label>
                    <div className="bg-gray-50 rounded-lg p-3 mt-1 max-h-48 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedMessage.message}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="space-y-2">
                      <button 
                        onClick={() => handleReplyClick(selectedMessage)}
                        className="w-full btn-primary text-sm py-2"
                      >
                        📧 Reply via Dashboard
                      </button>
                      <a
                        href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject)}`}
                        className="block w-full btn-secondary text-sm py-2 text-center"
                      >
                        ✉️ Quick Email Reply
                      </a>
                      {selectedMessage.phone && (
                        <a
                          href={`tel:${selectedMessage.phone}`}
                          className="block w-full bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700 transition-colors text-center"
                        >
                          📞 Call Client
                        </a>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(selectedMessage._id)}
                        className="w-full px-3 py-2 text-red-600 hover:text-red-800 text-sm font-medium transition-colors border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        🗑️ Delete Message
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

        {/* Reply Modal */}
        <MessageReplyModal
          message={replyingToMessage}
          isOpen={showReplyModal}
          onClose={() => {
            setShowReplyModal(false)
            setReplyingToMessage(null)
          }}
          onReplySuccess={handleReplySuccess}
        />
      </div>
    </AdminLayout>
    </DashboardAuthWrapper>
  )
}
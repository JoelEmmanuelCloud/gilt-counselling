// lib/tidycal-integration.js
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)

export class TidyCalIntegration {
  static async fetchAndSyncBookings() {
    try {
      await client.connect()
      const db = client.db('gilt-counselling')
      

      
      // Fetch bookings from TidyCal API
      const tidyCalBookings = await this.fetchTidyCalBookings()
  
      
      // Sync with MongoDB
      const syncResults = await this.syncBookingsToMongoDB(db, tidyCalBookings)
      
      return {
        success: true,
        synced: syncResults.synced,
        updated: syncResults.updated,
        total: tidyCalBookings.length,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error syncing TidyCal bookings:', error)
      throw error
    } finally {
      await client.close()
    }
  }

  static async fetchTidyCalBookings() {
    const API_KEY = process.env.TIDYCAL_API_KEY
    
    if (!API_KEY) {
      throw new Error('TIDYCAL_API_KEY environment variable is not set')
    }
    
    const response = await fetch('https://tidycal.com/api/bookings', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('TidyCal API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new Error(`TidyCal API error: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()

    return data.data || []
  }

  static async syncBookingsToMongoDB(db, tidyCalBookings) {
    let synced = 0
    let updated = 0
    let errors = 0

    for (const tidyBooking of tidyCalBookings) {
      try {
        const transformedBooking = this.transformTidyCalBooking(tidyBooking)
        
        // Check if booking already exists
        const existingBooking = await db.collection('bookings').findOne({
          tidyCalBookingId: tidyBooking.id
        })

        if (existingBooking) {
          // Update existing booking if there are changes
          const updateResult = await db.collection('bookings').updateOne(
            { tidyCalBookingId: tidyBooking.id },
            { 
              $set: {
                ...transformedBooking,
                updatedAt: new Date(),
                lastSyncedAt: new Date()
              }
            }
          )
          
          if (updateResult.modifiedCount > 0) {
            updated++
          }
        } else {
          // Create new booking
          await db.collection('bookings').insertOne({
            ...transformedBooking,
            createdAt: new Date(tidyBooking.created_at),
            updatedAt: new Date(),
            lastSyncedAt: new Date(),
            source: 'tidycal'
          })
          synced++

        }
      } catch (error) {
        console.error(`Error processing booking ${tidyBooking.id}:`, error)
        errors++
      }
    }

    return { synced, updated, errors }
  }

  static transformTidyCalBooking(tidyBooking) {
    try {
      // Parse the start time
      const startTime = new Date(tidyBooking.starts_at)
      const endTime = new Date(tidyBooking.ends_at)
      
      // Extract date and time
      const date = startTime.toISOString().split('T')[0]
      const time = startTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: tidyBooking.timezone || 'Africa/Lagos'
      })

      // Calculate duration
      const durationMs = endTime - startTime
      const durationMinutes = Math.round(durationMs / (1000 * 60))
      const hours = Math.floor(durationMinutes / 60)
      const minutes = durationMinutes % 60
      
      let formattedDuration
      if (hours > 0 && minutes > 0) {
        formattedDuration = `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minutes`
      } else if (hours > 0) {
        formattedDuration = `${hours} hour${hours !== 1 ? 's' : ''}`
      } else {
        formattedDuration = `${minutes} minutes`
      }

      // Determine status
      let status = 'confirmed'
      if (tidyBooking.cancelled_at) {
        status = 'cancelled'
      } else if (tidyBooking.approved_at === null && tidyBooking.booking_type?.approval_required) {
        status = 'pending'
      } else if (endTime < new Date()) {
        status = 'completed'
      }

      return {
        tidyCalBookingId: tidyBooking.id,
        userName: tidyBooking.contact?.name || 'Unknown',
        userEmail: tidyBooking.contact?.email || '',
        service: tidyBooking.booking_type?.title || 'Unknown Service',
        date: date,
        time: time,
        duration: formattedDuration,
        durationMinutes: durationMinutes,
        status: status,
        meetingUrl: tidyBooking.meeting_url,
        meetingId: tidyBooking.meeting_id,
        timezone: tidyBooking.timezone || 'Africa/Lagos',
        bookingReference: tidyBooking.slug,
        notes: this.extractNotes(tidyBooking.questions),
        phoneNumber: this.extractPhoneNumber(tidyBooking.questions),
        location: tidyBooking.location,
        
        // TidyCal specific data
        tidyCalData: {
          contactId: tidyBooking.contact_id,
          bookingTypeId: tidyBooking.booking_type_id,
          startsAt: tidyBooking.starts_at,
          endsAt: tidyBooking.ends_at,
          createdAt: tidyBooking.created_at,
          updatedAt: tidyBooking.updated_at,
          cancelledAt: tidyBooking.cancelled_at,
          approvedAt: tidyBooking.approved_at,
          eventId: tidyBooking.event_id,
          bookingTypeData: {
            title: tidyBooking.booking_type?.title,
            description: tidyBooking.booking_type?.description,
            duration: tidyBooking.booking_type?.duration_minutes,
            price: tidyBooking.booking_type?.price,
            currency: tidyBooking.booking_type?.currency_code
          }
        },

        // Additional metadata
        isVirtualMeeting: !!tidyBooking.meeting_url,
        isPastAppointment: endTime < new Date(),
        isUpcoming: startTime > new Date(),
        bookingUrl: tidyBooking.booking_type?.booking_page_url
      }
    } catch (error) {
      console.error('Error transforming TidyCal booking:', error)
      console.error('Raw booking data:', JSON.stringify(tidyBooking, null, 2))
      throw error
    }
  }

  static extractNotes(questions) {
    if (!questions || !Array.isArray(questions)) return ''
    
    const noteQuestions = questions.filter(q => 
      q.question && (
        q.question.toLowerCase().includes('note') || 
        q.question.toLowerCase().includes('comment') ||
        q.question.toLowerCase().includes('message') ||
        q.question.toLowerCase().includes('additional') ||
        q.question.toLowerCase().includes('special')
      )
    )
    
    return noteQuestions.map(q => `${q.question}: ${q.answer}`).join('; ')
  }

  static extractPhoneNumber(questions) {
    if (!questions || !Array.isArray(questions)) return ''
    
    const phoneQuestion = questions.find(q => 
      q.question && (
        q.question.toLowerCase().includes('phone') ||
        q.question.toLowerCase().includes('number') ||
        q.question.toLowerCase().includes('contact') ||
        q.question.toLowerCase().includes('mobile')
      )
    )
    
    return phoneQuestion ? phoneQuestion.answer : ''
  }

  // Get a specific booking from TidyCal
  static async fetchTidyCalBooking(bookingId) {
    const API_KEY = process.env.TIDYCAL_API_KEY
    
    if (!API_KEY) {
      throw new Error('TIDYCAL_API_KEY environment variable is not set')
    }

    const response = await fetch(`https://tidycal.com/api/bookings/${bookingId}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`TidyCal API error: ${response.status}`)
    }

    const data = await response.json()
    return data
  }

  // Send urgent message via email (TidyCal doesn't have direct messaging API)
  static async sendUrgentMessage(tidyCalBookingId, message) {
    try {
      await client.connect()
      const db = client.db('gilt-counselling')
      
      // Find the booking in our database
      const booking = await db.collection('bookings').findOne({
        tidyCalBookingId: tidyCalBookingId
      })

      if (!booking) {
        throw new Error('Booking not found in local database')
      }

      // Store the message in our database
      await db.collection('bookings').updateOne(
        { tidyCalBookingId: tidyCalBookingId },
        {
          $push: {
            urgentMessages: {
              message,
              sentAt: new Date(),
              sentBy: 'admin',
              method: 'email'
            }
          }
        }
      )
      
      return { 
        success: true,
        message: 'Urgent message logged. Email will be sent via separate API.'
      }
    } catch (error) {
      console.error('Error sending urgent message:', error)
      throw error
    } finally {
      await client.close()
    }
  }

  // Get booking statistics
  static async getBookingStats() {
    try {
      await client.connect()
      const db = client.db('gilt-counselling')
      
      const today = new Date().toISOString().split('T')[0]
      const thisWeek = new Date()
      thisWeek.setDate(thisWeek.getDate() - 7)
      const weekStart = thisWeek.toISOString().split('T')[0]
      
      const stats = await Promise.all([
        // Total bookings
        db.collection('bookings').countDocuments({}),
        
        // Today's bookings
        db.collection('bookings').countDocuments({ date: today }),
        
        // This week's bookings
        db.collection('bookings').countDocuments({ 
          date: { $gte: weekStart } 
        }),
        
        // Status breakdown
        db.collection('bookings').aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]).toArray(),
        
        // Service breakdown
        db.collection('bookings').aggregate([
          {
            $group: {
              _id: '$service',
              count: { $sum: 1 }
            }
          }
        ]).toArray(),
        
        // Last sync time
        db.collection('bookings').findOne(
          {},
          { sort: { lastSyncedAt: -1 }, projection: { lastSyncedAt: 1 } }
        )
      ])

      return {
        total: stats[0],
        today: stats[1],
        thisWeek: stats[2],
        byStatus: stats[3].reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        byService: stats[4].reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {}),
        lastSync: stats[5]?.lastSyncedAt || null
      }
    } finally {
      await client.close()
    }
  }

  // Validate TidyCal API connection
  static async validateConnection() {
    try {
      const API_KEY = process.env.TIDYCAL_API_KEY
      
      if (!API_KEY) {
        return {
          valid: false,
          error: 'API key not configured'
        }
      }

      const response = await fetch('https://tidycal.com/api/bookings?per_page=1', {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return {
          valid: true,
          totalBookings: data.total || 0,
          message: 'Connection successful'
        }
      } else {
        return {
          valid: false,
          error: `API returned ${response.status}: ${response.statusText}`
        }
      }
    } catch (error) {
      return {
        valid: false,
        error: error.message
      }
    }
  }

  // Clean up old bookings (optional maintenance function)
  static async cleanupOldBookings(daysOld = 365) {
    try {
      await client.connect()
      const db = client.db('gilt-counselling')
      
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)
      const cutoffDateString = cutoffDate.toISOString().split('T')[0]
      
      const result = await db.collection('bookings').deleteMany({
        date: { $lt: cutoffDateString },
        status: { $in: ['completed', 'cancelled'] }
      })
      
      return {
        deleted: result.deletedCount,
        cutoffDate: cutoffDateString
      }
    } finally {
      await client.close()
    }
  }

  // Export bookings to CSV format
  static async exportBookings(filters = {}) {
    try {
      await client.connect()
      const db = client.db('gilt-counselling')
      
      let query = {}
      
      // Apply filters
      if (filters.startDate && filters.endDate) {
        query.date = {
          $gte: filters.startDate,
          $lte: filters.endDate
        }
      }
      
      if (filters.status) {
        query.status = filters.status
      }
      
      if (filters.service) {
        query.service = filters.service
      }

      const bookings = await db.collection('bookings')
        .find(query)
        .sort({ date: 1, time: 1 })
        .toArray()

      // Convert to CSV format
      const headers = [
        'Date',
        'Time', 
        'Client Name',
        'Email',
        'Phone',
        'Service',
        'Duration',
        'Status',
        'Meeting URL',
        'TidyCal ID',
        'Booking Reference',
        'Notes',
        'Created At'
      ]

      const csvRows = bookings.map(booking => [
        booking.date,
        booking.time,
        booking.userName,
        booking.userEmail,
        booking.phoneNumber || '',
        booking.service,
        booking.duration,
        booking.status,
        booking.meetingUrl || '',
        booking.tidyCalBookingId,
        booking.bookingReference || '',
        (booking.notes || '').replace(/"/g, '""'), // Escape quotes
        booking.createdAt?.toISOString() || ''
      ])

      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => 
          row.map(cell => `"${cell}"`).join(',')
        )
      ].join('\n')

      return {
        csv: csvContent,
        filename: `gilt-bookings-${new Date().toISOString().split('T')[0]}.csv`,
        count: bookings.length
      }
    } finally {
      await client.close()
    }
  }
}
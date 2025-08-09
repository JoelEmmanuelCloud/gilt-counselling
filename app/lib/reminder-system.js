// lib/enhanced-reminder-system.js - Updated for SendGrid Dynamic Templates
import { MongoClient } from 'mongodb'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const client = new MongoClient(process.env.MONGODB_URI)

// SendGrid Template IDs - Add these to your .env
const TEMPLATE_IDS = {
  ADMIN_NOTIFICATION: 'd-ebc4731195094579906f24cf0d8d0c33',
  URGENT_REMINDER: 'd-14c70aedf4bb408c8c31e4136fd62ad5',
}

export class EnhancedReminderSystem {
  
  // Send admin notifications using dynamic template
  static async sendAdminNotifications() {
    try {
      await client.connect()
      const db = client.db('gilt-counselling')
      
      // Get new bookings in last 2 hours that need admin notification
      const recentBookings = await db.collection('bookings').find({
        createdAt: { 
          $gte: new Date(Date.now() - 2 * 60 * 60 * 1000),
          $lte: new Date()
        },
        adminNotified: { $ne: true }
      }).toArray()
      
      for (const booking of recentBookings) {
        await this.sendAdminNotification(booking)
        
        // Mark as notified
        await db.collection('bookings').updateOne(
          { _id: booking._id },
          { $set: { adminNotified: true } }
        )
      }
      
      return { notificationsSent: recentBookings.length }
    } catch (error) {
      console.error('Admin notification error:', error)
      throw error
    } finally {
      await client.close()
    }
  }
  
  static async sendAdminNotification(booking) {
    const msg = {
      to: process.env.ADMIN_EMAIL,
      from: {
        name: 'Gilt Counselling System',
        email: process.env.SENDGRID_FROM_EMAIL
      },
      templateId: TEMPLATE_IDS.ADMIN_NOTIFICATION,
      dynamicTemplateData: {
        client_name: booking.userName,
        client_email: booking.userEmail,
        service_type: booking.service,
        appointment_date: new Date(booking.date).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointment_time: booking.time,
        booking_duration: booking.duration || '60 minutes',
        tidycal_id: booking.tidyCalBookingId || 'N/A',
        client_notes: booking.notes || 'No additional notes',
        booking_reference: booking.bookingReference || booking._id.toString(),
        booked_timestamp: new Date(booking.createdAt).toLocaleString(),
        dashboard_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings`,
        booking_id: booking._id.toString()
      }
    }
    
    await sgMail.send(msg)
  }
  
  // Send urgent reminder using dynamic template
  static async sendUrgentReminder(bookingId, message, subject) {
    try {
      await client.connect()
      const db = client.db('gilt-counselling')
      
      const booking = await db.collection('bookings').findOne({ _id: bookingId })
      if (!booking) throw new Error('Booking not found')
      
      const msg = {
        to: booking.userEmail,
        from: {
          name: 'Gilt Counselling',
          email: process.env.SENDGRID_FROM_EMAIL
        },
        templateId: TEMPLATE_IDS.URGENT_REMINDER,
        dynamicTemplateData: {
          client_name: booking.userName,
          urgent_message: message,
          custom_subject: subject || 'Important Update - Gilt Counselling',
          service_type: booking.service,
          appointment_date: new Date(booking.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          appointment_time: booking.time,
          booking_duration: booking.duration || '60 minutes',
          booking_reference: booking.bookingReference || booking._id.toString(),
          contact_phone: '+234 803 309 4050',
          contact_email: 'wecare@giltcounselling.com',
          office_location: 'No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria'
        }
      }
      
      await sgMail.send(msg)
      
      // Log the urgent message
      await db.collection('bookings').updateOne(
        { _id: bookingId },
        { 
          $push: { 
            urgentMessages: {
              sentAt: new Date(),
              message,
              subject
            }
          }
        }
      )
      
      return { success: true }
    } finally {
      await client.close()
    }
  }
}


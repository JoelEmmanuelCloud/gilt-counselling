// app/api/bookings/urgent-message/route.js
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { emailTemplates } from '@/lib/email-templates'

const client = new MongoClient(process.env.MONGODB_URI)

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, message, tidyCalBookingId } = await request.json()

    if (!bookingId || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Get booking details
    const booking = await db.collection('bookings').findOne({ 
      _id: new ObjectId(bookingId) 
    })

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Send email using template
    const emailResult = await emailTemplates.sendUrgentBookingMessage({
      booking: booking,
      urgentMessage: message,
      senderName: session.user.name || 'Dr. Ugwu - Gilt Counselling'
    })

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Failed to send urgent message email')
    }

    // Log the message in the database
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $push: {
          urgentMessages: {
            message,
            sentAt: new Date(),
            sentBy: session.user.name || session.user.email,
            emailSent: true
          }
        }
      }
    )

    return Response.json({ 
      success: true, 
      message: 'Urgent message sent successfully' 
    })
  } catch (error) {
    console.error('❌ Error sending urgent message:', error)
    return Response.json({ 
      error: 'Failed to send urgent message: ' + error.message 
    }, { status: 500 })
  } finally {
    await client.close()
  }
}
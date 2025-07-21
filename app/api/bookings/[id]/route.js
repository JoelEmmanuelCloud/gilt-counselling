//app/api/bookings/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { MongoClient, ObjectId } from 'mongodb'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const client = new MongoClient(process.env.MONGODB_URI)

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Get the booking first
    const booking = await db.collection('bookings').findOne(
      { _id: new ObjectId(params.id) }
    )

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check permissions
    if (session.user.role !== 'admin' && booking.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update booking status
    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { status, updatedAt: new Date() } }
    )

    // Send status update email
    if (status === 'confirmed') {
      const confirmationEmail = {
        to: booking.userEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: 'Appointment Confirmed - Gilt Counselling',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #D4AF37; color: white; padding: 20px; text-align: center;">
              <h1>Appointment Confirmed</h1>
            </div>
            
            <div style="padding: 20px;">
              <p>Dear ${booking.userName},</p>
              
              <p>Great news! Your appointment has been confirmed.</p>
              
              <div style="background: #F8F5F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #00303F; margin-top: 0;">Confirmed Appointment</h3>
                <p><strong>Service:</strong> ${booking.service}</p>
                <p><strong>Date:</strong> ${new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${booking.time}</p>
              </div>
              
              <p>Please arrive 10 minutes early and bring a valid ID. If you need to reschedule, please contact us at least 24 hours in advance.</p>
              
              <p>We look forward to seeing you!</p>
              <p>Best regards,<br>The Gilt Counselling Team</p>
            </div>
          </div>
        `,
      }

      await sgMail.send(confirmationEmail)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    const result = await db.collection('bookings').deleteOne(
      { _id: new ObjectId(params.id) }
    )

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
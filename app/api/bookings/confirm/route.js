// app/api/bookings/confirm/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { MongoClient, ObjectId } from 'mongodb'
import { emailTemplates } from '@/lib/email-templates'

const client = new MongoClient(process.env.MONGODB_URI)

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, sendEmail = true } = body

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Get the booking
    const booking = await db.collection('bookings').findOne(
      { _id: new ObjectId(bookingId) }
    )

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Check permissions - only booking owner or admin can confirm
    if (session.user.role !== 'admin' && booking.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to access this booking' },
        { status: 403 }
      )
    }

    // Send confirmation email if requested
    if (sendEmail) {
      try {
        // Send detailed confirmation email
        await emailTemplates.sendBookingConfirmation({
          email: booking.userEmail,
          clientName: booking.userName,
          serviceType: booking.service,
          appointmentDate: booking.date,
          appointmentTime: booking.time,
          sessionDuration: getServiceDuration(booking.service),
          sessionFee: getServiceFee(booking.service),
          bookingStatus: 'Confirmed',
          notes: booking.notes
        })

        console.log(`Confirmation email sent for booking ${bookingId}`)
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the request if email fails
        return NextResponse.json(
          { 
            success: true, 
            emailSent: false, 
            emailError: 'Failed to send email, but booking was processed'
          }
        )
      }
    }

    return NextResponse.json({
      success: true,
      emailSent: sendEmail,
      booking: {
        id: booking._id,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        status: booking.status
      }
    })

  } catch (error) {
    console.error('Booking confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

// Helper functions
function getServiceDuration(service) {
  const durations = {
    'Individual Teen Session': '50 minutes',
    'Family Therapy': '75 minutes',
    'Parent Coaching': '60 minutes',
    'Group Session': '90 minutes'
  }
  return durations[service] || '60 minutes'
}

function getServiceFee(service) {
  const fees = {
    'Individual Teen Session': '$120',
    'Family Therapy': '$150',
    'Parent Coaching': '$100',
    'Group Session': '$60'
  }
  return fees[service] || 'TBD'
}
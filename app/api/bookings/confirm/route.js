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

    // Validate ObjectId format
    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: 'Invalid booking ID format' },
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

    let emailSent = false
    let emailError = null

    // Send confirmation email if requested
    if (sendEmail) {
      try {
        // Validate required email template data
        const emailData = {
          email: booking.userEmail,
          clientName: booking.userName || 'Valued Client',
          serviceType: booking.service,
          appointmentDate: booking.date,
          appointmentTime: booking.time,
          sessionDuration: getServiceDuration(booking.service),
          sessionFee: 'Free of Charge', // Updated to reflect free services
          bookingStatus: 'Pending Confirmation',
          notes: booking.notes || '',
          bookingReference: booking.bookingReference || booking._id.toString(),
          location: 'No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria',
          contactPhone: '+234 803 309 4050',
          contactEmail: 'support@giltcounselling.com'
        }

        // Send detailed confirmation email
        await emailTemplates.sendBookingConfirmation(emailData)
        
        emailSent = true
        console.log(`Confirmation email sent successfully for booking ${bookingId}`)
        
      } catch (emailSendError) {
        console.error('Failed to send confirmation email:', emailSendError)
        emailError = getEmailErrorMessage(emailSendError)
        
        // Log the email failure but don't fail the entire request
        await logEmailFailure(db, bookingId, emailSendError)
      }
    }

    // Update booking with confirmation attempt timestamp
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      { 
        $set: { 
          lastConfirmationAttempt: new Date(),
          confirmationEmailSent: emailSent,
          updatedAt: new Date()
        } 
      }
    )

    return NextResponse.json({
      success: true,
      emailSent,
      emailError,
      booking: {
        id: booking._id,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        status: booking.status,
        bookingReference: booking.bookingReference
      }
    })

  } catch (error) {
    console.error('Booking confirmation error:', error)
    
    // Return different error messages based on error type
    if (error.name === 'MongoNetworkError') {
      return NextResponse.json(
        { error: 'Database connection issue. Please try again in a moment.' },
        { status: 503 }
      )
    }
    
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Your booking is saved, but confirmation email may be delayed.' },
      { status: 500 }
    )
  } finally {
    try {
      await client.close()
    } catch (closeError) {
      console.error('Error closing database connection:', closeError)
    }
  }
}

// Helper function to get service duration
function getServiceDuration(service) {
  const durations = {
    'Individual Teen Session': '50 minutes',
    'Family Therapy': '75 minutes',
    'Parent Coaching': '60 minutes',
    'Teen Group Session': '90 minutes',
    'Group Session': '90 minutes'
  }
  return durations[service] || '60 minutes'
}

// Helper function to get user-friendly email error messages
function getEmailErrorMessage(error) {
  if (error.message?.includes('ENOTFOUND')) {
    return 'Email service temporarily unavailable. We\'ll send your confirmation shortly.'
  }
  
  if (error.message?.includes('timeout')) {
    return 'Email delivery is slow but will arrive shortly.'
  }
  
  if (error.message?.includes('Invalid email')) {
    return 'There was an issue with the email address. Please contact us to update it.'
  }
  
  if (error.code === 'ECONNREFUSED') {
    return 'Email service is temporarily down. Your booking is confirmed, but please save these details.'
  }
  
  return 'Email delivery is experiencing delays but your booking is confirmed.'
}

// Helper function to log email failures for debugging
async function logEmailFailure(db, bookingId, error) {
  try {
    await db.collection('email_failures').insertOne({
      bookingId,
      error: error.message,
      errorCode: error.code,
      timestamp: new Date(),
      resolved: false
    })
  } catch (logError) {
    console.error('Failed to log email failure:', logError)
  }
}

// Alternative endpoint for manual confirmation retry
export async function PUT(request) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { bookingId, forceEmail = false } = body

    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: 'Valid booking ID is required' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    const booking = await db.collection('bookings').findOne(
      { _id: new ObjectId(bookingId) }
    )

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Attempt to send email again with admin override
    if (forceEmail) {
      try {
        const emailData = {
          email: booking.userEmail,
          clientName: booking.userName || 'Valued Client',
          serviceType: booking.service,
          appointmentDate: booking.date,
          appointmentTime: booking.time,
          sessionDuration: getServiceDuration(booking.service),
          sessionFee: 'Free of Charge',
          bookingStatus: 'Confirmed',
          notes: booking.notes || '',
          bookingReference: booking.bookingReference || booking._id.toString(),
          location: 'No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria',
          contactPhone: '+234 803 309 4050',
          contactEmail: 'support@giltcounselling.com'
        }

        await emailTemplates.sendBookingConfirmation(emailData)
        
        // Update booking status
        await db.collection('bookings').updateOne(
          { _id: new ObjectId(bookingId) },
          { 
            $set: { 
              confirmationEmailSent: true,
              adminConfirmed: true,
              adminConfirmedBy: session.user.email,
              adminConfirmedAt: new Date(),
              updatedAt: new Date()
            } 
          }
        )

        return NextResponse.json({
          success: true,
          message: 'Confirmation email sent successfully by admin',
          emailSent: true
        })

      } catch (emailError) {
        console.error('Admin email retry failed:', emailError)
        return NextResponse.json({
          success: false,
          error: 'Failed to send email even with admin retry',
          emailError: getEmailErrorMessage(emailError)
        }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking._id,
        confirmationEmailSent: booking.confirmationEmailSent || false,
        lastConfirmationAttempt: booking.lastConfirmationAttempt
      }
    })

  } catch (error) {
    console.error('Admin confirmation retry error:', error)
    return NextResponse.json(
      { error: 'Internal server error during admin retry' },
      { status: 500 }
    )
  } finally {
    try {
      await client.close()
    } catch (closeError) {
      console.error('Error closing database connection:', closeError)
    }
  }
}
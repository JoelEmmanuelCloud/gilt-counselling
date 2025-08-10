// app/api/bookings/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { MongoClient } from 'mongodb'
import { emailTemplates } from '@/lib/email-templates'

// Import authOptions - adjust this path to match your NextAuth configuration
let authOptions
try {
  authOptions = require('../auth/[...nextauth]/route').authOptions
} catch (error) {
  console.log('Could not import authOptions, using basic session check')
}

const client = new MongoClient(process.env.MONGODB_URI)

// Service details mapping (no pricing mentioned)
const SERVICE_DETAILS = {
  'Individual Teen Session': { duration: '50 minutes', description: 'One-on-one counselling for teenagers' },
  'Family Therapy': { duration: '75 minutes', description: 'Collaborative family counselling sessions' },
  'Parent Coaching': { duration: '60 minutes', description: 'Guidance and support for parents' },
  'Teen Group Session': { duration: '90 minutes', description: 'Peer support group for teenagers' }
}

// GET - Fetch bookings
export async function GET(request) {
  try {
    // Get session with or without authOptions
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit')) || 50
    const page = parseInt(searchParams.get('page')) || 1
    const skip = (page - 1) * limit

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Build query based on user role and parameters
    let query = {}
    
    // Non-admin users can only see their own bookings
    if (session.user.role !== 'admin') {
      query.userId = session.user.id
    } else if (userId) {
      query.userId = userId
    }
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status
    }

    // Get bookings with pagination
    const bookings = await db.collection('bookings')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count for pagination
    const totalCount = await db.collection('bookings').countDocuments(query)
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    // Convert ObjectIds to strings for JSON serialization
    const bookingsWithStringIds = bookings.map(booking => ({
      ...booking,
      _id: booking._id.toString()
    }))

    return NextResponse.json({
      bookings: bookingsWithStringIds,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPreviousPage,
        limit
      }
    })

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

// POST - Create new booking
export async function POST(request) {
  try {
    // Get session with or without authOptions
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { service, date, time, notes, tidyCalBookingId, duration } = body

    // Validate required fields
    if (!service || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields: service, date, time' }, 
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Check for duplicate booking (same user, same time slot)
    const existingBooking = await db.collection('bookings').findOne({
      userId: session.user.id,
      date: new Date(date),
      time: time,
      status: { $in: ['pending', 'confirmed'] }
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking at this time. Please choose a different time slot.' },
        { status: 409 }
      )
    }

    // Generate booking reference
    const bookingReference = `GB-${Date.now().toString().slice(-6)}`

    const booking = {
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name || session.user.email.split('@')[0],
      service,
      date: new Date(date),
      time,
      duration: duration || SERVICE_DETAILS[service]?.duration || '60 minutes',
      notes: notes || '',
      status: 'pending',
      tidyCalBookingId: tidyCalBookingId || null,
      bookingReference,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('bookings').insertOne(booking)

    // Get service details
    const serviceInfo = SERVICE_DETAILS[service] || { 
      duration: '60 minutes', 
      description: 'Counselling session'
    }

    // Send confirmation email using your existing template
    try {
      await emailTemplates.sendBookingConfirmation({
        email: session.user.email,
        clientName: booking.userName,
        serviceType: service,
        appointmentDate: date,
        appointmentTime: time,
        sessionDuration: serviceInfo.duration,
        sessionFee: '', // No fee mentioned
        bookingStatus: 'Pending Confirmation',
        notes: notes
      })

      // Send admin notification
      await emailTemplates.sendAdminNotification({
        type: 'new_booking',
        data: { 
          ...booking, 
          _id: result.insertedId,
          serviceDescription: serviceInfo.description
        }
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Don't fail the booking if email fails, but log it
    }

    return NextResponse.json(
      { 
        success: true, 
        bookingId: result.insertedId.toString(),
        bookingReference,
        booking: { 
          ...booking, 
          _id: result.insertedId.toString(),
          id: result.insertedId.toString() // For compatibility
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.', details: error.message },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
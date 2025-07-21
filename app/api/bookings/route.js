// src/app/api/bookings/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { MongoClient } from 'mongodb'
import { emailTemplates } from '@/lib/email-templates'

const client = new MongoClient(process.env.MONGODB_URI)

// Service pricing mapping
const SERVICE_PRICING = {
  'Individual Teen Session': { duration: '50 minutes', fee: '$120' },
  'Family Therapy': { duration: '75 minutes', fee: '$150' },
  'Parent Coaching': { duration: '60 minutes', fee: '$100' },
  'Group Session': { duration: '90 minutes', fee: '$60' }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { service, date, time, notes } = body

    await client.connect()
    const db = client.db('gilt-counselling')
    
    const booking = {
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name || 'Unknown',
      service,
      date: new Date(date),
      time,
      notes: notes || '',
      status: 'pending',
      createdAt: new Date(),
    }
    
    const result = await db.collection('bookings').insertOne(booking)

    // Get service details
    const serviceDetails = SERVICE_PRICING[service] || { duration: '60 minutes', fee: 'TBD' }

    // Send confirmation email using template
    await emailTemplates.sendBookingConfirmation({
      email: session.user.email,
      clientName: booking.userName,
      serviceType: service,
      appointmentDate: date,
      appointmentTime: time,
      sessionDuration: serviceDetails.duration,
      sessionFee: serviceDetails.fee,
      bookingStatus: 'Pending Confirmation',
      notes: notes
    })

    // Send admin notification
    await emailTemplates.sendAdminNotification({
      type: 'new_booking',
      data: booking
    })

    return NextResponse.json(
      { success: true, bookingId: result.insertedId },
      { status: 201 }
    )

  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
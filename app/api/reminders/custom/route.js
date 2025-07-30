// app/api/reminders/custom/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { ReminderSystem } from '@/lib/reminder-system'
import { ObjectId } from 'mongodb'

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, message, subject } = body

    if (!bookingId || !message) {
      return NextResponse.json(
        { error: 'Booking ID and message are required' },
        { status: 400 }
      )
    }

    await ReminderSystem.sendCustomReminder(
      new ObjectId(bookingId), 
      message, 
      subject
    )
    
    return NextResponse.json({
      success: true,
      message: 'Custom reminder sent successfully'
    })

  } catch (error) {
    console.error('Custom reminder error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message 
      },
      { status: 500 }
    )
  }
}
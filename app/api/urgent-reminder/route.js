// app/api/urgent-reminder/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { EnhancedReminderSystem } from '@/lib/enhanced-reminder-system'
import { ObjectId } from 'mongodb'

export async function POST(request) {
  try {
    const session = await getServerSession()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, message, subject } = await request.json()

    await EnhancedReminderSystem.sendUrgentReminder(
      new ObjectId(bookingId),
      message,
      subject
    )
    
    return NextResponse.json({ success: true })

  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
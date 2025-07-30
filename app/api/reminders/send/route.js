
// app/api/reminders/send/route.js
import { NextResponse } from 'next/server'
import { ReminderSystem } from '@/lib/reminder-system'

export async function POST(request) {
  try {
    // Verify this is called from a cron job or authorized source
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting reminder system...')
    const results = await ReminderSystem.sendAppointmentReminders()
    
    console.log('Reminder system completed:', results)
    
    return NextResponse.json({
      success: true,
      message: `Sent ${results.sent} reminders, ${results.failed} failed`,
      details: results
    })

  } catch (error) {
    console.error('Reminder system error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
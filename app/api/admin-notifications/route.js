// app/api/admin-notifications/route.js
import { NextResponse } from 'next/server'
import { EnhancedReminderSystem } from '@/lib/enhanced-reminder-system'

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = await EnhancedReminderSystem.sendAdminNotifications()
    
    return NextResponse.json({
      success: true,
      message: `Sent ${results.notificationsSent} admin notifications`
    })

  } catch (error) {
    console.error('Admin notification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
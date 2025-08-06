// app/api/contact/route.js
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { emailTemplates } from '@/lib/email-templates'

const client = new MongoClient(process.env.MONGODB_URI)

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, urgency = 'normal' } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required' },
        { status: 400 }
      )
    }

    const contactData = {
      name,
      email,
      phone,
      subject,
      message,
      urgency,
      read: false,
      createdAt: new Date()
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Save to database
    const result = await db.collection('messages').insertOne(contactData)

    // Send confirmation email to user
    await emailTemplates.sendContactResponse({
      email,
      contactName: name,
      subject,
      priorityLevel: urgency,
      phone,
      isUrgent: urgency === 'urgent' || urgency === 'emergency'
    })

    // Send notification to admin
    await emailTemplates.sendAdminNotification('new_contact', contactData)

    return NextResponse.json({ 
      success: true, 
      messageId: result.insertedId 
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
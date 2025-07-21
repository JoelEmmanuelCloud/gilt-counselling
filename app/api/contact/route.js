// src/app/api/contact/route.js
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { emailTemplates } from '@/lib/email-templates'

const client = new MongoClient(process.env.MONGODB_URI)

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message, urgency } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Save message to database
    const messageDoc = {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      urgency: urgency || 'normal',
      read: false,
      createdAt: new Date(),
    }
    
    const result = await db.collection('messages').insertOne(messageDoc)

    // Send admin notification
    await emailTemplates.sendAdminNotification({
      type: 'new_contact',
      data: messageDoc
    })

    // Send confirmation email to user using template
    await emailTemplates.sendContactResponse({
      email,
      contactName: name,
      subject,
      priorityLevel: urgency || 'Normal',
      phone,
      isUrgent: urgency === 'urgent' || urgency === 'emergency'
    })

    return NextResponse.json(
      { success: true, messageId: result.insertedId },
      { status: 201 }
    )

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

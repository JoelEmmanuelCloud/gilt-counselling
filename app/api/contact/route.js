// app/api/contact/route.js
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { emailTemplates } from '@/lib/email-templates'

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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('gilt-counselling')

    // Create message object
    const messageData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : null,
      subject: subject.trim(),
      message: message.trim(),
      urgency: urgency || 'normal',
      read: false,
      replied: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Insert message into database
    const result = await db.collection('messages').insertOne(messageData)

    if (!result.insertedId) {
      throw new Error('Failed to save message')
    }

    // Send confirmation email to user using  template
    try {
      await emailTemplates.sendContactResponse({
        email: messageData.email,
        contactName: messageData.name,
        subject: messageData.subject,
        priorityLevel: messageData.urgency,
        phone: messageData.phone,
        isUrgent: messageData.urgency === 'urgent' || messageData.urgency === 'emergency'
      })

    } catch (emailError) {
      console.error('❌ Failed to send confirmation email:', emailError)
      // Don't fail the entire request if email fails
    }

    // Send enhanced admin notification email using template
    try {
      await emailTemplates.sendAdminNotification({
        type: 'new_contact',
        data: messageData
      })

    } catch (emailError) {
      console.error('❌ Failed to send admin notification:', emailError)
      // Don't fail the entire request if email fails
    }

    // Log for debugging
    console.log('📨 New message received:', {
      id: result.insertedId,
      name: messageData.name,
      email: messageData.email,
      urgency: messageData.urgency,
      subject: messageData.subject.substring(0, 50) + '...'
    })

    // Return success response
    return NextResponse.json(
      { 
        success: true,
        messageId: result.insertedId,
        message: 'Message sent successfully'
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('❌ Contact form submission error:', error)
        
    // Return appropriate error response
    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again or contact us directly.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

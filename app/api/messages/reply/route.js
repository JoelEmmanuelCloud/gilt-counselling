// app/api/messages/reply/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import { emailTemplates } from '@/lib/email-templates'

// Import authOptions
let authOptions
try {
  authOptions = require('../../auth/[...nextauth]/route').authOptions
} catch (error) {

}

export async function POST(request) {
  try {
    // Check admin authentication
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, replySubject, replyMessage, senderName } = body

    // Validate required fields
    if (!messageId || !replySubject || !replyMessage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate ObjectId
    if (!ObjectId.isValid(messageId)) {
      return NextResponse.json({ error: 'Invalid message ID' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('gilt-counselling')

    // Get the original message
    const originalMessage = await db.collection('messages').findOne({
      _id: new ObjectId(messageId)
    })

    if (!originalMessage) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Create reply data for database
    const replyData = {
      originalMessageId: messageId,
      senderName: senderName || session.user.name || 'Gilt Counselling Team',
      senderEmail: session.user.email,
      recipientName: originalMessage.name,
      recipientEmail: originalMessage.email,
      subject: replySubject,
      message: replyMessage,
      sentAt: new Date(),
      originalSubject: originalMessage.subject,
      originalMessage: originalMessage.message
    }

    // Send email using template
    const emailResult = await emailTemplates.sendAdminReply({
      recipientEmail: originalMessage.email,
      recipientName: originalMessage.name,
      replySubject: replySubject,
      replyMessage: replyMessage,
      senderName: senderName || session.user.name || 'Dr. Ugwu - Gilt Counselling',
      originalSubject: originalMessage.subject,
      originalMessage: originalMessage.message
    })

    if (!emailResult.success) {
      throw new Error(emailResult.error || 'Failed to send email')
    }

    // Save reply to database
    await db.collection('message_replies').insertOne(replyData)

    // Update original message to mark as replied
    await db.collection('messages').updateOne(
      { _id: new ObjectId(messageId) },
      {
        $set: {
          replied: true,
          repliedAt: new Date(),
          repliedBy: session.user.email,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully',
      replyId: replyData._id
    })

  } catch (error) {
    console.error('❌ Reply message error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send reply',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

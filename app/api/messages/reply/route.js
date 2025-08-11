// app/api/messages/reply/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/mongodb'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Import authOptions
let authOptions
try {
  authOptions = require('../../auth/[...nextauth]/route').authOptions
} catch (error) {
  console.log('Could not import authOptions, using basic session check')
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

    // Create reply data
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

    // Send email reply
    const emailMsg = {
      to: originalMessage.email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      subject: replySubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); color: white; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-family: 'Playfair Display', serif;">Gilt Counselling</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Mental Health Support</p>
          </div>
          
          <!-- Main Content -->
          <div style="background: white; padding: 30px 20px;">
            <p style="color: #00303F; font-size: 16px; margin: 0 0 20px 0;">Dear ${originalMessage.name},</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #D4AF37; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
              <p style="margin: 0; color: #00303F; line-height: 1.6;">${replyMessage.replace(/\n/g, '<br>')}</p>
            </div>
            
            <!-- Original Message Reference -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <h3 style="color: #00303F; font-size: 16px; margin: 0 0 15px 0;">Your Original Message:</h3>
              <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;">
                <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px;"><strong>Subject:</strong> ${originalMessage.subject}</p>
                <p style="margin: 0; color: #495057; font-size: 14px; line-height: 1.5;">${originalMessage.message.substring(0, 200)}${originalMessage.message.length > 200 ? '...' : ''}</p>
              </div>
            </div>
            
            <!-- Contact Information -->
            <div style="background: #e8f4f8; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #00303F; margin: 0 0 15px 0; font-size: 18px;">Need Further Assistance?</h3>
              <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 200px;">
                  <p style="margin: 0 0 8px 0; color: #00303F; font-weight: bold;">📞 Phone</p>
                  <p style="margin: 0; color: #495057;">+234 803 309 4050</p>
                </div>
                <div style="flex: 1; min-width: 200px;">
                  <p style="margin: 0 0 8px 0; color: #00303F; font-weight: bold;">✉️ Email</p>
                  <p style="margin: 0; color: #495057;">wecare@giltcounselling.com</p>
                </div>
              </div>
              <div style="margin-top: 15px;">
                <p style="margin: 0 0 8px 0; color: #00303F; font-weight: bold;">🕒 Office Hours</p>
                <p style="margin: 0; color: #495057;">Monday - Friday: 9:00 AM - 6:00 PM (WAT)</p>
              </div>
            </div>
            
            <!-- Call to Action -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking" 
                 style="background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Schedule an Appointment
              </a>
            </div>
            
            <p style="color: #00303F; margin: 20px 0 0 0;">
              Best regards,<br>
              <strong>${replyData.senderName}</strong><br>
              <span style="color: #6c757d;">Gilt Counselling Team</span>
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background: #00303F; color: white; padding: 20px; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 14px;">
              <strong>Gilt Counselling</strong> - Professional Mental Health Support
            </p>
            <p style="margin: 0; font-size: 12px; opacity: 0.8;">
              No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria
            </p>
          </div>
        </div>
      `,
      // Fallback text version
      text: `
Dear ${originalMessage.name},

${replyMessage}

Your Original Message:
Subject: ${originalMessage.subject}
${originalMessage.message.substring(0, 200)}${originalMessage.message.length > 200 ? '...' : ''}

Need Further Assistance?
Phone: +234 803 309 4050
Email: wecare@giltcounselling.com
Office Hours: Monday - Friday: 9:00 AM - 6:00 PM (WAT)

Best regards,
${replyData.senderName}
Gilt Counselling Team

Schedule an appointment: ${process.env.NEXT_PUBLIC_APP_URL}/booking
      `
    }

    // Send the email
    await sgMail.send(emailMsg)

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
    console.error('Reply message error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to send reply',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

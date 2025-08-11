// app/api/bookings/urgent-message/route.js
import { MongoClient, ObjectId } from 'mongodb'
import sgMail from '@sendgrid/mail'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const client = new MongoClient(process.env.MONGODB_URI)

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { bookingId, message, tidyCalBookingId } = await request.json()

    if (!bookingId || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Get booking details
    const booking = await db.collection('bookings').findOne({ 
      _id: new ObjectId(bookingId) 
    })

    if (!booking) {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Send email using SendGrid
    const emailMsg = {
      to: booking.userEmail,
      from: {
        name: 'Gilt Counselling',
        email: process.env.SENDGRID_FROM_EMAIL
      },
      subject: 'Important Update - Gilt Counselling',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e3a8a; font-family: 'Playfair Display', serif; margin: 0;">
              Gilt Counselling
            </h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Professional Mental Health Support</p>
          </div>
          
          <h2 style="color: #1e3a8a; border-bottom: 2px solid #f59e0b; padding-bottom: 10px;">
            Important Update About Your Appointment
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">Dear ${booking.userName},</p>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-weight: bold; color: #92400e; font-size: 16px;">🚨 Urgent Message:</p>
            <p style="margin: 12px 0 0 0; color: #92400e; font-size: 15px; line-height: 1.5;">${message}</p>
          </div>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #1e3a8a; margin: 0 0 15px 0; font-size: 18px;">📅 Your Appointment Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 30%;">Service:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${booking.service}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Date:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${new Date(booking.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Time:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${booking.time}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Duration:</td>
                <td style="padding: 8px 0; color: #1e3a8a;">${booking.duration}</td>
              </tr>
              ${booking.meetingUrl ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #374151;">Meeting Link:</td>
                <td style="padding: 8px 0;">
                  <a href="${booking.meetingUrl}" style="color: #3b82f6; text-decoration: none; background-color: #eff6ff; padding: 8px 12px; border-radius: 6px; display: inline-block;">
                    🎥 Join Meeting
                  </a>
                </td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 16px;">📞 Need Immediate Assistance?</h3>
            <p style="margin: 0; color: #0c4a6e; line-height: 1.6;">
              If you have any questions or concerns, please contact us immediately:
            </p>
            <div style="margin: 15px 0 0 0;">
              <p style="margin: 5px 0; color: #0c4a6e;">
                <strong>📱 Phone:</strong> 
                <a href="tel:+2348033094050" style="color: #0ea5e9; text-decoration: none;">+234 803 309 4050</a>
              </p>
              <p style="margin: 5px 0; color: #0c4a6e;">
                <strong>✉️ Email:</strong> 
                <a href="mailto:wecare@giltcounselling.com" style="color: #0ea5e9; text-decoration: none;">wecare@giltcounselling.com</a>
              </p>
              <p style="margin: 5px 0; color: #0c4a6e; font-size: 14px;">
                <strong>🕒 Office Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (WAT)
              </p>
            </div>
          </div>
          
          <div style="margin: 30px 0; padding: 20px 0; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="margin: 0 0 10px 0; color: #374151; line-height: 1.6;">
              Thank you for choosing Gilt Counselling. We're here to support you on your mental health journey.
            </p>
            
            <p style="margin: 15px 0 5px 0; color: #374151; font-weight: bold;">
              Best regards,
            </p>
            <p style="margin: 0; color: #1e3a8a; font-weight: bold;">
              Dr. Ugwu and the Gilt Counselling Team
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #dc2626; font-size: 12px; line-height: 1.4;">
              <strong>Crisis Support:</strong> If you're experiencing a mental health emergency, 
              please call our emergency line at <strong>+234 803 309 4050</strong> or contact your local emergency services.
            </p>
          </div>
          
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p style="margin: 0;">
              This message was sent regarding your appointment (Ref: ${booking.bookingReference || booking._id.toString().slice(-6)})
            </p>
            <p style="margin: 5px 0 0 0;">
              Gilt Counselling | No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria
            </p>
          </div>
        </div>
      `
    }

    await sgMail.send(emailMsg)

    // Log the message in the database
    await db.collection('bookings').updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $push: {
          urgentMessages: {
            message,
            sentAt: new Date(),
            sentBy: session.user.name || session.user.email,
            emailSent: true
          }
        }
      }
    )

    return Response.json({ 
      success: true, 
      message: 'Urgent message sent successfully' 
    })
  } catch (error) {
    console.error('Error sending urgent message:', error)
    return Response.json({ 
      error: 'Failed to send urgent message: ' + error.message 
    }, { status: 500 })
  } finally {
    await client.close()
  }
}

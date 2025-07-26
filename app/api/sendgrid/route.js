// app/api/sendgrid/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function POST(request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, recipients, subject, content, templateData } = body

    switch (type) {
      case 'newsletter':
        return await sendNewsletter(recipients, subject, content)
      
      case 'booking_reminder':
        return await sendBookingReminder(recipients, templateData)
      
      case 'bulk_email':
        return await sendBulkEmail(recipients, subject, content)
      
      case 'custom_template':
        return await sendCustomTemplate(recipients, templateData)
      
      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 })
    }

  } catch (error) {
    console.error('SendGrid API error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

async function sendNewsletter(recipients, subject, content) {
  try {
    const messages = recipients.map(recipient => ({
      to: recipient.email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      subject: subject,
      html: generateNewsletterHTML(content, recipient.name),
      text: content.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      },
      mailSettings: {
        sandboxMode: { enable: process.env.NODE_ENV === 'development' }
      }
    }))

    await sgMail.send(messages)
    
    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${recipients.length} recipients`
    })

  } catch (error) {
    throw new Error(`Newsletter send failed: ${error.message}`)
  }
}

async function sendBookingReminder(recipients, templateData) {
  try {
    const messages = recipients.map(recipient => ({
      to: recipient.email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      subject: 'Upcoming Appointment Reminder - Gilt Counselling',
      html: generateBookingReminderHTML(templateData, recipient),
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    }))

    await sgMail.send(messages)
    
    return NextResponse.json({
      success: true,
      message: `Booking reminders sent to ${recipients.length} recipients`
    })

  } catch (error) {
    throw new Error(`Booking reminder send failed: ${error.message}`)
  }
}

async function sendBulkEmail(recipients, subject, content) {
  try {
    const messages = recipients.map(recipient => ({
      to: recipient.email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      subject: subject,
      html: generateBulkEmailHTML(content, recipient.name),
      text: content.replace(/<[^>]*>/g, ''),
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true }
      }
    }))

    await sgMail.send(messages)
    
    return NextResponse.json({
      success: true,
      message: `Bulk email sent to ${recipients.length} recipients`
    })

  } catch (error) {
    throw new Error(`Bulk email send failed: ${error.message}`)
  }
}

async function sendCustomTemplate(recipients, templateData) {
  try {
    const messages = recipients.map(recipient => ({
      to: recipient.email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Gilt Counselling'
      },
      templateId: templateData.templateId,
      dynamicTemplateData: {
        ...templateData.data,
        recipient_name: recipient.name,
        recipient_email: recipient.email
      }
    }))

    await sgMail.send(messages)
    
    return NextResponse.json({
      success: true,
      message: `Custom template sent to ${recipients.length} recipients`
    })

  } catch (error) {
    throw new Error(`Custom template send failed: ${error.message}`)
  }
}

function generateNewsletterHTML(content, recipientName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%); color: white; padding: 40px 20px; text-align: center;">
        <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 28px; font-weight: bold;">
          Gilt Counselling Newsletter
        </h1>
        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
          Mental Health Insights & Family Guidance
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 40px 20px;">
        <p style="color: #00303F; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Dear ${recipientName || 'Friend'},
        </p>
        
        <div style="color: #374151; font-size: 16px; line-height: 1.6;">
          ${content}
        </div>

        <!-- Call to Action -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="https://giltcounselling.com/booking" 
             style="background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Book a Session
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #F8F5F2; padding: 30px 20px; text-align: center; border-top: 1px solid #E5E7EB;">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #00303F; margin: 0 0 10px 0; font-family: 'Playfair Display', serif;">
            Gilt Counselling
          </h3>
          <p style="color: #6B7280; margin: 0; font-size: 14px;">
            No 88 Woji Road, GRA Phase 2, <br>
            Port Harcourt, Rivers State, Nigeria<br>
            +234 803 309 4050
          </p>
        </div>
        
        <div style="margin-bottom: 20px;">
          <a href="https://giltcounselling.com" style="color: #D4AF37; text-decoration: none; margin: 0 10px;">Website</a>
          <a href="https://giltcounselling.com/blog" style="color: #D4AF37; text-decoration: none; margin: 0 10px;">Blog</a>
          <a href="https://giltcounselling.com/contact" style="color: #D4AF37; text-decoration: none; margin: 0 10px;">Contact</a>
        </div>
        
        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
          You're receiving this because you subscribed to our newsletter.<br>
          <a href="{{unsubscribe}}" style="color: #9CA3AF;">Unsubscribe</a> | 
          <a href="{{preferences}}" style="color: #9CA3AF;">Update Preferences</a>
        </p>
      </div>
    </div>
  `
}

function generateBookingReminderHTML(templateData, recipient) {
  const { appointmentDate, appointmentTime, service, location } = templateData
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #00303F; color: white; padding: 30px 20px; text-align: center;">
        <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 24px;">
          Appointment Reminder
        </h1>
      </div>

      <!-- Content -->
      <div style="padding: 30px 20px;">
        <p style="color: #00303F; font-size: 16px; margin-bottom: 20px;">
          Dear ${recipient.name},
        </p>
        
        <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          This is a friendly reminder about your upcoming counselling appointment with Dr. Ugwu.
        </p>

        <!-- Appointment Details -->
        <div style="background: #F8F5F2; border-left: 4px solid #D4AF37; padding: 20px; margin-bottom: 30px;">
          <h3 style="color: #00303F; margin: 0 0 15px 0;">Appointment Details</h3>
          <div style="color: #374151;">
            <p style="margin: 5px 0;"><strong>Service:</strong> ${service}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${appointmentDate}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${appointmentTime}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${location || 'In-person at our office'}</p>
          </div>
        </div>

        <!-- Important Information -->
        <div style="background: #EBF8FF; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h4 style="color: #00303F; margin: 0 0 10px 0;">Important Reminders:</h4>
          <ul style="color: #374151; margin: 0; padding-left: 20px;">
            <li>Please arrive 10 minutes early</li>
            <li>Bring a valid ID and insurance information</li>
            <li>If you need to reschedule, please call at least 24 hours in advance</li>
            <li>No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria</li>
          </ul>
        </div>

        <!-- Contact Information -->
        <div style="text-align: center;">
          <p style="color: #374151; margin-bottom: 20px;">
            Questions? Need to reschedule?
          </p>
          <p style="color: #00303F; font-weight: bold; margin-bottom: 10px;">
            📞 +234 803 309 4050<br>
            ✉️ support@giltcounselling.com
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #F3F4F6; padding: 20px; text-align: center;">
        <p style="color: #6B7280; font-size: 14px; margin: 0;">
          We look forward to seeing you!<br>
          <strong>Dr. Ugwu and the Gilt Counselling Team</strong>
        </p>
      </div>
    </div>
  `
}

function generateBulkEmailHTML(content, recipientName) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <!-- Header -->
      <div style="background: #00303F; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 24px;">
          Gilt Counselling
        </h1>
      </div>

      <!-- Content -->
      <div style="padding: 30px 20px;">
        <p style="color: #00303F; font-size: 16px; margin-bottom: 20px;">
          Dear ${recipientName || 'Friend'},
        </p>
        
        <div style="color: #374151; font-size: 16px; line-height: 1.6;">
          ${content}
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #F8F5F2; padding: 20px; text-align: center;">
        <p style="color: #6B7280; font-size: 14px; margin: 0;">
          <strong>Gilt Counselling</strong><br>
          No 88 Woji Road, GRA Phase 2, Port Harcourt, Rivers State, Nigeria | +234 803 309 4050 <br>
          <a href="{{unsubscribe}}" style="color: #6B7280;">Unsubscribe</a>
        </p>
      </div>
    </div>
  `
}

// GET endpoint for email templates and stats
export async function GET(request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'templates':
        return NextResponse.json({
          templates: [
            { id: 'newsletter', name: 'Newsletter Template' },
            { id: 'booking_reminder', name: 'Booking Reminder' },
            { id: 'welcome', name: 'Welcome Email' },
            { id: 'follow_up', name: 'Session Follow-up' }
          ]
        })
      
      case 'stats':
        // In a real app, fetch from SendGrid API
        return NextResponse.json({
          emailsSent: 245,
          openRate: 68.5,
          clickRate: 12.3,
          bounceRate: 2.1
        })
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('SendGrid GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
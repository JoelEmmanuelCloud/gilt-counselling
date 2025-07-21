//app/api/newsletter/route.js
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const client = new MongoClient(process.env.MONGODB_URI)

export async function POST(request) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Check if email already exists
    const existingSubscriber = await db.collection('newsletter_subscribers')
      .findOne({ email })

    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        )
      } else {
        // Reactivate subscription
        await db.collection('newsletter_subscribers').updateOne(
          { email },
          { 
            $set: { 
              subscribed: true, 
              resubscribedAt: new Date(),
              name: name || existingSubscriber.name
            }
          }
        )
        
        return NextResponse.json(
          { success: true, message: 'Subscription reactivated successfully!' },
          { status: 200 }
        )
      }
    }

    // Add new subscriber
    const subscriber = {
      email,
      name: name || null,
      subscribed: true,
      createdAt: new Date(),
      source: 'website',
      preferences: {
        mentalHealthTips: true,
        parentingAdvice: true,
        blogUpdates: true,
        eventNotifications: true
      }
    }

    const result = await db.collection('newsletter_subscribers').insertOne(subscriber)

    // Send welcome email
    const welcomeEmail = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Welcome to Gilt Counselling Newsletter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #D4AF37; color: white; padding: 20px; text-align: center;">
            <h1>Welcome to Our Newsletter!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Dear ${name || 'Friend'},</p>
            
            <p>Thank you for subscribing to the Gilt Counselling newsletter! You'll now receive:</p>
            
            <ul style="color: #00303F; line-height: 1.6;">
              <li>Weekly mental health insights and tips</li>
              <li>Parenting strategies for raising healthy teens</li>
              <li>Latest blog posts from Dr. Ugwu</li>
              <li>Updates on workshops and community events</li>
              <li>Exclusive resources for families</li>
            </ul>
            
            <div style="background: #F8F5F2; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #00303F; margin-top: 0;">What to Expect</h3>
              <p style="margin-bottom: 0; color: #4B5563;">We typically send 1-2 emails per week with valuable content to support your family's mental health journey. No spam, just helpful insights!</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://giltcounselling.com/blog" 
                 style="background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Read Our Latest Blog Posts
              </a>
            </div>
            
            <p>If you have any questions or need support, don't hesitate to reach out:</p>
            <ul style="list-style: none; padding: 0;">
              <li>📧 Email: support@giltcounselling.com</li>
              <li>📞 Phone: (123) 456-7890</li>
              <li>🌐 Website: giltcounselling.com</li>
            </ul>
            
            <p>We're here to support you and your family.</p>
            
            <p>Warm regards,<br>
            <strong>Dr. Ugwu & the Gilt Counselling Team</strong></p>
            
            <div style="border-top: 1px solid #E5E7EB; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #6B7280;">
              <p>You're receiving this email because you subscribed to our newsletter at giltcounselling.com.</p>
              <p>
                <a href="{{unsubscribe_url}}" style="color: #D4AF37;">Unsubscribe</a> | 
                <a href="https://giltcounselling.com/privacy" style="color: #D4AF37;">Privacy Policy</a> | 
                <a href="https://giltcounselling.com/contact" style="color: #D4AF37;">Contact Us</a>
              </p>
              <p>Gilt Counselling<br>123 Wellness Drive, Suite 200<br>Your City, ST 12345</p>
            </div>
          </div>
        </div>
      `,
    }

    await sgMail.send(welcomeEmail)

    // Send notification to admin
    const adminNotification = {
      to: process.env.SENDGRID_NOTIFICATION_EMAIL,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'New Newsletter Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #00303F; color: white; padding: 20px; text-align: center;">
            <h1>New Newsletter Subscriber</h1>
          </div>
          
          <div style="padding: 20px;">
            <p><strong>New subscriber details:</strong></p>
            <ul>
              <li><strong>Email:</strong> ${email}</li>
              <li><strong>Name:</strong> ${name || 'Not provided'}</li>
              <li><strong>Source:</strong> Website</li>
              <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
            
            <p>Total subscribers: ${await db.collection('newsletter_subscribers').countDocuments({ subscribed: true })}</p>
            
            <div style="text-align: center; margin-top: 20px;">
              <a href="https://giltcounselling.com/dashboard" 
                 style="background: #D4AF37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                View Dashboard
              </a>
            </div>
          </div>
        </div>
      `,
    }

    await sgMail.send(adminNotification)

    return NextResponse.json(
      { 
        success: true, 
        message: 'Successfully subscribed to newsletter!',
        subscriberId: result.insertedId 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    
    // Handle specific SendGrid errors
    if (error.response?.body?.errors) {
      console.error('SendGrid errors:', error.response.body.errors)
    }
    
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

// Handle unsubscribe requests
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Find subscriber
    const subscriber = await db.collection('newsletter_subscribers')
      .findOne({ email })

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    // Verify unsubscribe token (basic implementation)
    const expectedToken = Buffer.from(email).toString('base64')
    if (token && token !== expectedToken) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 400 }
      )
    }

    // Update subscription status
    await db.collection('newsletter_subscribers').updateOne(
      { email },
      { 
        $set: { 
          subscribed: false, 
          unsubscribedAt: new Date() 
        }
      }
    )

    // Send confirmation email
    const confirmationEmail = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Unsubscribed from Gilt Counselling Newsletter',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6B7280; color: white; padding: 20px; text-align: center;">
            <h1>Unsubscribed Successfully</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello ${subscriber.name || 'there'},</p>
            
            <p>You have successfully unsubscribed from the Gilt Counselling newsletter.</p>
            
            <p>We're sorry to see you go! If you change your mind, you can always resubscribe on our website.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://giltcounselling.com" 
                 style="background: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Visit Our Website
              </a>
            </div>
            
            <p>If you have any feedback about why you unsubscribed, we'd love to hear from you at support@giltcounselling.com</p>
            
            <p>Thank you for being part of our community.</p>
            
            <p>Best wishes,<br>
            <strong>The Gilt Counselling Team</strong></p>
          </div>
        </div>
      `,
    }

    await sgMail.send(confirmationEmail)

    return NextResponse.json(
      { success: true, message: 'Successfully unsubscribed' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Failed to unsubscribe. Please try again later.' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

// Get newsletter statistics (admin only)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminKey = searchParams.get('key')
    
    // Simple admin authentication - in production, use proper session validation
    if (adminKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    const stats = await db.collection('newsletter_subscribers').aggregate([
      {
        $group: {
          _id: null,
          totalSubscribers: { $sum: 1 },
          activeSubscribers: {
            $sum: { $cond: [{ $eq: ['$subscribed', true] }, 1, 0] }
          },
          inactiveSubscribers: {
            $sum: { $cond: [{ $eq: ['$subscribed', false] }, 1, 0] }
          }
        }
      }
    ]).toArray()

    const recentSubscribers = await db.collection('newsletter_subscribers')
      .find({ subscribed: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()

    const subscribersBySource = await db.collection('newsletter_subscribers').aggregate([
      { $match: { subscribed: true } },
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]).toArray()

    return NextResponse.json({
      stats: stats[0] || {
        totalSubscribers: 0,
        activeSubscribers: 0,
        inactiveSubscribers: 0
      },
      recentSubscribers: recentSubscribers.map(sub => ({
        email: sub.email,
        name: sub.name,
        createdAt: sub.createdAt,
        source: sub.source
      })),
      subscribersBySource
    })

  } catch (error) {
    console.error('Newsletter stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch newsletter statistics' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
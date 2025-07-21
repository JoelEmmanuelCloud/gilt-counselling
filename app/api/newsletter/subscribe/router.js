//app/api/newsletter/subscribe/route.js
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { emailTemplates } from '@/lib/email-templates'

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

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Check if already subscribed
    const existing = await db.collection('newsletter_subscribers').findOne({ email })
    
    if (existing) {
      return NextResponse.json(
        { message: 'Already subscribed' },
        { status: 200 }
      )
    }

    // Add to database
    const subscriber = {
      email,
      name: name || null,
      subscribedAt: new Date(),
      active: true,
      source: 'website'
    }
    
    await db.collection('newsletter_subscribers').insertOne(subscriber)

    // Send welcome email
    await emailTemplates.sendNewsletterWelcome({
      email,
      subscriberName: name || 'Friend'
    })

    return NextResponse.json(
      { success: true, message: 'Successfully subscribed!' },
      { status: 201 }
    )

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

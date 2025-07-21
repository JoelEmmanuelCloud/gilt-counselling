//app/api/unsubscribe/route.js
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)

export async function POST(request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Update subscriber status
    await db.collection('newsletter_subscribers').updateOne(
      { email },
      { $set: { active: false, unsubscribedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  } finally {
    await client.close()
  }
}

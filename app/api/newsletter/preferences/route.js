
//app/api/newsletter/preferences/route.js
import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)

export async function POST(request) {
  try {
    const { email, preferences } = await request.json()
    
    await client.connect()
    const db = client.db('gilt-counselling')
    
    await db.collection('newsletter_subscribers').updateOne(
      { email },
      { $set: { preferences, updatedAt: new Date() } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Preferences update error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  } finally {
    await client.close()
  }
}
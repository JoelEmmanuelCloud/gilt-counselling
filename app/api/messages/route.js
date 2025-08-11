// app/api/messages/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import clientPromise from '@/lib/mongodb'

// Import authOptions - adjust this path to match your NextAuth configuration
let authOptions
try {
  authOptions = require('../auth/[...nextauth]/route').authOptions
} catch (error) {
}

export async function GET(request) {
  try {
    // Get session with or without authOptions
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await clientPromise
    const db = client.db('gilt-counselling')
        
    const messages = await db.collection('messages')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    // Convert ObjectIds to strings for JSON serialization
    const messagesWithStringIds = messages.map(message => ({
      ...message,
      _id: message._id.toString()
    }))

    return NextResponse.json({ messages: messagesWithStringIds })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
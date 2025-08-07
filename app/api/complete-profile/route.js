// app/api/complete-profile/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { MongoClient, ObjectId } from 'mongodb'
import { authOptions } from '../auth/[...nextauth]/route'

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    const user = await db.collection('users').findOne({
      email: session.user.email
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if profile is complete
    const isProfileComplete = !!(user.firstName && user.lastName && user.phone)

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        role: user.role || 'user'
      },
      isProfileComplete
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, phone } = body

    // Validate input
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'First name, last name, and phone number are required' },
        { status: 400 }
      )
    }

    // Basic phone validation
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Update user profile
    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      { 
        $set: { 
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          profileCompletedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Profile completed successfully'
    })

  } catch (error) {
    console.error('Complete profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
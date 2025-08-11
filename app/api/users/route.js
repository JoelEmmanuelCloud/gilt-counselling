// app/api/users/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { MongoClient, ObjectId } from 'mongodb'

// Import authOptions - adjust this path to match your NextAuth configuration
let authOptions
try {
  authOptions = require('../auth/[...nextauth]/route').authOptions
} catch (error) {
}

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET(request) {
  try {
    // Get session with or without authOptions
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Build query
    let query = {}
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    }
    if (role && role !== 'all') {
      query.role = role
    }

    // Get total count
    const totalUsers = await db.collection('users').countDocuments(query)
    
    // Get paginated users
    const users = await db.collection('users')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray()

    // Get user stats
    const [roleStats, profileStats] = await Promise.all([
      // Role statistics
      db.collection('users').aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Profile completion statistics
      db.collection('users').aggregate([
        {
          $match: { 
            $or: [
              { role: { $ne: 'admin' } },
              { role: { $exists: false } }
            ]
          }
        },
        {
          $group: {
            _id: {
              $cond: {
                if: {
                  $and: [
                    { $ne: ['$firstName', null] },
                    { $ne: ['$lastName', null] },
                    { $ne: ['$phone', null] },
                    { $ne: ['$firstName', ''] },
                    { $ne: ['$lastName', ''] },
                    { $ne: ['$phone', ''] }
                  ]
                },
                then: 'complete',
                else: 'incomplete'
              }
            },
            count: { $sum: 1 }
          }
        }
      ]).toArray()
    ])

    // Format stats
    const userStats = {
      total: totalUsers,
      admin: roleStats.find(s => s._id === 'admin')?.count || 0,
      user: roleStats.find(s => s._id === 'user')?.count || roleStats.find(s => s._id === null)?.count || 0,
      profileComplete: profileStats.find(s => s._id === 'complete')?.count || 0,
      profileIncomplete: profileStats.find(s => s._id === 'incomplete')?.count || 0
    }

    // Add calculated fields to users
    const usersWithCalculatedFields = users.map(user => ({
      ...user,
      _id: user._id.toString(),
      isProfileComplete: !!(user.firstName && user.lastName && user.phone),
      role: user.role || 'user' // Default role if not set
    }))

    return NextResponse.json({
      users: usersWithCalculatedFields,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit
      },
      stats: userStats
    })

  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

export async function POST(request) {
  try {
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, role = 'user' } = body

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Create new user
    const newUser = {
      email,
      role,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null
    }

    // Add profile fields if provided
    if (firstName) newUser.firstName = firstName.trim()
    if (lastName) newUser.lastName = lastName.trim()
    if (phone) newUser.phone = phone.trim()
    if (firstName && lastName && phone) {
      newUser.profileCompletedAt = new Date()
    }

    const result = await db.collection('users').insertOne(newUser)

    return NextResponse.json(
      { 
        success: true, 
        userId: result.insertedId,
        user: { 
          ...newUser, 
          _id: result.insertedId.toString(),
          isProfileComplete: !!(firstName && lastName && phone)
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}

export async function PUT(request) {
  try {
    const session = authOptions 
      ? await getServerSession(authOptions)
      : await getServerSession()
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, firstName, lastName, email, phone, role } = body

    if (!userId || !ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'Valid user ID is required' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    // Build update object
    const updateData = {}
    if (firstName !== undefined) updateData.firstName = firstName ? firstName.trim() : null
    if (lastName !== undefined) updateData.lastName = lastName ? lastName.trim() : null
    if (email) updateData.email = email
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null
    if (role) updateData.role = role
    updateData.updatedAt = new Date()

    // Check if profile is now complete
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) })
    if (user) {
      const currentFirstName = updateData.firstName !== undefined ? updateData.firstName : user.firstName
      const currentLastName = updateData.lastName !== undefined ? updateData.lastName : user.lastName
      const currentPhone = updateData.phone !== undefined ? updateData.phone : user.phone
      
      if (currentFirstName && currentLastName && currentPhone && !user.profileCompletedAt) {
        updateData.profileCompletedAt = new Date()
      }
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
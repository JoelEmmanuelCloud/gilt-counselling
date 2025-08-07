//app/api/dashboard/stats/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route' // Import auth options
import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions) // ✅ Pass auth config
    

        
    if (!session || session.user.role !== 'admin') {

      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
        
    // Get current date ranges
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        
    // Aggregate statistics
    const [
      totalBookings,
      pendingBookings,
      totalMessages,
      unreadMessages,
      totalUsers,
      newUsersThisWeek,
      bookingsThisMonth,
      messagesThisWeek
    ] = await Promise.all([
      db.collection('bookings').countDocuments(),
      db.collection('bookings').countDocuments({ status: 'pending' }),
      db.collection('messages').countDocuments(),
      db.collection('messages').countDocuments({ read: false }),
      db.collection('users').countDocuments(),
      db.collection('users').countDocuments({ 
        createdAt: { $gte: startOfWeek } 
      }),
      db.collection('bookings').countDocuments({ 
        createdAt: { $gte: startOfMonth } 
      }),
      db.collection('messages').countDocuments({ 
        createdAt: { $gte: startOfWeek } 
      })
    ])

    // Get recent activity
    const recentBookings = await db.collection('bookings')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    const recentMessages = await db.collection('messages')
      .find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray()

    const stats = {
      overview: {
        totalBookings,
        pendingBookings,
        totalMessages,
        unreadMessages,
        totalUsers,
        newUsersThisWeek,
        bookingsThisMonth,
        messagesThisWeek
      },
      recent: {
        bookings: recentBookings,
        messages: recentMessages
      }
    }

    return NextResponse.json(stats)
   } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await client.close()
  }
}
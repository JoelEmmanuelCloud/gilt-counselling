// app/api/bookings/stats/route.js (Bonus: Statistics endpoint)
import { MongoClient } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    // Get various statistics
    const [
      totalBookings,
      todayBookings,
      weekBookings,
      monthBookings,
      statusStats,
      serviceStats
    ] = await Promise.all([
      // Total bookings
      db.collection('bookings').countDocuments({}),
      
      // Today's bookings
      db.collection('bookings').countDocuments({
        date: new Date().toISOString().split('T')[0]
      }),
      
      // This week's bookings
      db.collection('bookings').countDocuments({
        date: { $gte: startOfWeek.toISOString().split('T')[0] }
      }),
      
      // This month's bookings
      db.collection('bookings').countDocuments({
        date: { $gte: startOfMonth.toISOString().split('T')[0] }
      }),
      
      // Status breakdown
      db.collection('bookings').aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Service type breakdown
      db.collection('bookings').aggregate([
        {
          $group: {
            _id: '$service',
            count: { $sum: 1 }
          }
        }
      ]).toArray()
    ])

    return Response.json({
      totalBookings,
      todayBookings,
      weekBookings,
      monthBookings,
      statusBreakdown: statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {}),
      serviceBreakdown: serviceStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count
        return acc
      }, {}),
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return Response.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  } finally {
    await client.close()
  }
}
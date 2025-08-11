// app/api/bookings/route.js
import { MongoClient } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    const bookings = await db.collection('bookings')
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    return Response.json({ 
      bookings: bookings.map(booking => ({
        ...booking,
        _id: booking._id.toString()
      }))
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return Response.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  } finally {
    await client.close()
  }
}

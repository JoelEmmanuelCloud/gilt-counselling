// app/api/bookings/[id]/route.js
import { MongoClient, ObjectId } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const client = new MongoClient(process.env.MONGODB_URI)

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()
    
    if (!status) {
      return Response.json({ error: 'Status is required' }, { status: 400 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          status, 
          updatedAt: new Date(),
          updatedBy: session.user.email
        } 
      }
    )

    if (result.matchedCount === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error updating booking:', error)
    return Response.json({ error: 'Failed to update booking' }, { status: 500 })
  } finally {
    await client.close()
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await client.connect()
    const db = client.db('gilt-counselling')
    
    const result = await db.collection('bookings').deleteOne(
      { _id: new ObjectId(params.id) }
    )

    if (result.deletedCount === 0) {
      return Response.json({ error: 'Booking not found' }, { status: 404 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error deleting booking:', error)
    return Response.json({ error: 'Failed to delete booking' }, { status: 500 })
  } finally {
    await client.close()
  }
}
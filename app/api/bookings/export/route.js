// app/api/bookings/export/route.js (Bonus: Export functionality)
import { MongoClient } from 'mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    await client.connect()
    const db = client.db('gilt-counselling')
    
    let query = {}
    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lte: endDate
      }
    }

    const bookings = await db.collection('bookings')
      .find(query)
      .sort({ date: 1, time: 1 })
      .toArray()

    if (format === 'csv') {
      // Generate CSV format
      const headers = [
        'Date', 'Time', 'Client Name', 'Email', 'Phone', 'Service', 
        'Duration', 'Status', 'Meeting URL', 'Booking Reference', 'Notes'
      ]
      
      const csvData = bookings.map(booking => [
        booking.date,
        booking.time,
        booking.userName,
        booking.userEmail,
        booking.phoneNumber || '',
        booking.service,
        booking.duration,
        booking.status,
        booking.meetingUrl || '',
        booking.bookingReference || '',
        booking.notes || ''
      ])

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="bookings-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Default: JSON format
    return Response.json({ 
      bookings: bookings.map(booking => ({
        ...booking,
        _id: booking._id.toString()
      })),
      totalCount: bookings.length,
      exportedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error exporting bookings:', error)
    return Response.json({ error: 'Failed to export bookings' }, { status: 500 })
  } finally {
    await client.close()
  }
}
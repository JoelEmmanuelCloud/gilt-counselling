// app/api/bookings/sync/route.js
import { TidyCalIntegration } from '@/lib/tidycal-integration'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await TidyCalIntegration.fetchAndSyncBookings()
    return Response.json(result)
  } catch (error) {
    console.error('Sync error:', error)
    return Response.json({ error: 'Failed to sync bookings' }, { status: 500 })
  }
}

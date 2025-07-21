// app/api/health/route.js
export async function GET() {
  try {
    // Check database connection
    const client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    await client.close()

    // Check Sanity connection
    const sanityStatus = await fetch(`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v1/ping`)
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        sanity: sanityStatus.ok ? 'connected' : 'error'
      }
    })
  } catch (error) {
    return Response.json(
      { status: 'error', message: error.message },
      { status: 500 }
    )
  }
}
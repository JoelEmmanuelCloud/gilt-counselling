// app/api/blog/posts/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { client } from '@/lib/sanity'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit')) || 10
    const category = searchParams.get('category')

    let query = '*[_type == "post"'
    
    if (featured === 'true') {
      query += ' && featured == true'
    }
    
    if (category) {
      query += ` && category->slug.current == "${category}"`
    }
    
    query += '] | order(publishedAt desc)'
    
    if (limit) {
      query += `[0...${limit}]`
    }
    
    query += ` {
      _id,
      title,
      slug,
      excerpt,
      mainImage,
      category->{title, slug},
      author->{name, image, bio},
      publishedAt,
      featured,
      "readTime": round(length(pt::text(body)) / 5 / 180 ) + " min read"
    }`

    const posts = await client.fetch(query)

    return NextResponse.json({ posts })

  } catch (error) {
    console.error('Get blog posts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession()
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, content, excerpt, category, featured = false, published = false } = body

    const postData = {
      _type: 'post',
      title,
      slug: { current: slug },
      body: [
        {
          _type: 'block',
          children: [
            {
              _type: 'span',
              text: content
            }
          ]
        }
      ],
      excerpt,
      category: {
        _type: 'reference',
        _ref: category
      },
      featured,
      publishedAt: published ? new Date().toISOString() : null
    }

    const result = await client.create(postData)

    return NextResponse.json({ 
      success: true, 
      post: result 
    })

  } catch (error) {
    console.error('Create blog post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
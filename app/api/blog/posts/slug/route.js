// app/api/blog/posts/[slug]/route.js
import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity'

export async function GET(request, { params }) {
  try {
    const query = `
      *[_type == "post" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        excerpt,
        mainImage,
        category->{title, slug},
        author->{name, image, bio},
        publishedAt,
        body,
        featured,
        "readTime": round(length(pt::text(body)) / 5 / 180 ) + " min read"
      }
    `

    const post = await client.fetch(query, { slug: params.slug })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    return NextResponse.json({ post })

  } catch (error) {
    console.error('Get blog post error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

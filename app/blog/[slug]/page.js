// app/blog/[slug]/page.js
import { getPostBySlug, getAllPosts } from '@/lib/sanity'
import BlogPost from '@/components/blog/BlogPost'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const posts = await getAllPosts()
  return posts.map((post) => ({
    slug: post.slug.current
  }))
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found | Gilt Counselling'
    }
  }

  return {
    title: `${post.title} | Gilt Counselling Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.mainImage ? [post.mainImage] : []
    }
  }
}

export default async function BlogPostPage({ params }) {
  const post = await getPostBySlug(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container-max py-16">
        <BlogPost post={post} />
      </div>
    </div>
  )
}

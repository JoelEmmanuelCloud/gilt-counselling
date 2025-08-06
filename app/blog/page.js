// app/blog/page.js
import { getAllPosts } from '@/lib/sanity'
import BlogCard from '@/components/blog/BlogCard'
import Link from 'next/link'

export const metadata = {
  title: 'Mental Health Blog | Gilt Counselling',
  description: 'Expert insights on teen mental health, family therapy, and parenting guidance from Dr. Ugwu and the Gilt Counselling team.'
}

export default async function BlogPage() {
  const posts = await getAllPosts()
  const featuredPosts = posts.filter(post => post.featured)
  const regularPosts = posts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-deepBlue to-blue-800 text-white">
        <div className="container-max text-center">
          <h1 className="font-playfair text-4xl lg:text-5xl font-bold mb-6">
            Mental Health Insights & Guidance
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
            Expert advice on teen mental health, family dynamics, and therapeutic approaches 
            from Dr. Ugwu and the Gilt Counselling team.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="#featured" className="btn-primary">
              Featured Articles
            </Link>
            <Link href="/contact" className="btn-secondary">
              Ask a Question
            </Link>
          </div>
        </div>
      </section>

      <div className="container-max py-16">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section id="featured" className="mb-16">
            <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-8 text-center">
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post) => (
                <BlogCard key={post._id} post={post} featured={true} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Posts */}
        <section>
          <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-8 text-center">
            All Articles
          </h2>
          
          {regularPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl">📝</span>
              </div>
              <h3 className="font-playfair text-2xl font-semibold text-deepBlue mb-4">
                Coming Soon
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                We're working on creating valuable content for you. 
                Check back soon for expert insights on mental health and family guidance.
              </p>
              <Link href="/contact" className="btn-primary">
                Subscribe for Updates
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularPosts.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

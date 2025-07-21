// components/blog/BlogPreview.js
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

export default function BlogPreview({ posts = [], title = "Latest Articles", showAll = true, limit = 3 }) {
  const displayPosts = limit ? posts.slice(0, limit) : posts

  if (!posts || posts.length === 0) {
    return (
      <section className="section-padding bg-cream">
        <div className="container-max text-center">
          <h2 className="font-playfair text-3xl font-bold text-deepBlue mb-8">
            {title}
          </h2>
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-2">
                No Articles Yet
              </h3>
              <p className="text-gray-600 mb-4">
                We're working on creating valuable content for you. Check back soon!
              </p>
              <Link href="/contact" className="btn-primary">
                Get Notified
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-cream">
      <div className="container-max">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl lg:text-4xl font-bold text-deepBlue mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Expert insights on mental health, family dynamics, and adolescent development 
            to support your journey toward wellness.
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPosts.map((post) => (
            <article 
              key={post.id || post._id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group"
            >
              {/* Post Image */}
              <div className="relative h-48 overflow-hidden">
                <Link href={`/blog/${post.slug}`}>
                  <Image
                    src={post.image || '/images/blog-placeholder.jpg'}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </Link>
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="bg-gold text-white px-2 py-1 rounded text-xs font-medium">
                    {post.category}
                  </span>
                </div>

                {/* Reading Time */}
                <div className="absolute top-3 right-3">
                  <span className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                    {post.readTime}
                  </span>
                </div>
              </div>

              {/* Post Content */}
              <div className="p-6">
                {/* Title */}
                <h3 className="font-playfair text-lg font-semibold text-deepBlue mb-3 line-clamp-2 group-hover:text-gold transition-colors">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {post.author?.image ? (
                      <Image
                        src={post.author.image}
                        alt={post.author.name}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-gold rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {post.author?.name?.charAt(0) || 'D'}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500">
                      {post.author?.name || 'Dr. Ugwu'}
                    </span>
                  </div>
                  
                  <span className="text-xs text-gray-500">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

                {/* Read More Link */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link 
                    href={`/blog/${post.slug}`}
                    className="text-gold hover:text-yellow-600 text-sm font-medium transition-colors flex items-center group-hover:underline"
                  >
                    Read Full Article
                    <span className="ml-1 transform transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Button */}
        {showAll && posts.length > limit && (
          <div className="text-center mt-12">
            <Link href="/blog" className="btn-primary">
              View All Articles
            </Link>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-white rounded-2xl p-8 lg:p-12 text-center shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">✉️</span>
            </div>
            <h3 className="font-playfair text-2xl font-bold text-deepBlue mb-4">
              Stay Updated with Our Newsletter
            </h3>
            <p className="text-gray-600 mb-6">
              Get weekly mental health insights, parenting tips, and counselling resources 
              delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

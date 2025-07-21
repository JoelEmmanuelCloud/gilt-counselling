//components/blog/BlogCard.js
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

export default function BlogCard({ post, featured = false }) {
  const cardClass = featured 
    ? "bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    : "bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"

  const imageHeight = featured ? "h-64" : "h-48"

  return (
    <article className={cardClass}>
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-gold text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm">
            Featured
          </span>
        </div>
      )}

      {/* Post Image */}
      <div className={`relative ${imageHeight} overflow-hidden`}>
        <Link href={`/blog/${post.slug}`}>
          <Image
            src={post.image || '/images/blog-placeholder.jpg'}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        </Link>
      </div>

      {/* Post Content */}
      <div className={featured ? "p-6" : "p-5"}>
        {/* Meta Information */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="bg-cream text-deepBlue px-2 py-1 rounded text-xs font-medium">
              {post.category}
            </span>
            {!featured && (
              <span className="text-xs text-gray-500">
                {post.readTime}
              </span>
            )}
          </div>
          {featured && (
            <span className="text-sm text-gray-500">
              {post.readTime}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={`font-playfair font-semibold text-deepBlue mb-3 hover:text-gold transition-colors line-clamp-2 ${
          featured ? 'text-xl' : 'text-lg'
        }`}>
          <Link href={`/blog/${post.slug}`}>
            {post.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className={`text-gray-600 mb-4 ${featured ? 'line-clamp-3' : 'line-clamp-2'} ${
          featured ? 'text-base' : 'text-sm'
        }`}>
          {post.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {post.author?.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-gold rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-semibold">
                  {post.author?.name?.charAt(0) || 'D'}
                </span>
              </div>
            )}
            <div>
              <p className="text-xs text-gray-600">
                {post.author?.name || 'Dr. Ugwu'}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(post.publishedAt)}
              </p>
            </div>
          </div>

          <Link 
            href={`/blog/${post.slug}`}
            className="text-gold hover:text-yellow-600 font-medium text-sm transition-colors flex items-center group"
          >
            Read More
            <span className="ml-1 transform transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Tags (for featured posts) */}
      {featured && post.tags && post.tags.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
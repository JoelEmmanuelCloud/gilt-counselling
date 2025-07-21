//components/blog/BlogPost.js
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function BlogPost({ post }) {
  if (!post) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="font-playfair text-2xl text-deepBlue mb-4">Post Not Found</h1>
        <p className="text-gray-600 mb-6">
          The blog post you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/blog" className="btn-primary">
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li><Link href="/" className="hover:text-gold transition-colors">Home</Link></li>
          <li className="text-gray-400">/</li>
          <li><Link href="/blog" className="hover:text-gold transition-colors">Blog</Link></li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 truncate">{post.title}</li>
        </ol>
      </nav>

      {/* Post Header */}
      <header className="text-center mb-8">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="bg-gold text-white px-4 py-2 rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-playfair text-3xl lg:text-4xl xl:text-5xl font-bold text-deepBlue mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600 mb-8">
          <div className="flex items-center space-x-2">
            {post.author?.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {post.author?.name?.charAt(0) || 'D'}
                </span>
              </div>
            )}
            <span className="font-medium">
              {post.author?.name || 'Dr. Ugwu'}
            </span>
          </div>
          <span>•</span>
          <span>{formatDate(post.publishedAt)}</span>
          <span>•</span>
          <span>{post.readTime}</span>
          {post.views && (
            <>
              <span>•</span>
              <span>{post.views} views</span>
            </>
          )}
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* Featured Image */}
      {post.image && (
        <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden shadow-lg mb-12">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="prose prose-lg prose-gray max-w-none">
        {/* Table of Contents (if post has headings) */}
        {post.tableOfContents && post.tableOfContents.length > 0 && (
          <div className="bg-cream rounded-xl p-6 mb-8 not-prose">
            <h3 className="font-playfair text-lg font-semibold text-deepBlue mb-4">
              Table of Contents
            </h3>
            <ul className="space-y-2">
              {post.tableOfContents.map((heading, index) => (
                <li key={index}>
                  <a 
                    href={`#${heading.id}`}
                    className="text-gray-600 hover:text-gold transition-colors"
                  >
                    {heading.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Content */}
        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-600 mr-2">Tags:</span>
          {post.tags.map((tag, index) => (
            <Link
              key={index}
              href={`/blog?tag=${encodeURIComponent(tag)}`}
              className="bg-gray-100 hover:bg-gold hover:text-white text-gray-600 px-3 py-1 rounded-full text-sm transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Social Sharing */}
      <div className="flex items-center justify-center space-x-4 mt-8 pt-8 border-t border-gray-200">
        <span className="text-sm font-medium text-gray-600">Share this article:</span>
        <div className="flex space-x-3">
          <button
            onClick={() => sharePost('twitter')}
            className="w-10 h-10 bg-blue-400 hover:bg-blue-500 text-white rounded-full flex items-center justify-center transition-colors"
            aria-label="Share on Twitter"
          >
            <span className="text-sm">𝕏</span>
          </button>
          <button
            onClick={() => sharePost('facebook')}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
            aria-label="Share on Facebook"
          >
            <span className="text-sm">f</span>
          </button>
          <button
            onClick={() => sharePost('linkedin')}
            className="w-10 h-10 bg-blue-700 hover:bg-blue-800 text-white rounded-full flex items-center justify-center transition-colors"
            aria-label="Share on LinkedIn"
          >
            <span className="text-sm">in</span>
          </button>
          <button
            onClick={() => sharePost('copy')}
            className="w-10 h-10 bg-gray-600 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
            aria-label="Copy link"
          >
            <span className="text-sm">🔗</span>
          </button>
        </div>
      </div>

      {/* Author Bio */}
      <div className="mt-12 p-6 bg-cream rounded-xl">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {post.author?.image ? (
              <Image
                src={post.author.image}
                alt={post.author.name}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">
                  {post.author?.name?.charAt(0) || 'DU'}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-2">
              About {post.author?.name || 'Dr. Ugwu'}
            </h3>
            <p className="text-gray-600 mb-4">
              {post.author?.bio || 
                `Dr. Ugwu is a licensed professional counsellor specializing in adolescent and 
                family therapy. With over 5 years of experience, she is passionate about 
                supporting teens and families through life's challenges.`
              }
            </p>
            <Link 
              href="/about" 
              className="text-gold hover:text-yellow-600 font-medium transition-colors"
            >
              Learn More About Dr. Ugwu →
            </Link>
          </div>
        </div>
      </div>
    </article>
  )

  function sharePost(platform) {
    const url = window.location.href
    const title = post.title
    const text = post.excerpt || title

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        // You could add a toast notification here
        alert('Link copied to clipboard!')
        break
    }
  }
}
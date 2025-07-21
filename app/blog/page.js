//app/blog/page.js
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Blog - Gilt Counselling',
  description: 'Expert insights on teen mental health, parenting, family therapy, and adolescent development from Dr. Ugwu.',
}

export default function BlogPage() {
  // Mock blog posts - in real app, fetch from Sanity
  const posts = [
    {
      id: 1,
      title: 'Understanding Teen Anxiety: Signs, Symptoms, and Support',
      slug: 'understanding-teen-anxiety',
      excerpt: 'Learn to recognize the signs of anxiety in teenagers and discover effective strategies for providing support during these challenging years.',
      image: '/images/teen-anxiety-blog.jpg',
      category: 'Teen Mental Health',
      publishedAt: '2024-12-10',
      readTime: '5 min read',
      featured: true
    },
    {
      id: 2,
      title: 'Building Stronger Parent-Teen Relationships Through Communication',
      slug: 'parent-teen-communication',
      excerpt: 'Practical tips for improving communication between parents and teenagers, fostering trust and understanding in your family.',
      image: '/images/parent-teen-communication.jpg',
      category: 'Parenting',
      publishedAt: '2024-12-05',
      readTime: '7 min read',
      featured: false
    },
    {
      id: 3,
      title: 'The Importance of Mental Health Advocacy in Schools',
      slug: 'mental-health-advocacy-schools',
      excerpt: 'How schools can better support student mental health and the role of community advocacy in creating positive change.',
      image: '/images/school-advocacy.jpg',
      category: 'Advocacy',
      publishedAt: '2024-11-28',
      readTime: '6 min read',
      featured: true
    },
    {
      id: 4,
      title: 'Navigating Family Conflict: When to Seek Professional Help',
      slug: 'family-conflict-professional-help',
      excerpt: 'Understanding when family disagreements require professional intervention and how therapy can help restore harmony.',
      image: '/images/family-conflict.jpg',
      category: 'Family Therapy',
      publishedAt: '2024-11-20',
      readTime: '4 min read',
      featured: false
    },
    {
      id: 5,
      title: 'Supporting Teen Identity Development in a Digital Age',
      slug: 'teen-identity-digital-age',
      excerpt: 'How social media and technology impact teen identity formation and strategies for healthy digital relationships.',
      image: '/images/teen-digital-identity.jpg',
      category: 'Teen Development',
      publishedAt: '2024-11-15',
      readTime: '8 min read',
      featured: false
    },
    {
      id: 6,
      title: 'Creating Safe Spaces: The Foundation of Effective Counselling',
      slug: 'creating-safe-spaces-counselling',
      excerpt: 'Why psychological safety is essential in therapy and how we establish trust with teens and families.',
      image: '/images/safe-spaces.jpg',
      category: 'Therapy Insights',
      publishedAt: '2024-11-10',
      readTime: '5 min read',
      featured: false
    }
  ]

  const categories = ['All', 'Teen Mental Health', 'Parenting', 'Family Therapy', 'Advocacy', 'Teen Development', 'Therapy Insights']
  const featuredPosts = posts.filter(post => post.featured)
  const regularPosts = posts.filter(post => !post.featured)

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream to-white">
        <div className="container-max section-padding">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-playfair text-4xl lg:text-5xl font-bold text-deepBlue mb-6">
              Mental Health Insights & Guidance
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Expert insights on teen mental health, family dynamics, and parenting strategies 
              from Dr. Ugwu and the counselling community.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    category === 'All'
                      ? 'bg-gold text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="section-padding">
          <div className="container-max">
            <h2 className="font-playfair text-2xl font-bold text-deepBlue mb-8">
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <article key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gold text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {post.category}
                      </span>
                      <span>{formatDate(post.publishedAt)}</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-3 hover:text-gold transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {post.excerpt}
                    </p>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-gold hover:text-yellow-600 font-medium text-sm transition-colors"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Posts Grid */}
      <section className="bg-cream section-padding">
        <div className="container-max">
          <h2 className="font-playfair text-2xl font-bold text-deepBlue mb-8">
            Latest Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {post.category}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-playfair text-lg font-semibold text-deepBlue mb-2 hover:text-gold transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(post.publishedAt)}
                    </span>
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="text-gold hover:text-yellow-600 text-sm font-medium transition-colors"
                    >
                      Read →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="section-padding">
        <div className="container-max">
          <div className="bg-deepBlue text-white rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="font-playfair text-3xl font-bold mb-4">
              Stay Updated on Mental Health Insights
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Get weekly articles, parenting tips, and mental health resources 
              delivered straight to your inbox.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-deepBlue"
                required
              />
              <button
                type="submit"
                className="btn-primary bg-gold hover:bg-yellow-600 whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-gray-400 mt-4">
              No spam, unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

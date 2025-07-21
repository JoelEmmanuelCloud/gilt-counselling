//app/blog/[slug]/page.js
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

// Mock function to get post by slug - replace with Sanity query
async function getPost(slug) {
  const posts = {
    'understanding-teen-anxiety': {
      id: 1,
      title: 'Understanding Teen Anxiety: Signs, Symptoms, and Support',
      slug: 'understanding-teen-anxiety',
      content: `
        <p>Teenage years are naturally filled with changes, challenges, and new experiences. However, for many adolescents, these normal stressors can develop into anxiety disorders that significantly impact their daily lives, relationships, and academic performance.</p>

        <h2>Recognizing the Signs</h2>
        <p>Teen anxiety can manifest in various ways, and it's important for parents and caregivers to understand the difference between normal teenage stress and clinical anxiety. Here are key signs to watch for:</p>

        <h3>Physical Symptoms</h3>
        <ul>
          <li>Frequent headaches or stomachaches</li>
          <li>Changes in sleep patterns</li>
          <li>Fatigue or restlessness</li>
          <li>Changes in appetite</li>
        </ul>

        <h3>Emotional and Behavioral Changes</h3>
        <ul>
          <li>Excessive worry about everyday situations</li>
          <li>Avoiding social situations or activities they once enjoyed</li>
          <li>Difficulty concentrating</li>
          <li>Irritability or mood swings</li>
          <li>Perfectionism or fear of making mistakes</li>
        </ul>

        <h2>Creating a Supportive Environment</h2>
        <p>As a parent or caregiver, your response to your teen's anxiety can make a significant difference in their recovery journey. Here are some strategies:</p>

        <p><strong>Listen without judgment:</strong> Create space for your teen to express their feelings without immediately trying to fix or minimize their concerns.</p>

        <p><strong>Validate their experience:</strong> Acknowledge that their feelings are real and understandable, even if the trigger seems minor to you.</p>

        <p><strong>Maintain routines:</strong> Consistent daily routines can provide a sense of security and predictability.</p>

        <h2>When to Seek Professional Help</h2>
        <p>If your teen's anxiety is interfering with their ability to function at school, maintain friendships, or participate in family activities, it may be time to seek professional support. A qualified therapist can provide tools and strategies specifically tailored to your teen's needs.</p>

        <p>Remember, seeking help is a sign of strength, not weakness. With proper support and treatment, teens with anxiety can learn to manage their symptoms and thrive.</p>
      `,
      excerpt: 'Learn to recognize the signs of anxiety in teenagers and discover effective strategies for providing support during these challenging years.',
      image: '/images/teen-anxiety-blog.jpg',
      category: 'Teen Mental Health',
      publishedAt: '2024-12-10',
      readTime: '5 min read',
      author: 'Dr. Ugwu'
    }
  }
  
  return posts[slug] || null
}

export default async function BlogPostPage({ params }) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream to-white">
        <div className="container-max section-padding">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumbs */}
            <nav className="mb-8">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li><Link href="/" className="hover:text-gold">Home</Link></li>
                <li className="text-gray-400">/</li>
                <li><Link href="/blog" className="hover:text-gold">Blog</Link></li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900">{post.title}</li>
              </ol>
            </nav>

            {/* Post Header */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <span className="bg-gold text-white px-3 py-1 rounded-full text-sm font-medium">
                  {post.category}
                </span>
              </div>
              <h1 className="font-playfair text-3xl lg:text-4xl font-bold text-deepBlue mb-4">
                {post.title}
              </h1>
              <div className="flex items-center justify-center space-x-6 text-gray-600">
                <span>By {post.author}</span>
                <span>•</span>
                <span>{formatDate(post.publishedAt)}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden shadow-lg mb-8">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 80vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Post Content */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-3xl mx-auto">
            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Bio */}
            <div className="mt-12 p-6 bg-cream rounded-xl">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">DU</span>
                </div>
                <div>
                  <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-2">
                    About Dr. Ugwu
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Dr. Ugwu is a licensed professional counsellor specializing in adolescent and 
                    family therapy. With over 5 years of experience, she is passionate about 
                    supporting teens and families through life's challenges.
                  </p>
                  <Link href="/about" className="text-gold hover:text-yellow-600 font-medium">
                    Learn More About Dr. Ugwu →
                  </Link>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center p-8 bg-deepBlue text-white rounded-xl">
              <h3 className="font-playfair text-2xl font-bold mb-4">
                Need Support for Your Teen or Family?
              </h3>
              <p className="text-gray-300 mb-6">
                If you're dealing with similar challenges, professional support can make a difference. 
                Schedule a consultation to learn how we can help.
              </p>
              <Link href="/booking" className="btn-primary bg-gold hover:bg-yellow-600">
                Book a Session
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="bg-cream section-padding">
        <div className="container-max">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-playfair text-2xl font-bold text-deepBlue mb-8 text-center">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Mock related posts */}
              {[1, 2, 3].map((index) => (
                <article key={index} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative h-32">
                    <Image
                      src="/images/blog-placeholder.jpg"
                      alt="Related post"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-playfair font-semibold text-deepBlue mb-2 line-clamp-2">
                      <Link href="/blog/related-post" className="hover:text-gold transition-colors">
                        Building Resilience in Teenagers
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      Discover strategies to help teens develop emotional resilience and coping skills.
                    </p>
                    <Link href="/blog/related-post" className="text-gold text-sm font-medium">
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
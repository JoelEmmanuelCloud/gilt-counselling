//app/dashboard/blog/page.js
'use client'
import { useState, useEffect } from 'react'
import AdminLayout from '@/components/dashboard/AdminLayout'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default function BlogManagementPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    featured: false,
    published: false
  })

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      // Mock data - replace with actual API call to Sanity
      const mockPosts = [
        {
          _id: '1',
          title: 'Understanding Teen Anxiety: Signs, Symptoms, and Support',
          slug: 'understanding-teen-anxiety',
          excerpt: 'Learn to recognize the signs of anxiety in teenagers...',
          category: 'Teen Mental Health',
          featured: true,
          published: true,
          publishedAt: '2024-12-10',
          createdAt: '2024-12-09'
        },
        {
          _id: '2',
          title: 'Building Stronger Parent-Teen Relationships',
          slug: 'parent-teen-communication',
          excerpt: 'Practical tips for improving communication...',
          category: 'Parenting',
          featured: false,
          published: true,
          publishedAt: '2024-12-05',
          createdAt: '2024-12-04'
        },
        {
          _id: '3',
          title: 'Mental Health Advocacy in Schools',
          slug: 'mental-health-advocacy-schools',
          excerpt: 'How schools can better support student mental health...',
          category: 'Advocacy',
          featured: true,
          published: false,
          publishedAt: null,
          createdAt: '2024-11-28'
        }
      ]
      setPosts(mockPosts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Mock save - replace with actual API call to Sanity
      const newPost = {
        ...formData,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        publishedAt: formData.published ? new Date().toISOString() : null
      }
      
      if (editingPost) {
        setPosts(posts.map(post => post._id === editingPost._id ? { ...newPost, _id: editingPost._id } : post))
      } else {
        setPosts([newPost, ...posts])
      }
      
      setShowEditor(false)
      setEditingPost(null)
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        featured: false,
        published: false
      })
    } catch (error) {
      console.error('Error saving post:', error)
    }
  }

  const handleEdit = (post) => {
    setEditingPost(post)
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content || '',
      category: post.category,
      featured: post.featured,
      published: post.published
    })
    setShowEditor(true)
  }

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        // Mock delete - replace with actual API call to Sanity
        setPosts(posts.filter(post => post._id !== postId))
      } catch (error) {
        console.error('Error deleting post:', error)
      }
    }
  }

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleTitleChange = (title) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    })
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
        </div>
      </AdminLayout>
    )
  }

  if (showEditor) {
    return (
      <AdminLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-playfair text-2xl font-bold text-deepBlue">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h1>
              <button
                onClick={() => {
                  setShowEditor(false)
                  setEditingPost(null)
                  setFormData({
                    title: '',
                    slug: '',
                    excerpt: '',
                    content: '',
                    category: '',
                    featured: false,
                    published: false
                  })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold focus:border-transparent"
                    placeholder="Enter post title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold focus:border-transparent"
                    placeholder="post-url-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  <option value="Teen Mental Health">Teen Mental Health</option>
                  <option value="Parenting">Parenting</option>
                  <option value="Family Therapy">Family Therapy</option>
                  <option value="Advocacy">Advocacy</option>
                  <option value="Teen Development">Teen Development</option>
                  <option value="Therapy Insights">Therapy Insights</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Excerpt *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  required
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold focus:border-transparent"
                  placeholder="Brief description of the post..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows="12"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gold focus:border-transparent font-mono text-sm"
                  placeholder="Write your post content here... You can use HTML tags for formatting."
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can use HTML tags for formatting: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
                </p>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span className="text-sm font-medium text-gray-700">Featured Post</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-gold focus:ring-gold"
                  />
                  <span className="text-sm font-medium text-gray-700">Publish Immediately</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, published: false })}
                  className="btn-secondary"
                >
                  Save as Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-deepBlue">
              Blog Management
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage blog posts
            </p>
          </div>
          <button
            onClick={() => setShowEditor(true)}
            className="mt-4 sm:mt-0 btn-primary"
          >
            ✍️ Write New Post
          </button>
        </div>

        {/* Sanity Studio Embed */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="font-playfair text-xl font-semibold text-deepBlue mb-4">
            Sanity Studio
          </h2>
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <span className="text-4xl mb-4 block">🎨</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Advanced Content Management
            </h3>
            <p className="text-gray-600 mb-4">
              Use Sanity Studio for advanced blog editing with rich media support, 
              collaborative editing, and content scheduling.
            </p>
            <a
              href="https://your-project.sanity.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-block"
            >
              Open Sanity Studio
            </a>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">📝</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
              <p className="text-gray-500 mb-4">
                Start creating content to engage with your audience.
              </p>
              <button
                onClick={() => setShowEditor(true)}
                className="btn-primary"
              >
                Write Your First Post
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {post.title}
                            {post.featured && (
                              <span className="ml-2 bg-gold text-white px-2 py-1 rounded-full text-xs">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-md">
                            {post.excerpt}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          post.published 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {post.published && (
                            <Link
                              href={`/blog/${post.slug}`}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View
                            </Link>
                          )}
                          <button
                            onClick={() => handleEdit(post)}
                            className="text-gold hover:text-yellow-600 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Posts', value: posts.length, color: 'bg-blue-100 text-blue-800' },
            { label: 'Published', value: posts.filter(p => p.published).length, color: 'bg-green-100 text-green-800' },
            { label: 'Drafts', value: posts.filter(p => !p.published).length, color: 'bg-yellow-100 text-yellow-800' },
            { label: 'Featured', value: posts.filter(p => p.featured).length, color: 'bg-purple-100 text-purple-800' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-2xl font-bold text-deepBlue">{stat.value}</div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full inline-block mt-1 ${stat.color}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
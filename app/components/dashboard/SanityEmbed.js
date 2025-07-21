//components/dashboard/SanityEmbed.js
'use client'
import { useState, useEffect } from 'react'

export default function SanityEmbed() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Load Sanity Studio embed script
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/@sanity/studio/dist/static/js/app.js'
    script.async = true
    script.onload = () => setIsLoading(false)
    script.onerror = () => {
      setError('Failed to load Sanity Studio')
      setIsLoading(false)
    }
    document.body.appendChild(script)

    return () => {
      const existingScript = document.querySelector('script[src="https://unpkg.com/@sanity/studio/dist/static/js/app.js"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="font-playfair text-2xl font-semibold text-deepBlue">
            Blog Content Management
          </h2>
        </div>
        
        <div className="p-6">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Sanity Studio Failed to Load
            </h3>
            <p className="text-gray-600 mb-6">
              There was an error loading the content management system. 
              Please try refreshing the page or contact support.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary mr-4"
              >
                Refresh Page
              </button>
              
              <div className="text-sm text-gray-500">
                <p className="mb-2">Alternative options:</p>
                <a
                  href={`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-yellow-600 underline"
                >
                  Open Sanity Studio in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="font-playfair text-2xl font-semibold text-deepBlue">
            Blog Content Management
          </h2>
          <div className="flex space-x-3">
            <a
              href={`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm py-2 px-3"
            >
              Open in New Tab
            </a>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary text-sm py-2 px-3"
            >
              Refresh
            </button>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Create and edit blog posts, manage categories, and publish content directly from your dashboard.
        </p>
      </div>

      {isLoading ? (
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Sanity Studio...</p>
              <p className="text-sm text-gray-500 mt-2">
                This may take a few moments on the first load
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Sanity Studio Embed Container */}
          <div 
            id="sanity-studio"
            className="min-h-[800px] w-full"
          >
            {/* Fallback content if Sanity Studio doesn't load properly */}
            <div className="p-6 text-center">
              <div className="bg-cream rounded-lg p-8">
                <div className="text-4xl mb-4">✍️</div>
                <h3 className="font-playfair text-xl font-semibold text-deepBlue mb-3">
                  Content Management System
                </h3>
                <p className="text-gray-600 mb-6">
                  The Sanity Studio interface will load here. If you're seeing this message, 
                  the studio may still be initializing or there may be a configuration issue.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-deepBlue mb-2">Quick Actions</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Create new blog posts</li>
                      <li>• Edit existing content</li>
                      <li>• Manage categories and tags</li>
                      <li>• Upload and organize images</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold text-deepBlue mb-2">Content Types</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Blog posts and articles</li>
                      <li>• Author profiles</li>
                      <li>• Categories and topics</li>
                      <li>• Media and images</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 space-x-4">
                  <a
                    href={`https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.sanity.studio`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Open Full Studio
                  </a>
                  <a
                    href="/blog"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    Preview Blog
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Studio Instructions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <h3 className="font-semibold text-deepBlue mb-3">Getting Started with Content Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-deepBlue mb-2">1. Create Content</h4>
                <p className="text-gray-600">
                  Click "Create new document" to start writing blog posts, add author information, 
                  or create new categories.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-deepBlue mb-2">2. Edit & Preview</h4>
                <p className="text-gray-600">
                  Use the rich text editor to format your content. Preview changes before 
                  publishing to ensure everything looks perfect.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-deepBlue mb-2">3. Publish & Share</h4>
                <p className="text-gray-600">
                  When ready, publish your content and it will automatically appear on your 
                  website's blog section.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
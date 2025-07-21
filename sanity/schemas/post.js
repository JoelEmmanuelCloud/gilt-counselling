// sanity/schemas/post.js
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  icon: () => '📝',
  
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The title of the blog post',
      validation: (Rule) => Rule.required().min(10).max(80)
    }),
    
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the title',
      options: {
        source: 'title',
        maxLength: 96,
        slugify: input => input
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .slice(0, 96)
      },
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      description: 'Short description of the post (150-200 characters)',
      rows: 3,
      validation: (Rule) => Rule.required().min(50).max(200)
    }),
    
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      description: 'Featured image for the blog post',
      options: {
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette']
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Alternative text for screen readers',
          validation: (Rule) => Rule.required()
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional caption for the image'
        }
      ],
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: { type: 'category' },
      description: 'Primary category for this post',
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Keywords and topics related to this post',
      options: {
        layout: 'tags'
      }
    }),
    
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: { type: 'author' },
      description: 'Who wrote this post?',
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      description: 'When should this post be published?',
      initialValue: () => new Date().toISOString(),
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'featured',
      title: 'Featured Post',
      type: 'boolean',
      description: 'Should this post be featured on the homepage?',
      initialValue: false
    }),
    
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContent',
      description: 'The main content of the blog post',
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      description: 'Search engine optimization settings',
      fields: [
        {
          name: 'metaTitle',
          title: 'Meta Title',
          type: 'string',
          description: 'Title for search engines (50-60 characters)',
          validation: (Rule) => Rule.max(60)
        },
        {
          name: 'metaDescription',
          title: 'Meta Description',
          type: 'text',
          description: 'Description for search engines (150-160 characters)',
          rows: 3,
          validation: (Rule) => Rule.max(160)
        },
        {
          name: 'keywords',
          title: 'Focus Keywords',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Main keywords for this post'
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      category: 'category.title',
      media: 'mainImage',
      publishedAt: 'publishedAt'
    },
    prepare(selection) {
      const { title, author, category, media, publishedAt } = selection
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : 'No date'
      
      return {
        title,
        subtitle: `${category} • ${author} • ${date}`,
        media
      }
    }
  },
  
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      title: 'Published Date, Old',
      name: 'publishedAtAsc',
      by: [
        { field: 'publishedAt', direction: 'asc' }
      ]
    },
    {
      title: 'Title A-Z',
      name: 'titleAsc',
      by: [
        { field: 'title', direction: 'asc' }
      ]
    }
  ]
})

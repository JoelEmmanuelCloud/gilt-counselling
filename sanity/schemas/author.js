// sanity/schemas/author.js
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: () => '👤',
  
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      description: 'Full name of the author',
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the name',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'title',
      title: 'Professional Title',
      type: 'string',
      description: 'e.g., Licensed Professional Counsellor, Ph.D.',
      placeholder: 'Licensed Professional Counsellor'
    }),
    
    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      description: 'Professional headshot',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          validation: (Rule) => Rule.required()
        }
      ]
    }),
    
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'blockContent',
      description: 'Author biography and background'
    }),
    
    defineField({
      name: 'shortBio',
      title: 'Short Bio',
      type: 'text',
      description: 'Brief biography for post bylines (2-3 sentences)',
      rows: 3,
      validation: (Rule) => Rule.max(300)
    }),
    
    defineField({
      name: 'credentials',
      title: 'Credentials',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Professional credentials and certifications',
      placeholder: 'e.g., Ph.D., LPC, LMFT'
    }),
    
    defineField({
      name: 'specialties',
      title: 'Specialties',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Areas of expertise',
      placeholder: 'e.g., Teen Counselling, Family Therapy'
    }),
    
    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'email',
      description: 'Professional email address'
    }),
    
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      description: 'Personal or professional website'
    }),
    
    defineField({
      name: 'social',
      title: 'Social Media',
      type: 'object',
      description: 'Social media profiles',
      fields: [
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url'
        },
        {
          name: 'twitter',
          title: 'Twitter',
          type: 'url'
        },
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'url'
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
      title: 'name',
      subtitle: 'title',
      media: 'image'
    }
  }
})

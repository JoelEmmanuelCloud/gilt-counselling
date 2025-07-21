// sanity/schemas/category.js
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  icon: () => '🏷️',
  
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Name of the category',
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'URL-friendly version of the title',
      options: {
        source: 'title',
        maxLength: 96
      },
      validation: (Rule) => Rule.required()
    }),
    
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of what this category covers',
      rows: 3
    }),
    
    defineField({
      name: 'color',
      title: 'Color',
      type: 'color',
      description: 'Color theme for this category',
      options: {
        disableAlpha: true
      }
    }),
    
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Emoji or icon to represent this category',
      placeholder: '📝'
    }),
    
    defineField({
      name: 'featured',
      title: 'Featured Category',
      type: 'boolean',
      description: 'Should this category be featured prominently?',
      initialValue: false
    }),
    
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      description: 'Order in which categories should appear',
      initialValue: 0
    }),
  ],
  
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
      emoji: 'icon'
    },
    prepare(selection) {
      const { title, subtitle, emoji } = selection
      return {
        title: `${emoji || '🏷️'} ${title}`,
        subtitle
      }
    }
  },
  
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrder',
      by: [
        { field: 'sortOrder', direction: 'asc' }
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

// sanity/schemas/blockContent.js
import { defineType } from 'sanity'

export default defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    {
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H1', value: 'h1' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' }
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Number', value: 'number' }
      ],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Underline', value: 'underline' },
          { title: 'Strike', value: 'strike-through' }
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (Rule) => Rule.uri({
                  allowRelative: true,
                  scheme: ['http', 'https', 'mailto', 'tel']
                })
              },
              {
                name: 'blank',
                type: 'boolean',
                title: 'Open in new tab',
                description: 'Read https://css-tricks.com/use-target_blank/',
                initialValue: false
              }
            ]
          },
          {
            name: 'internalLink',
            type: 'object',
            title: 'Internal Link',
            fields: [
              {
                name: 'reference',
                type: 'reference',
                title: 'Reference',
                to: [
                  { type: 'post' }
                ]
              }
            ]
          }
        ]
      }
    },
    {
      type: 'image',
      title: 'Image',
      options: {
        hotspot: true
      },
      fields: [
        {
          name: 'alt',
          type: 'string',
          title: 'Alt Text',
          description: 'Important for SEO and accessibility',
          validation: (Rule) => Rule.required()
        },
        {
          name: 'caption',
          type: 'string',
          title: 'Caption',
          description: 'Optional caption for the image'
        }
      ]
    },
    {
      type: 'object',
      name: 'callToAction',
      title: 'Call to Action',
      fields: [
        {
          name: 'text',
          type: 'string',
          title: 'CTA Text'
        },
        {
          name: 'url',
          type: 'string',
          title: 'URL'
        },
        {
          name: 'style',
          type: 'string',
          title: 'Style',
          options: {
            list: [
              { title: 'Primary Button', value: 'primary' },
              { title: 'Secondary Button', value: 'secondary' },
              { title: 'Text Link', value: 'link' }
            ]
          },
          initialValue: 'primary'
        }
      ],
      preview: {
        select: {
          title: 'text',
          subtitle: 'url'
        }
      }
    },
    {
      type: 'object',
      name: 'quote',
      title: 'Quote',
      fields: [
        {
          name: 'text',
          type: 'text',
          title: 'Quote Text',
          rows: 3
        },
        {
          name: 'author',
          type: 'string',
          title: 'Author'
        },
        {
          name: 'source',
          type: 'string',
          title: 'Source'
        }
      ],
      preview: {
        select: {
          title: 'text',
          subtitle: 'author'
        },
        prepare(selection) {
          const { title, subtitle } = selection
          return {
            title: `"${title}"`,
            subtitle: `— ${subtitle}`
          }
        }
      }
    }
  ]
})
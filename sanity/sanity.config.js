// sanity/sanity.config.js
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { colorInput } from '@sanity/color-input'
import { imageHotspotArrayPlugin } from 'sanity-plugin-hotspot-array'
import { media } from 'sanity-plugin-media'

import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'gilt-counselling',
  title: 'Gilt Counselling CMS',
  
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  
  basePath: '/studio',
  
  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Blog Posts
            S.listItem()
              .title('Blog Posts')
              .icon(() => '📝')
              .child(
                S.documentTypeList('post')
                  .title('Blog Posts')
                  .filter('_type == "post"')
                  .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
              ),
            
            // Categories
            S.listItem()
              .title('Categories')
              .icon(() => '🏷️')
              .child(
                S.documentTypeList('category')
                  .title('Categories')
              ),
            
            // Authors
            S.listItem()
              .title('Authors')
              .icon(() => '👤')
              .child(
                S.documentTypeList('author')
                  .title('Authors')
              ),
            
            // Divider
            S.divider(),
            
            // Settings (if you add them later)
            S.listItem()
              .title('Site Settings')
              .icon(() => '⚙️')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
          ])
    }),
    visionTool(),
    colorInput(),
    imageHotspotArrayPlugin(),
    media(),
  ],
  
  schema: {
    types: schemaTypes,
  },
  
  theme: {
    '--default-button-color': '#D4AF37',
    '--default-button-primary-color': '#D4AF37',
    '--component-bg': '#F8F5F2',
    '--main-navigation-color': '#00303F',
    '--main-navigation-color--inverted': '#FFFFFF',
  },
})
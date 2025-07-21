// sanity/schemas/index.js
import post from './post'
import author from './author'
import category from './category'
import blockContent from './blockContent'

export const schemaTypes = [
  // Document types
  post,
  author,
  category,
  
  // Object types
  blockContent,
]
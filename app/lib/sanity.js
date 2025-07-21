//lib/sanity.js
import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const builder = imageUrlBuilder(client)

export function urlFor(source) {
  return builder.image(source)
}

// Sanity queries
export const postsQuery = `
  *[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    category->{title, slug},
    publishedAt,
    "readTime": round(length(pt::text(body)) / 5 / 180 ) + "min read"
  }
`

export const postQuery = `
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    category->{title, slug},
    publishedAt,
    body,
    author->{name, image, bio},
    "readTime": round(length(pt::text(body)) / 5 / 180 ) + "min read"
  }
`

// Helper functions for blog functionality
export async function getAllPosts() {
  return await client.fetch(postsQuery)
}

export async function getPostBySlug(slug) {
  return await client.fetch(postQuery, { slug })
}

export async function createPost(postData) {
  return await client.create({
    _type: 'post',
    ...postData,
    publishedAt: new Date().toISOString(),
  })
}

export async function updatePost(id, postData) {
  return await client.patch(id).set(postData).commit()
}
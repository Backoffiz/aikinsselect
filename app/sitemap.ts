export const runtime = 'edge'

import type { MetadataRoute } from 'next'
import { getPublishedReviews, getCategories, getLatestProducts } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aikinsselect.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/disclosure`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Published reviews
  const reviews = await getPublishedReviews(100)
  const reviewPages: MetadataRoute.Sitemap = reviews.map((review: any) => ({
    url: `${baseUrl}/reviews/${review.slug}`,
    lastModified: new Date(review.updated_at || review.published_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Categories
  const categories = await getCategories()
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat: any) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...reviewPages, ...categoryPages]
}

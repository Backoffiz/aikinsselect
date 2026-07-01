export const runtime = 'edge'

import type { MetadataRoute } from 'next'
import { getPublishedReviews, getCategories, getLatestProducts } from '@/lib/db'
import { SITE_URL } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/reviews`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/disclosure`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Published reviews (cap high enough to include the whole catalog — a low cap silently
  // drops review pages from the sitemap, hurting discovery of our primary SEO content).
  const reviews = await getPublishedReviews(1000)
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

  // Product detail pages
  const products = await getLatestProducts(5000)
  const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at || product.created_at || Date.now()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...reviewPages, ...categoryPages, ...productPages]
}

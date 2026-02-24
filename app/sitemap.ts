import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aikinsselect.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/methodology`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]

  // Published reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('slug, updated_at')
    .eq('status', 'published')

  const reviewPages: MetadataRoute.Sitemap = (reviews || []).map(review => ({
    url: `${baseUrl}/reviews/${review.slug}`,
    lastModified: new Date(review.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const categoryPages: MetadataRoute.Sitemap = (categories || []).map(cat => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('status', 'published')

  const productPages: MetadataRoute.Sitemap = (products || []).map(product => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...reviewPages, ...categoryPages, ...productPages]
}

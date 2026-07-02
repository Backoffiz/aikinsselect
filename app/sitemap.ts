export const runtime = 'edge'

import type { MetadataRoute } from 'next'
import { getPublishedReviews, getCategories, getLatestProducts } from '@/lib/db'
import { SITE_URL } from '@/lib/seo'

/** Parse a D1 datetime ('YYYY-MM-DD HH:MM:SS') or ISO string to a Date, or undefined. */
function toDate(v?: string | null): Date | undefined {
  if (!v) return undefined
  const s = String(v)
  const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z')
  return isNaN(d.getTime()) ? undefined : d
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL

  // Published reviews (cap high enough to include the whole catalog — a low cap silently
  // drops review pages from the sitemap, hurting discovery of our primary SEO content).
  const reviews = await getPublishedReviews(1000)

  // Site-freshness proxy: the most recent review update. Used for hub pages whose content
  // is catalog-driven (home, /reviews, /categories) so `lastmod` reflects a REAL change
  // rather than "now" on every crawl (which erodes trust in the signal).
  const lastContentUpdate = reviews
    .map((r: any) => toDate(r.updated_at) || toDate(r.published_at))
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const hub = (path: string, changeFrequency: 'daily' | 'weekly', priority: number) => ({
    url: `${baseUrl}${path}`,
    ...(lastContentUpdate ? { lastModified: lastContentUpdate } : {}),
    changeFrequency,
    priority,
  })

  // Hub pages — freshness tracks the catalog.
  const hubPages: MetadataRoute.Sitemap = [
    hub('', 'daily', 1),
    hub('/reviews', 'daily', 0.9),
    hub('/categories', 'weekly', 0.8),
  ]

  // Editorial / legal pages — no accurate per-page timestamp, so omit lastmod rather than
  // fabricate one. (/how-we-review is our published methodology + an E-E-A-T signal.)
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/how-we-review`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/disclosure`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, changeFrequency: 'monthly', priority: 0.3 },
  ]

  const reviewPages: MetadataRoute.Sitemap = reviews.map((review: any) => {
    const d = toDate(review.updated_at) || toDate(review.published_at)
    return {
      url: `${baseUrl}/reviews/${review.slug}`,
      ...(d ? { lastModified: d } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }
  })

  const categories = await getCategories()
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat: any) => ({
    url: `${baseUrl}/categories/${cat.slug}`,
    ...(lastContentUpdate ? { lastModified: lastContentUpdate } : {}),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const products = await getLatestProducts(5000)
  const productPages: MetadataRoute.Sitemap = products.map((product: any) => {
    const d = toDate(product.updated_at) || toDate(product.created_at)
    return {
      url: `${baseUrl}/products/${product.slug}`,
      ...(d ? { lastModified: d } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }
  })

  return [...hubPages, ...staticPages, ...reviewPages, ...categoryPages, ...productPages]
}

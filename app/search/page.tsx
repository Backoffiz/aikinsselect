export const runtime = 'edge'

import Link from 'next/link'
import { searchProducts, searchReviews } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Badge } from '@/components/ui/badge'
import { SearchBar } from '@/components/search-bar'
import { ShoppingCart } from 'lucide-react'
import type { Metadata } from 'next'

type Props = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return { title: q ? `Search: ${q}` : 'Search' }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  const [products, reviews] = query
    ? await Promise.all([searchProducts(query, 20), searchReviews(query, 10)])
    : [[], []]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container px-4 py-8 md:py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Search</h1>

        <form action="/search" method="GET" className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search products and reviews..."
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {query && (
          <p className="text-sm text-slate-500 mb-6">
            Found {reviews.length} reviews and {products.length} products for &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Reviews</h2>
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <Link
                  key={review.id}
                  href={`/reviews/${review.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md hover:border-violet-200 transition-all"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-violet-100 text-violet-700 text-xs">{review.category_name || 'Review'}</Badge>
                  </div>
                  <h3 className="font-bold text-slate-900">{review.title}</h3>
                  {review.subtitle && <p className="text-sm text-slate-600 mt-1">{review.subtitle}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Products</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {products.map((product: any) => (
                <div key={product.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      {product.is_best_pick === 1 && <Badge className="bg-amber-100 text-amber-700 text-xs mb-1">⭐ Best Pick</Badge>}
                      <h3 className="font-bold text-slate-900">{product.name}</h3>
                      <p className="text-xs text-slate-500">{product.category_name}</p>
                    </div>
                    {product.price && (
                      <span className="font-bold text-violet-600">${Number(product.price).toFixed(2)}</span>
                    )}
                  </div>
                  {product.affiliate_url && (
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="noopener sponsored"
                      className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-md py-2 transition-colors"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Check Price
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {query && reviews.length === 0 && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg">No results found for &ldquo;{query}&rdquo;</p>
            <p className="text-slate-400 mt-2">Try a different search term or browse our <Link href="/categories" className="text-violet-600 hover:underline">categories</Link></p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

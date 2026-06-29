export const runtime = 'edge'

import Link from 'next/link'
import { searchProducts, searchReviews } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

type Props = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  return {
    title: q ? `Search: ${q}` : 'Search',
    // Result pages are thin/duplicate — keep them out of the index but let crawlers
    // follow through to the products & reviews they link to.
    robots: { index: false, follow: true },
    alternates: { canonical: '/search' },
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  const [products, reviews] = query
    ? await Promise.all([searchProducts(query, 20), searchReviews(query, 10)])
    : [[], []]

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 container px-4 py-12 md:py-16 max-w-4xl mx-auto">
        <h1 className="mb-6 font-serif text-4xl md:text-5xl font-medium tracking-tight text-ink">Search</h1>

        <form action="/search" method="GET" className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search products and reviews..."
              className="flex-1 rounded-[3px] border border-input bg-white px-4 py-3 text-sm text-ink placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <Button type="submit" size="lg" className="shrink-0">
              Search
            </Button>
          </div>
        </form>

        {query && (
          <p className="mb-6 text-sm text-muted-ink">
            Found {reviews.length} reviews and {products.length} products for &ldquo;{query}&rdquo;
          </p>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">Reviews</h2>
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <Link
                  key={review.id}
                  href={`/reviews/${review.slug}`}
                  className="block rounded-[5px] border border-card-edge bg-white p-4 transition-all hover:shadow-card-hover"
                >
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-brand">
                    {review.category_name || 'Review'}
                  </div>
                  <h3 className="font-serif text-lg font-medium text-ink">{review.title}</h3>
                  {review.subtitle && <p className="mt-1 text-sm leading-relaxed text-muted-ink">{review.subtitle}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products */}
        {products.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">Products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <ProductCard
                  key={product.id}
                  productId={product.id}
                  slug={product.slug}
                  title={product.name}
                  category={product.category_name}
                  image={product.image_url}
                  rating={product.rating || 4.5}
                  price={product.price ? `$${Number(product.price).toFixed(2)}` : 'Check price'}
                  affiliateUrl={product.affiliate_url}
                  bestPick={product.is_best_pick === 1}
                />
              ))}
            </div>
          </div>
        )}

        {query && reviews.length === 0 && products.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-ink">No results found for &ldquo;{query}&rdquo;</p>
            <p className="mt-2 text-faint">Try a different search term or browse our <Link href="/categories" className="text-brand hover:underline">categories</Link></p>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

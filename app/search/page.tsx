export const runtime = 'edge'

import Link from 'next/link'
import { searchProducts, searchReviews, searchCategories, getCategories, getBestPicks } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

type Props = { searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams
  const query = q?.trim()
  return {
    title: query ? `Search: ${query}` : 'Search',
    // Result pages are thin/duplicate — keep them out of the index but let crawlers
    // follow through to the products & reviews they link to.
    robots: { index: false, follow: true },
    alternates: { canonical: '/search' },
  }
}

// The form that submits a query — used at the top of every state.
function SearchForm({ query }: { query: string }) {
  return (
    <form action="/search" method="GET" className="mb-8">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            autoFocus={!query}
            placeholder="Search products, brands, categories, or reviews…"
            className="w-full rounded-lg border border-input bg-white py-3 pl-10 pr-4 text-sm text-ink shadow-xs placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <Button type="submit" size="lg" className="shrink-0">
          Search
        </Button>
      </div>
    </form>
  )
}

function CategoryPills({ categories }: { categories: any[] }) {
  if (!categories.length) return null
  return (
    <div className="mb-10 flex flex-wrap gap-2">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/categories/${c.slug}`}
          className="inline-flex items-center gap-2 rounded-pill border border-card-edge bg-white px-4 py-2 text-sm font-semibold text-ink shadow-xs transition-all hover:-translate-y-0.5 hover:border-brand hover:text-brand"
        >
          {c.icon && <span aria-hidden>{c.icon}</span>}
          {c.name}
          {typeof c.product_count === 'number' && c.product_count > 0 && (
            <span className="text-xs font-normal text-faint">{c.product_count}</span>
          )}
        </Link>
      ))}
    </div>
  )
}

function ProductGrid({ products }: { products: any[] }) {
  return (
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
  )
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim() || ''

  // --- No query yet: make the page useful with categories + top picks. ---
  if (!query) {
    const [categories, picks] = await Promise.all([getCategories(), getBestPicks(6)])
    return (
      <div className="flex min-h-screen flex-col bg-paper">
        <SiteHeader />
        <main className="flex-1 container px-4 py-12 md:py-16 max-w-4xl mx-auto">
          <h1 className="mb-6 font-serif text-4xl md:text-5xl font-medium tracking-tight text-ink">Search</h1>
          <SearchForm query="" />

          <section className="mb-12">
            <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.08em] text-faint">Browse by category</h2>
            <CategoryPills categories={categories} />
          </section>

          {picks.length > 0 && (
            <section>
              <h2 className="mb-4 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">
                Top picks to get you started
              </h2>
              <ProductGrid products={picks} />
            </section>
          )}
        </main>
        <SiteFooter />
      </div>
    )
  }

  // --- Active query: search products, reviews, and categories in parallel. ---
  const [products, reviews, categories] = await Promise.all([
    searchProducts(query, 24),
    searchReviews(query, 12),
    searchCategories(query, 6),
  ])

  const total = products.length + reviews.length
  const noResults = total === 0 && categories.length === 0

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 container px-4 py-12 md:py-16 max-w-4xl mx-auto">
        <h1 className="mb-6 font-serif text-4xl md:text-5xl font-medium tracking-tight text-ink">Search</h1>
        <SearchForm query={query} />

        {!noResults && (
          <p className="mb-6 text-sm text-muted-ink">
            {total > 0 ? (
              <>
                Found {products.length} {products.length === 1 ? 'product' : 'products'} and {reviews.length}{' '}
                {reviews.length === 1 ? 'review' : 'reviews'} for &ldquo;{query}&rdquo;
              </>
            ) : (
              <>No products or reviews for &ldquo;{query}&rdquo; — but these categories match:</>
            )}
          </p>
        )}

        {/* Matching categories */}
        <CategoryPills categories={categories} />

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">Reviews</h2>
            <div className="space-y-3">
              {reviews.map((review: any) => (
                <Link
                  key={review.id}
                  href={`/reviews/${review.slug}`}
                  className="group block rounded-xl border border-card-edge bg-white p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
                >
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-brand">
                    {review.category_name || 'Review'}
                  </div>
                  <h3 className="font-serif text-lg font-medium text-ink transition-colors group-hover:text-brand">{review.title}</h3>
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
            <ProductGrid products={products} />
          </div>
        )}

        {/* Nothing matched anywhere */}
        {noResults && <NoResults query={query} />}
      </main>
      <SiteFooter />
    </div>
  )
}

async function NoResults({ query }: { query: string }) {
  const [categories, picks] = await Promise.all([getCategories(), getBestPicks(6)])
  return (
    <div>
      <div className="rounded-xl border border-card-edge bg-white px-6 py-10 text-center shadow-card">
        <p className="text-lg text-ink">No results found for &ldquo;{query}&rdquo;</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-ink">
          Try fewer or more general words (e.g. &ldquo;headphones&rdquo; instead of a model number), check the spelling,
          or browse a category below.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-[12px] font-bold uppercase tracking-[0.08em] text-faint">Browse by category</h2>
        <CategoryPills categories={categories} />
      </section>

      {picks.length > 0 && (
        <section className="mt-2">
          <h2 className="mb-4 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">
            Popular right now
          </h2>
          <ProductGrid products={picks} />
        </section>
      )}
    </div>
  )
}

export const runtime = 'edge'

import Link from 'next/link'
import Image from 'next/image'
import { getCategoryBySlug, getProductsByCategory, getReviewsByCategory } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Category Not Found' }
  return {
    title: `Best ${category.name} Products`,
    description: `Discover the best ${category.name.toLowerCase()} products — expert-reviewed and reader-approved.`,
  }
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params
  const [category, products, reviews] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug, 50),
    getReviewsByCategory(slug, 10),
  ])

  if (!category) notFound()

  const bestPicks = products.filter((p: any) => p.is_best_pick === 1)
  const otherProducts = products.filter((p: any) => p.is_best_pick !== 1)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Category Hero */}
        <div className="relative h-64 w-full overflow-hidden md:h-72">
          <Image src={`/categories/${slug}.jpg`} alt={category.name} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-deep/35 to-ink-deep/85" />
          <div className="container absolute inset-x-0 bottom-0 px-4 pb-8 md:px-6">
            <nav className="mb-3 flex items-center gap-2 text-[13px] text-white/75">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/categories" className="hover:text-white">Categories</Link>
              <span>/</span>
              <span className="text-white">{category.name}</span>
            </nav>
            <h1 className="font-serif text-4xl font-medium tracking-tight text-white drop-shadow-sm md:text-5xl">
              Best {category.name} Products
            </h1>
            <p className="mt-2 max-w-xl text-white/85">
              {products.length} products reviewed • {bestPicks.length} editor&apos;s picks
            </p>
          </div>
        </div>

        <div className="container px-4 py-10 md:px-6 md:py-12">
          {/* Reviews for this category */}
          {reviews.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-5 font-serif text-2xl font-medium text-ink">Reviews in {category.name}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((review: any) => (
                  <Link
                    key={review.id}
                    href={`/reviews/${review.slug}`}
                    className="block rounded-[5px] border border-card-edge bg-white p-5 transition-all hover:shadow-card-hover"
                  >
                    <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand">Buying guide</div>
                    <h3 className="font-serif text-lg font-medium text-ink">{review.title}</h3>
                    {review.subtitle && <p className="mt-1 line-clamp-2 text-sm text-muted-ink">{review.subtitle}</p>}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Best Picks */}
          {bestPicks.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-5 font-serif text-2xl font-medium text-ink">Editor&apos;s picks</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {bestPicks.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    productId={product.id}
                    slug={product.slug}
                    title={product.name}
                    category={category.name}
                    image={product.image_url}
                    rating={product.rating || 4.5}
                    price={product.price ? `$${Number(product.price).toFixed(2)}` : 'Check price'}
                    bestPick
                    affiliateUrl={product.affiliate_url}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Products */}
          <section className="mb-12">
            <h2 className="mb-5 font-serif text-2xl font-medium text-ink">All {category.name} products</h2>
            {otherProducts.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {otherProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    productId={product.id}
                    slug={product.slug}
                    title={product.name}
                    category={category.name}
                    image={product.image_url}
                    rating={product.rating || 4.5}
                    price={product.price ? `$${Number(product.price).toFixed(2)}` : 'Check price'}
                    affiliateUrl={product.affiliate_url}
                  />
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-faint">More products coming soon.</p>
            )}
          </section>

          <Link href="/categories" className="inline-flex items-center font-semibold text-brand hover:text-brand-hover">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

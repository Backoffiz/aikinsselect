export const runtime = 'edge'

import Link from 'next/link'
import Image from 'next/image'
import { getCategoryBySlug, getProductsByCategory, getReviewsByCategory } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Star, ArrowLeft } from 'lucide-react'
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
      <main className="flex-1 container px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <span>/</span>
          <Link href="/categories" className="hover:text-violet-600">Categories</Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{category.name}</span>
        </nav>

        {/* Category Hero */}
        <div className="relative rounded-xl overflow-hidden mb-8 h-48 md:h-64">
          <Image
            src={`/categories/${slug}.jpg`}
            alt={category.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-sm">Best {category.name} Products</h1>
            <p className="text-white/80 mt-1">
              {products.length} products reviewed • {bestPicks.length} editor&apos;s picks
            </p>
          </div>
        </div>

        {/* Reviews for this category */}
        {reviews.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Reviews in {category.name}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review: any) => (
                <Link
                  key={review.id}
                  href={`/reviews/${review.slug}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md hover:border-violet-200 transition-all"
                >
                  <Badge className="bg-violet-100 text-violet-700 text-xs mb-2">Review</Badge>
                  <h3 className="font-bold text-slate-900">{review.title}</h3>
                  {review.subtitle && <p className="text-sm text-slate-600 mt-1 line-clamp-2">{review.subtitle}</p>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Best Picks */}
        {bestPicks.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900 mb-4">⭐ Editor&apos;s Picks</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bestPicks.map((product: any) => (
                <div key={product.id} className="rounded-lg border-2 border-violet-200 bg-white p-5 hover:shadow-md transition-shadow">
                  <Badge className="bg-amber-100 text-amber-700 text-xs mb-2">⭐ Best Pick</Badge>
                  <h3 className="font-bold text-slate-900 text-lg">{product.name}</h3>
                  {product.description && <p className="text-sm text-slate-600 mt-1">{product.description}</p>}
                  <div className="flex items-center justify-between mt-3">
                    {product.price && (
                      <span className="text-xl font-bold text-violet-600">${Number(product.price).toFixed(2)}</span>
                    )}
                    {product.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    )}
                  </div>
                  {product.affiliate_url && (
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="noopener sponsored"
                      className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-md py-2.5 transition-colors"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Check Price on Amazon
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Products */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">All {category.name} Products</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {otherProducts.map((product: any) => (
              <div key={product.id} className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-sm transition-shadow">
                <h3 className="font-semibold text-slate-900">{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  {product.price ? (
                    <span className="font-bold text-violet-600">${Number(product.price).toFixed(2)}</span>
                  ) : (
                    <span className="text-sm text-slate-400">Price TBD</span>
                  )}
                </div>
                {product.affiliate_url && (
                  <a
                    href={product.affiliate_url}
                    target="_blank"
                    rel="noopener sponsored"
                    className="mt-2 block text-center text-xs font-medium text-violet-600 hover:text-violet-700 border border-violet-200 rounded py-1.5 transition-colors"
                  >
                    Check Price →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <Link href="/categories" className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Link>
      </main>
      <SiteFooter />
    </div>
  )
}

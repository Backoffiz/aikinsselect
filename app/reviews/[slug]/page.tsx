export const runtime = 'edge'

import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Newsletter } from "@/components/newsletter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock, ExternalLink, Star, ShoppingCart } from "lucide-react"
import { getReviewBySlug, getProductsForReview, getPublishedReviews } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const review = await getReviewBySlug(slug)
  if (!review) return { title: 'Review Not Found' }
  return {
    title: review.title,
    description: review.subtitle || `${review.title} - Expert review by Aikins Select`,
  }
}

function renderMarkdown(content: string): string {
  return content
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-slate-900 mt-10 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-slate-900 mt-10 mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-600">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4 list-decimal text-slate-600">$2</li>')
    .replace(/\n\n/g, '</p><p class="text-slate-600 leading-relaxed mb-4">')
    .replace(/^(?!<[hlu])/gm, '')
}

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params
  const [review, products, relatedReviews] = await Promise.all([
    getReviewBySlug(slug),
    getProductsForReview(slug),
    getPublishedReviews(4),
  ])

  if (!review) notFound()

  const related = relatedReviews.filter((r: any) => r.slug !== slug).slice(0, 3)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container px-4 pt-6">
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-violet-600">Home</Link>
            <span>/</span>
            <Link href="/reviews" className="hover:text-violet-600">Reviews</Link>
            <span>/</span>
            {review.category_name && (
              <>
                <Link href={`/categories/${review.category_slug}`} className="hover:text-violet-600">
                  {review.category_name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-900 font-medium truncate">{review.title}</span>
          </nav>
        </div>

        {/* Review Header */}
        <article className="container px-4 py-8 max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {review.category_name && (
                <Badge className="bg-violet-100 text-violet-700">{review.category_name}</Badge>
              )}
              {review.published_at && (
                <span className="text-sm text-slate-500 flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {new Date(review.published_at).toLocaleDateString('en-US', {
                    month: 'long', day: 'numeric', year: 'numeric'
                  })}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              {review.title}
            </h1>
            {review.subtitle && (
              <p className="mt-3 text-lg text-slate-600">{review.subtitle}</p>
            )}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <strong>Affiliate Disclosure:</strong> This article contains affiliate links. 
              If you purchase through our links, we may earn a commission at no extra cost to you.{' '}
              <Link href="/disclosure" className="underline">Learn more</Link>
            </div>
          </div>

          {/* Products from this review */}
          {products.length > 0 && (
            <div className="mb-10 space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">Our Top Picks</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((product: any, i: number) => (
                  <div key={product.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {i === 0 && <Badge className="bg-amber-100 text-amber-700 text-xs">🏆 Best Overall</Badge>}
                          {product.is_best_pick === 1 && i > 0 && <Badge className="bg-violet-100 text-violet-700 text-xs">⭐ Top Pick</Badge>}
                        </div>
                        <h3 className="font-bold text-slate-900">{product.name}</h3>
                        {product.mini_review && (
                          <p className="text-sm text-slate-600 mt-1">{product.mini_review}</p>
                        )}
                      </div>
                      {product.price && (
                        <span className="text-lg font-bold text-violet-600 whitespace-nowrap ml-3">
                          ${Number(product.price).toFixed(2)}
                        </span>
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

          {/* Review Content */}
          {review.content ? (
            <div
              className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-a:text-violet-600 prose-a:no-underline hover:prose-a:underline"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(review.content) }}
            />
          ) : (
            <div className="py-12 text-center text-slate-500">
              <p>Full review content coming soon. Check back for our detailed analysis!</p>
            </div>
          )}

          {/* Back to reviews */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <Link href="/reviews" className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Reviews
            </Link>
          </div>
        </article>

        {/* Related Reviews */}
        {related.length > 0 && (
          <section className="bg-slate-50 py-12">
            <div className="container px-4 max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">More Reviews</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r: any) => (
                  <Link
                    key={r.id}
                    href={`/reviews/${r.slug}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                  >
                    <Badge className="bg-violet-100 text-violet-700 text-xs mb-2">{r.category_name}</Badge>
                    <h3 className="font-bold text-slate-900 text-sm leading-tight">{r.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  )
}

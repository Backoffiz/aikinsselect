export const runtime = 'edge'

import Link from 'next/link'
import Image from 'next/image'
import { getPublishedReviews } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Reviews',
  description: 'Expert product reviews backed by research from Wirecutter, RTINGS, and real Reddit user feedback.',
  alternates: { canonical: '/reviews' },
}

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews(50)

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 container px-4 py-12 md:py-16">
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Reviews</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl font-medium tracking-tight text-ink">All Reviews</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-ink">
            Expert product reviews backed by research from Wirecutter, CNN Underscored, RTINGS, and real Reddit user feedback.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review: any) => (
              <Link
                key={review.id}
                href={`/reviews/${review.slug}`}
                className="group block overflow-hidden rounded-[5px] border border-card-edge bg-white transition-all hover:shadow-card-hover"
              >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-b from-white to-paper-deep">
                  {review.card_image ? (
                    <Image
                      src={review.card_image}
                      alt={review.title}
                      fill
                      className="object-contain p-6 transition-transform group-hover:scale-105"
                    />
                  ) : review.category_slug ? (
                    <Image
                      src={`/categories/${review.category_slug}.jpg`}
                      alt={review.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6">
                      <span className="text-center font-serif text-lg text-muted-ink">{review.title}</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-3">
                    {review.category_name && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand">{review.category_name}</span>
                    )}
                    {review.published_at && (
                      <span className="flex items-center text-xs text-faint">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(review.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h2 className="font-serif text-xl font-medium leading-snug text-ink transition-colors group-hover:text-brand">
                    {review.title}
                  </h2>
                  {review.subtitle && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-ink line-clamp-2">{review.subtitle}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-faint">No reviews published yet. Check back soon!</p>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

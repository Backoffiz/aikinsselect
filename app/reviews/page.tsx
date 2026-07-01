export const runtime = 'edge'

import Link from 'next/link'
import Image from 'next/image'
import { getPublishedReviews } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Clock, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Reviews',
  description: 'Expert product reviews backed by research across trusted expert sources and real user feedback.',
  alternates: { canonical: '/reviews' },
}

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews(50)

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 container px-4 py-14 md:py-20">
        <div className="mb-10 md:mb-12">
          <p className="mb-2.5 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            <span className="h-px w-6 bg-brand/50" />
            Reviews
          </p>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-ink md:text-5xl">All Reviews</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-ink">
            Expert product reviews backed by research across trusted expert sources and real user feedback.
          </p>
        </div>

        {reviews.length > 0 ? (
          <Reveal stagger className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review: any) => (
              <Link
                key={review.id}
                href={`/reviews/${review.slug}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-card-edge bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-card-hover"
              >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-b from-white to-paper-deep">
                  {review.card_image ? (
                    <Image
                      src={review.card_image}
                      alt={review.title}
                      fill
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : review.category_slug ? (
                    <Image
                      src={`/categories/${review.category_slug}.jpg`}
                      alt={review.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6">
                      <span className="text-center font-serif text-lg text-muted-ink">{review.title}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
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
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand transition-all group-hover:gap-2.5">
                    Read review <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </Reveal>
        ) : (
          <p className="py-12 text-center text-faint">No reviews published yet. Check back soon!</p>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

export const runtime = 'edge'

import Link from 'next/link'
import Image from 'next/image'
import { getPublishedReviews } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Reviews',
  description: 'Expert product reviews backed by research from Wirecutter, RTINGS, and real Reddit user feedback.',
}

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews(50)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">All Reviews</h1>
          <p className="text-slate-600 mt-2">
            Expert product reviews backed by research from Wirecutter, CNN Underscored, RTINGS, and real Reddit user feedback.
          </p>
        </div>

        {reviews.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review: any) => (
              <Link
                key={review.id}
                href={`/reviews/${review.slug}`}
                className="group block rounded-lg border border-slate-200 bg-white overflow-hidden transition-all hover:shadow-lg hover:border-violet-200"
              >
                <div className="aspect-video bg-gradient-to-br from-violet-100 to-purple-50 relative overflow-hidden">
                  {review.category_slug ? (
                    <Image
                      src={`/categories/${review.category_slug}.jpg`}
                      alt={review.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {review.category_name && (
                      <Badge className="bg-violet-100 text-violet-700 text-xs">{review.category_name}</Badge>
                    )}
                    {review.published_at && (
                      <span className="text-xs text-slate-400 flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(review.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                    {review.title}
                  </h2>
                  {review.subtitle && (
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">{review.subtitle}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-500 py-12">No reviews published yet. Check back soon!</p>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

import Image from "next/image"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowRight, Sparkles } from "lucide-react"
import { getFeaturedReview } from "@/lib/db"
import { HERO_REVIEW_CANDIDATES } from "@/lib/curation"

export async function FeaturedReview() {
  const review = await getFeaturedReview(HERO_REVIEW_CANDIDATES)
  if (!review) return null

  const image = review.category_slug
    ? `/categories/${review.category_slug}.jpg`
    : "/placeholder.svg?height=380&width=440"
  const productCount = Number(review.product_count) || 0

  return (
    <div className="group relative">
      {/* Soft brand glow behind the card */}
      <div
        aria-hidden
        className="absolute -inset-3 -z-10 rounded-[1.75rem] bg-brand/10 opacity-70 blur-2xl"
      />
      <Card className="overflow-hidden rounded-2xl border-card-edge shadow-card-lift">
        <Link href={`/reviews/${review.slug}`} className="block">
          <div className="relative h-[340px] overflow-hidden sm:h-[400px]">
            <Image
              src={image}
              alt={review.title}
              fill
              priority
              sizes="(min-width: 1024px) 440px, 100vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/55 via-transparent to-transparent" />

            <div className="absolute left-4 top-4">
              <span className="inline-flex items-center gap-1.5 rounded-pill bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand shadow-xs backdrop-blur">
                <Sparkles className="h-3 w-3" />
                Editor&apos;s Choice
              </span>
            </div>

            {/* Warm glass overlay at bottom */}
            <div className="absolute inset-x-0 bottom-0 border-t border-white/25 bg-paper/75 p-5 backdrop-blur-xl backdrop-saturate-150">
              {review.category_name && (
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                  {review.category_name}
                </span>
              )}
              <h3 className="mt-1.5 font-serif text-[20px] font-medium leading-tight text-ink">
                {review.title}
              </h3>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs font-medium text-faint">
                  {productCount > 0 ? `${productCount} products compared` : "Independently researched"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand transition-all group-hover:gap-2.5">
                  Read review
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </Card>
    </div>
  )
}

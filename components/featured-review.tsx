import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import { getFeaturedReview } from "@/lib/db"

export async function FeaturedReview() {
  const review = await getFeaturedReview()
  if (!review) return null

  const image = review.category_slug
    ? `/categories/${review.category_slug}.jpg`
    : "/placeholder.svg?height=380&width=440"
  const productCount = Number(review.product_count) || 0

  return (
    <Card className="overflow-hidden relative">
      <div className="relative h-[380px] overflow-hidden">
        <Image
          src={image}
          alt={review.title}
          fill
          className="object-cover"
        />
        {/* Warm glass overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-paper/40 bg-paper/70 p-4 backdrop-blur-xl backdrop-saturate-150">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="text-xs">Editor&apos;s Choice</Badge>
            {review.category_name && (
              <span className="text-xs uppercase tracking-wide text-muted-ink">
                {review.category_name}
              </span>
            )}
          </div>
          <h3 className="font-serif text-lg font-medium leading-tight text-ink">
            {review.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            {productCount > 0 ? (
              <span className="text-xs text-faint">{productCount} products compared</span>
            ) : (
              <span className="text-xs text-faint">Independently researched</span>
            )}
            <Button asChild size="sm" className="gap-1">
              <Link href={`/reviews/${review.slug}`}>
                Read Review
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}

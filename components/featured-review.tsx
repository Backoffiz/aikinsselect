import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExternalLink, Star } from "lucide-react"

export function FeaturedReview() {
  return (
    <Card className="overflow-hidden relative">
      <div className="relative h-[380px] overflow-hidden">
        <Image
          src="/featured-earbuds.jpg"
          alt="Best Wireless Earbuds"
          fill
          className="object-cover"
        />
        {/* Warm glass overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-paper/40 bg-paper/70 p-4 backdrop-blur-xl backdrop-saturate-150">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="text-xs">Featured</Badge>
            <span className="text-xs uppercase tracking-wide text-muted-ink">Tech • Earbuds</span>
          </div>
          <h3 className="font-serif text-lg font-medium leading-tight text-ink">
            The 7 Best Wireless Earbuds for Every Budget
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-star text-star" : "fill-hairline text-hairline"}`} />
                ))}
              </div>
              <span className="ml-2 text-xs text-faint">24 products tested</span>
            </div>
            <Button asChild size="sm" className="gap-1">
              <Link href="/reviews/best-wireless-earbuds">
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

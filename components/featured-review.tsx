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
        {/* Liquid glass overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 backdrop-blur-2xl bg-white/10 backdrop-saturate-150 border-t border-white/20 p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge className="bg-primary/90 text-primary-foreground text-xs backdrop-blur-sm">Featured</Badge>
            <span className="text-xs text-white/80">Tech • Earbuds</span>
          </div>
          <h3 className="text-lg font-bold leading-tight text-white drop-shadow-sm">
            The 7 Best Wireless Earbuds for Every Budget
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-yellow-400 text-yellow-400" : "fill-white/30 text-white/30"}`} />
                ))}
              </div>
              <span className="ml-2 text-xs text-white/70">24 products tested</span>
            </div>
            <Button asChild size="sm" variant="secondary" className="gap-1 bg-white/25 hover:bg-white/40 text-white border-white/20 backdrop-blur-sm">
              <Link href="/reviews/best-wireless-earbuds-2023">
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

import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ExternalLink, Star } from "lucide-react"

export function FeaturedReview() {
  return (
    <Card className="overflow-hidden max-h-[360px]">
      <div className="relative h-[160px] overflow-hidden">
        <Image
          src="/featured-earbuds.png"
          alt="Featured Review"
          width={500}
          height={160}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-3 left-3">
          <Badge className="bg-primary text-primary-foreground text-xs">Featured</Badge>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Tech</span>
          <span>•</span>
          <span>Headphones</span>
        </div>
        <h3 className="mt-1 text-base font-bold leading-tight">The 7 Best Wireless Earbuds for Every Budget</h3>
        <div className="mt-1.5 flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? "fill-primary text-primary" : "fill-muted text-muted"}`} />
            ))}
          </div>
          <span className="ml-2 text-xs text-muted-foreground">24 products tested</span>
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button asChild size="sm" className="w-full gap-1">
          <Link href="/reviews/best-wireless-earbuds-2023">
            Read Review
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

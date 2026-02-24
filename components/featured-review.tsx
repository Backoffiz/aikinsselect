import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ExternalLink, Star } from "lucide-react"

export function FeaturedReview() {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Image
          src="/placeholder.svg?height=300&width=600"
          alt="Featured Review"
          width={600}
          height={300}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute bottom-4 left-4">
          <Badge className="bg-primary text-primary-foreground">Featured</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Tech</span>
          <span>•</span>
          <span>Headphones</span>
        </div>
        <h3 className="mt-2 text-xl font-bold">The 7 Best Wireless Earbuds for Every Budget (2023)</h3>
        <div className="mt-2 flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < 4 ? "fill-primary text-primary" : "fill-muted text-muted"}`} />
            ))}
          </div>
          <span className="ml-2 text-sm text-muted-foreground">Based on 24 products tested</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full gap-1">
          <Link href="/reviews/best-wireless-earbuds-2023">
            Read Review
            <ExternalLink className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}


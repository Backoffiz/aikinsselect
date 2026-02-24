import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Award, ExternalLink, Star } from "lucide-react"

interface ProductCardProps {
  title: string
  category: string
  image: string
  rating: number
  reviewCount: number
  price: string
  bestPick?: boolean
}

export function ProductCard({
  title,
  category,
  image,
  rating,
  reviewCount,
  price,
  bestPick = false,
}: ProductCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-violet-md">
      <Link href="#" className="absolute inset-0 z-10">
        <span className="sr-only">View Product</span>
      </Link>
      <div className="relative aspect-square overflow-hidden">
        {bestPick && (
          <div className="absolute top-2 left-2 z-20">
            <Badge className="gap-1 bg-accent text-accent-foreground">
              <Award className="h-3.5 w-3.5" />
              Best Pick
            </Badge>
          </div>
        )}
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          width={300}
          height={300}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <div className="text-sm text-slate-400">{category}</div>
        <h3 className="mt-1 font-semibold text-slate-dark">{title}</h3>
        <div className="mt-2 flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-primary text-primary" : "fill-slate-200 text-slate-200"}`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm text-slate-400">({reviewCount})</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-semibold text-slate-dark">{price}</p>
          <Button
            size="sm"
            variant="ghost"
            className="gap-1 text-slate-default group-hover:bg-primary group-hover:text-white"
          >
            View
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}


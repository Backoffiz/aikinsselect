import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Award, Star } from "lucide-react"

interface ProductCardProps {
  title: string
  category: string
  image?: string
  rating: number
  reviewCount?: number
  price: string
  bestPick?: boolean
  categorySlug?: string
}

export function ProductCard({
  title,
  category,
  rating,
  reviewCount,
  price,
  bestPick = false,
  categorySlug,
}: ProductCardProps) {
  // Color mapping for category backgrounds
  const categoryColors: Record<string, string> = {
    Tech: "from-violet-500 to-indigo-600",
    Home: "from-emerald-500 to-teal-600",
    Kitchen: "from-orange-500 to-red-500",
    Gaming: "from-purple-600 to-pink-600",
    Fitness: "from-green-500 to-lime-600",
    Beauty: "from-pink-400 to-rose-500",
    Travel: "from-sky-500 to-blue-600",
    Pets: "from-amber-500 to-yellow-600",
    Office: "from-slate-500 to-gray-600",
    Outdoors: "from-green-600 to-emerald-700",
    Baby: "from-blue-300 to-indigo-400",
    Auto: "from-gray-600 to-slate-700",
  }

  const gradient = categoryColors[category] || "from-violet-500 to-indigo-600"

  return (
    <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-lg">
      <div className={`relative h-40 bg-gradient-to-br ${gradient} flex items-center justify-center p-4`}>
        {bestPick && (
          <div className="absolute top-2 left-2 z-20">
            <Badge className="gap-1 bg-amber-400 text-amber-900 text-xs font-bold">
              <Award className="h-3 w-3" />
              Best Pick
            </Badge>
          </div>
        )}
        <h3 className="text-lg font-bold text-white text-center drop-shadow-sm leading-tight">
          {title}
        </h3>
      </div>
      <div className="p-4">
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide">{category}</div>
        <div className="mt-2 flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
              />
            ))}
          </div>
          <span className="ml-1.5 text-xs text-slate-400">{rating.toFixed(1)}</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="font-bold text-slate-900">{price}</p>
        </div>
      </div>
    </div>
  )
}

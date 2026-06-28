import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { SaveHeartButton } from "@/components/saved/save-heart-button"
import { Award, Star } from "lucide-react"

interface ProductCardProps {
  title: string
  category: string
  image?: string
  rating: number
  reviewCount?: number
  price: string
  /** Original/list price (display string, e.g. "$348"). When higher than price, renders a struck price + discount pill. */
  originalPrice?: string
  bestPick?: boolean
  categorySlug?: string
  /** External affiliate URL — used by the green "Check price" CTA. */
  affiliateUrl?: string
  /** Product id + slug enable the save-heart and the internal detail link. */
  productId?: string
  slug?: string
}

function toNumber(s?: string): number | null {
  if (!s) return null
  const n = Number(s.replace(/[^0-9.]/g, ""))
  return Number.isFinite(n) && n > 0 ? n : null
}

export function ProductCard({
  title,
  category,
  image,
  rating,
  reviewCount,
  price,
  originalPrice,
  bestPick = false,
  affiliateUrl,
  productId,
  slug,
}: ProductCardProps) {
  const hasImage = image && !image.includes("placeholder")
  const detailHref = slug ? `/products/${slug}` : affiliateUrl

  const priceNum = toNumber(price)
  const origNum = toNumber(originalPrice)
  const hasDeal = priceNum !== null && origNum !== null && origNum > priceNum
  const savePct = hasDeal ? Math.round(((origNum! - priceNum!) / origNum!) * 100) : 0

  const heartId = productId ?? slug
  const savedItem = heartId
    ? { id: heartId, name: title, price, wasPrice: originalPrice, sub: category, slug, image }
    : null

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[5px] border border-card-edge bg-white transition-all hover:shadow-card-hover">
      <div className={`relative flex h-48 items-center justify-center p-4 ${hasImage ? "bg-white" : "bg-paper-deep"}`}>
        {bestPick && (
          <div className="absolute left-3 top-3 z-20">
            <Badge variant="award" className="gap-1 rounded-[2px] text-[10px] font-extrabold uppercase tracking-wide">
              <Award className="h-3 w-3" />
              Best Pick
            </Badge>
          </div>
        )}
        {hasDeal && (
          <div className="absolute left-3 bottom-3 z-20">
            <Badge variant="deal" className="rounded-pill text-[10px] font-extrabold">-{savePct}%</Badge>
          </div>
        )}
        {savedItem && <SaveHeartButton item={savedItem} />}
        {hasImage ? (
          <img src={image} alt={title} className="max-h-full max-w-full object-contain" loading="lazy" />
        ) : (
          <span className="px-2 text-center font-serif text-xl text-muted-ink">{title}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] font-bold uppercase tracking-wider text-faint">{category}</div>
        <h3 className="mt-1.5 font-semibold leading-snug text-ink">
          {detailHref ? (
            <Link href={detailHref} className="after:absolute after:inset-0">
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? "fill-star text-star" : "fill-hairline text-hairline"}`}
              />
            ))}
          </div>
          <span className="text-xs text-faint">
            {rating.toFixed(1)}
            {reviewCount ? ` (${reviewCount})` : ""}
          </span>
        </div>
        <div className="mt-auto flex items-end justify-between pt-4">
          <div className="flex items-baseline gap-2">
            <p className="font-serif text-xl font-semibold tabular-nums text-ink">{price}</p>
            {hasDeal && <span className="text-xs text-faint line-through">{originalPrice}</span>}
          </div>
          {affiliateUrl && (
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener sponsored"
              className="relative z-20 rounded-[2px] bg-brand px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Check price
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

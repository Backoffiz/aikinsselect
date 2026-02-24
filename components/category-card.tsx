import Link from "next/link"
import Image from "next/image"

interface CategoryCardProps {
  title: string
  icon: string
  count: number
}

export function CategoryCard({ title, icon, count }: CategoryCardProps) {
  const slug = title.toLowerCase()

  return (
    <Link
      href={`/categories/${slug}`}
      className="group relative overflow-hidden rounded-lg border bg-white transition-all hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={`/categories/${slug}.jpg`}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
          <h3 className="text-sm font-bold text-white drop-shadow-sm">{title}</h3>
          <p className="text-xs text-white/80">{count} products</p>
        </div>
      </div>
    </Link>
  )
}

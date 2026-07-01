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
      className="group relative block overflow-hidden rounded-xl border border-card-edge bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={`/categories/${slug}.jpg`}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/85 via-ink-deep/25 to-transparent" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/0 transition group-hover:ring-white/15" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-center">
          <h3 className="font-serif text-base font-medium text-white drop-shadow-sm">{title}</h3>
          <p className="mt-0.5 text-xs font-medium text-white/75">{count} products</p>
        </div>
      </div>
    </Link>
  )
}

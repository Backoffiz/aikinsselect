export const runtime = 'edge'

import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Reveal } from '@/components/ui/reveal'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Categories',
  description: 'Explore product categories — Tech, Home, Kitchen, Gaming, Fitness, Beauty, and more.',
  alternates: { canonical: '/categories' },
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 container px-4 py-14 md:py-20">
        <div className="mb-10 md:mb-12">
          <p className="mb-2.5 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
            <span className="h-px w-6 bg-brand/50" />
            Categories
          </p>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-ink md:text-5xl">Browse Categories</h1>
          <p className="mt-3 text-lg text-muted-ink">Find the best products in every category</p>
        </div>

        <Reveal stagger className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative block overflow-hidden rounded-xl border border-card-edge bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={`/categories/${cat.slug}.jpg`}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-deep/85 via-ink-deep/25 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="font-serif text-xl font-medium text-white drop-shadow-sm">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-white/85">{cat.product_count || 0} products</p>
                </div>
              </div>
            </Link>
          ))}
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  )
}

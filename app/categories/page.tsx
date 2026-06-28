export const runtime = 'edge'

import Link from 'next/link'
import Image from 'next/image'
import { getCategories } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Categories',
  description: 'Explore product categories — Tech, Home, Kitchen, Gaming, Fitness, Beauty, and more.',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 container px-4 py-12 md:py-16">
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Categories</p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl font-medium tracking-tight text-ink">Browse Categories</h1>
          <p className="mt-3 text-lg text-muted-ink">Find the best products in every category</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group relative overflow-hidden rounded-[5px] border border-card-edge bg-white transition-all hover:shadow-card-hover"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={`/categories/${cat.slug}.jpg`}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="font-serif text-xl font-medium text-white drop-shadow-sm">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-white/85">{cat.product_count || 0} products</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

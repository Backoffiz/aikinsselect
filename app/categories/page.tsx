export const runtime = 'edge'

import Link from 'next/link'
import { getCategories } from '@/lib/db'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Browse Categories',
  description: 'Explore product categories — Tech, Home, Kitchen, Gaming, Fitness, Beauty, and more.',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  tech: '💻', home: '🏠', kitchen: '🍳', fitness: '💪',
  beauty: '✨', travel: '✈️', pets: '🐾', office: '💼',
  gaming: '🎮', outdoors: '⛰️', baby: '👶', auto: '🚗',
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container px-4 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Browse Categories</h1>
          <p className="text-slate-600 mt-2">Find the best products in every category</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 transition-all hover:shadow-lg hover:border-violet-200"
            >
              <span className="text-3xl">{CATEGORY_EMOJIS[cat.slug] || '📦'}</span>
              <div>
                <h2 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                  {cat.name}
                </h2>
                <p className="text-sm text-slate-500">{cat.product_count || 0} products</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

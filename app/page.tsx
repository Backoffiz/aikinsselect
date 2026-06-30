export const runtime = 'edge'

import Link from "next/link"
import Image from "next/image"
import { SearchBar } from "@/components/search-bar"
import { FeaturedReview } from "@/components/featured-review"
import { CategoryCard } from "@/components/category-card"
import { ProductCard } from "@/components/product-card"
import { Newsletter } from "@/components/newsletter"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock } from "lucide-react"
import { getPublishedReviews, getCategories, getTrendingProducts, getStats } from "@/lib/db"
import { FEATURES } from "@/lib/flags"
import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import { jsonLdGraph, organizationNode, websiteNode } from "@/lib/seo"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  tech: "laptop", home: "home", kitchen: "utensils", fitness: "dumbbell",
  beauty: "sparkles", travel: "plane", pets: "paw", office: "briefcase",
  gaming: "gamepad", outdoors: "mountain", baby: "baby", auto: "car",
}

export default async function HomePage() {
  const [reviews, categories, trendingProducts, stats] = await Promise.all([
    getPublishedReviews(3),
    getCategories(),
    getTrendingProducts(4),
    getStats(),
  ])

  const trustStats = [
    { value: stats.products ? `${stats.products.toLocaleString()}+` : "1,400+", label: "products tested" },
    { value: stats.reviews ? `${stats.reviews}+` : "120+", label: "buying guides" },
    { value: stats.categories ? `${stats.categories}` : "12", label: "categories" },
    { value: "0", label: "paid placements", accent: true },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={jsonLdGraph([organizationNode(), websiteNode()])} />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-paper py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_440px] lg:gap-12">
              <div className="flex flex-col justify-center">
                <div className="mb-5 flex items-center gap-3">
                  <span className="h-px w-6 bg-brand" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-brand">Independent product reviews</span>
                </div>
                <h1 className="max-w-[760px] font-serif text-4xl font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl xl:text-6xl">
                  We test thousands of products so you buy the right one — once.
                </h1>
                <p className="mt-5 max-w-[560px] text-lg leading-relaxed text-muted-ink">
                  No fluff, no paid placements. We cross-reference Wirecutter, RTINGS, and Reddit to find the products that actually deliver.
                </p>
                <div className="mt-7 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-center">
                  <Button asChild variant="ink" size="lg" className="gap-1.5">
                    <Link href="/reviews">Browse the latest reviews <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Link href="/categories" className="text-sm font-semibold text-brand underline-offset-4 hover:underline">
                    Explore categories →
                  </Link>
                </div>
                <SearchBar className="mt-7 max-w-md lg:hidden" />
                <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-4 border-t border-hairline pt-7">
                  {trustStats.map((s) => (
                    <div key={s.label}>
                      <dt className={`font-serif text-3xl font-medium ${s.accent ? "text-brand" : "text-ink"}`}>{s.value}</dt>
                      <dd className="mt-0.5 text-[13px] text-faint">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="hidden lg:block">
                <FeaturedReview />
              </div>
            </div>
          </div>
        </section>

        {/* Trending Now — Dynamic from D1 */}
        <section className="bg-white py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mb-8 flex items-end justify-between">
              <div className="space-y-1">
                <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">This month&apos;s top picks</h2>
                <p className="text-muted-ink">The products our readers are loving right now</p>
              </div>
              <Link href="/reviews" className="hidden items-center text-sm font-semibold text-brand sm:flex">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {trendingProducts.length > 0 ? trendingProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  productId={product.id}
                  slug={product.slug}
                  title={product.name}
                  category={product.category_name || "Products"}
                  image={product.image_url || "/placeholder.svg?height=300&width=300"}
                  rating={product.rating || 4.5}
                  price={product.price ? `$${Number(product.price).toFixed(2)}` : "Check price"}
                  bestPick={product.is_best_pick === 1}
                  affiliateUrl={product.affiliate_url}
                />
              )) : (
                <p className="col-span-full py-8 text-center text-faint">Top picks coming soon.</p>
              )}
            </div>
          </div>
        </section>

        {/* Browse Categories — Dynamic from D1 */}
        <section className="bg-panel py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mb-8 flex items-end justify-between">
              <div className="space-y-1">
                <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">Browse by category</h2>
                <p className="text-muted-ink">Find the perfect products in your favorite categories</p>
              </div>
              <Link href="/categories" className="hidden items-center text-sm font-semibold text-brand sm:flex">
                All categories <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.length > 0 ? categories.map((cat: any) => (
                <CategoryCard
                  key={cat.id}
                  title={cat.name}
                  icon={CATEGORY_ICONS[cat.slug] || "box"}
                  count={cat.product_count || 0}
                />
              )) : (
                <p className="col-span-full py-8 text-center text-faint">Categories coming soon.</p>
              )}
            </div>
          </div>
        </section>

        {/* Latest Reviews — Dynamic from D1 */}
        <section className="bg-white py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="mb-8 flex items-end justify-between">
              <div className="space-y-1">
                <h2 className="font-serif text-3xl font-medium tracking-tight text-ink">Latest reviews</h2>
                <p className="text-muted-ink">Our most recent in-depth product analyses</p>
              </div>
              <Link href="/reviews" className="hidden items-center text-sm font-semibold text-brand sm:flex">
                All reviews <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.length > 0 ? reviews.map((review: any) => (
                <div key={review.id} className="group relative overflow-hidden rounded-[5px] border border-card-edge bg-white transition-all hover:shadow-card-hover">
                  <Link href={`/reviews/${review.slug}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View Review</span>
                  </Link>
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-b from-white to-paper-deep">
                    {review.card_image ? (
                      <Image
                        src={review.card_image}
                        alt={review.title}
                        fill
                        className="object-contain p-6 transition-transform group-hover:scale-105"
                      />
                    ) : review.category_slug ? (
                      <Image
                        src={`/categories/${review.category_slug}.jpg`}
                        alt={review.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-pill bg-paper/90 px-2.5 py-1 text-xs font-semibold text-ink backdrop-blur-sm">
                        <Clock className="h-3 w-3" />
                        {review.published_at
                          ? new Date(review.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'New'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-brand">{review.category_name || 'Review'}</div>
                    <h3 className="mt-2 font-serif text-xl font-medium leading-snug text-ink transition-colors group-hover:text-brand">
                      {review.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-ink">
                      {review.subtitle || 'Expert-researched product recommendations backed by Wirecutter, RTINGS, and Reddit.'}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="col-span-3 py-8 text-center text-faint">Reviews coming soon!</p>
              )}
            </div>
          </div>
        </section>

        {FEATURES.newsletter && <Newsletter />}
      </main>
      <SiteFooter />
    </div>
  )
}

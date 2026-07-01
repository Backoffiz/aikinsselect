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
import { Reveal } from "@/components/ui/reveal"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, ShieldCheck } from "lucide-react"
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

type TrustStat = { value: string; label: string; accent?: boolean }

function TrustStats({
  items,
  className,
  style,
}: {
  items: TrustStat[]
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <dl className={className} style={style}>
      {items.map((s) => (
        <div key={s.label}>
          <dt className={`font-serif text-[26px] font-medium leading-none tabular-nums md:text-3xl ${s.accent ? "text-brand" : "text-ink"}`}>
            {s.value}
          </dt>
          <dd className="mt-1.5 text-[12.5px] leading-tight text-faint">{s.label}</dd>
        </div>
      ))}
    </dl>
  )
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel,
}: {
  eyebrow: string
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
      <div>
        <p className="mb-2.5 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
          <span className="h-px w-6 bg-brand/50" />
          {eyebrow}
        </p>
        <h2 className="font-serif text-[28px] font-medium leading-tight tracking-tight text-ink md:text-[34px]">
          {title}
        </h2>
        {subtitle && <p className="mt-2 text-[15px] text-muted-ink md:text-base">{subtitle}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-brand transition-all hover:gap-2.5 sm:flex"
        >
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  )
}

export default async function HomePage() {
  const [reviews, categories, trendingProducts, stats] = await Promise.all([
    getPublishedReviews(3),
    getCategories(),
    getTrendingProducts(4),
    getStats(),
  ])

  const trustStats: TrustStat[] = [
    { value: stats.products ? `${stats.products.toLocaleString()}+` : "—", label: "products reviewed" },
    { value: stats.reviews ? `${stats.reviews}+` : "—", label: "buying guides" },
    { value: stats.categories ? `${stats.categories}` : "—", label: "categories" },
    { value: "0", label: "paid placements", accent: true },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <JsonLd data={jsonLdGraph([organizationNode(), websiteNode()])} />
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="hero-glow relative overflow-hidden">
          <div className="container px-4 pb-14 pt-10 md:px-6 md:pb-24 md:pt-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:items-center lg:gap-14">
              {/* Copy */}
              <div className="flex flex-col">
                <p className="animate-fade-up mb-5 flex items-center gap-3" style={{ animationDelay: "0ms" }}>
                  <span className="h-px w-6 bg-brand" />
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                    Independent product reviews
                  </span>
                </p>
                <h1
                  className="animate-fade-up max-w-[760px] text-balance font-serif text-[34px] font-medium leading-[1.05] tracking-tight text-ink sm:text-5xl xl:text-6xl"
                  style={{ animationDelay: "80ms" }}
                >
                  We review thousands of products so you buy the right one — once.
                </h1>
                <p
                  className="animate-fade-up mt-5 max-w-[560px] text-pretty text-[17px] leading-relaxed text-muted-ink md:text-lg"
                  style={{ animationDelay: "160ms" }}
                >
                  No fluff, no paid placements. We cross-reference trusted expert reviews and real user
                  feedback to find the products that actually deliver.
                </p>
                <div
                  className="animate-fade-up mt-7 flex flex-col gap-3 min-[400px]:flex-row min-[400px]:items-center"
                  style={{ animationDelay: "240ms" }}
                >
                  <Button asChild variant="ink" size="lg" className="w-full gap-1.5 min-[400px]:w-auto">
                    <Link href="/reviews">
                      Browse the latest reviews <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Link
                    href="/categories"
                    className="inline-flex items-center justify-center gap-1 px-2 py-2.5 text-sm font-semibold text-brand underline-offset-4 transition-all hover:gap-2 hover:underline"
                  >
                    Explore categories <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="animate-fade-up mt-7 max-w-md lg:hidden" style={{ animationDelay: "300ms" }}>
                  <SearchBar />
                </div>
                <TrustStats
                  items={trustStats}
                  className="animate-fade-up mt-10 hidden flex-wrap gap-x-12 gap-y-4 border-t border-hairline pt-7 lg:flex"
                  style={{ animationDelay: "360ms" }}
                />
              </div>

              {/* Featured — now visible on every breakpoint */}
              <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
                <FeaturedReview />
              </div>

              {/* Trust stats — mobile placement: visual proof after the imagery */}
              <TrustStats
                items={trustStats}
                className="animate-fade-up grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-card-edge bg-white/60 p-5 backdrop-blur-sm lg:hidden"
                style={{ animationDelay: "420ms" }}
              />
            </div>

            {/* Trust strip */}
            <Reveal className="mt-10 flex items-center gap-2.5 text-[13px] font-medium text-faint md:mt-14">
              <ShieldCheck className="h-4 w-4 shrink-0 text-brand" />
              <span>
                Editorially independent — we research the picks, you get the
                <span className="text-muted-ink"> honest verdict</span>.
              </span>
            </Reveal>
          </div>
        </section>

        {/* Trending Now — Dynamic from D1 */}
        <section className="border-t border-hairline bg-white py-14 md:py-20">
          <div className="container px-4 md:px-6">
            <SectionHeading
              eyebrow="Trending now"
              title="This month's top picks"
              subtitle="The products our readers are loving right now"
              href="/reviews"
              linkLabel="View all"
            />
            <Reveal
              stagger
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4"
            >
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
            </Reveal>
          </div>
        </section>

        {/* Browse Categories — Dynamic from D1 */}
        <section className="border-t border-hairline bg-panel py-14 md:py-20">
          <div className="container px-4 md:px-6">
            <SectionHeading
              eyebrow="Explore"
              title="Browse by category"
              subtitle="Find the perfect products in your favorite categories"
              href="/categories"
              linkLabel="All categories"
            />
            <Reveal
              stagger
              className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
            >
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
            </Reveal>
          </div>
        </section>

        {/* Latest Reviews — Dynamic from D1 */}
        <section className="border-t border-hairline bg-white py-14 md:py-20">
          <div className="container px-4 md:px-6">
            <SectionHeading
              eyebrow="Fresh off the bench"
              title="Latest reviews"
              subtitle="Our most recent in-depth product analyses"
              href="/reviews"
              linkLabel="All reviews"
            />
            <Reveal stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {reviews.length > 0 ? reviews.map((review: any) => (
                <div
                  key={review.id}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-card-edge bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/20 hover:shadow-card-hover"
                >
                  <Link href={`/reviews/${review.slug}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View Review</span>
                  </Link>
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-b from-white to-paper-deep">
                    {review.card_image ? (
                      <Image
                        src={review.card_image}
                        alt={review.title}
                        fill
                        className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : review.category_slug ? (
                      <Image
                        src={`/categories/${review.category_slug}.jpg`}
                        alt={review.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : null}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-pill bg-paper/90 px-2.5 py-1 text-xs font-semibold text-ink shadow-xs backdrop-blur-sm">
                        <Clock className="h-3 w-3" />
                        {review.published_at
                          ? new Date(review.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'New'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-brand">{review.category_name || 'Review'}</div>
                    <h3 className="mt-2 font-serif text-xl font-medium leading-snug text-ink transition-colors group-hover:text-brand">
                      {review.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-ink">
                      {review.subtitle || 'Expert-researched product recommendations backed by trusted reviews and real user feedback.'}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand transition-all group-hover:gap-2.5">
                      Read review <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              )) : (
                <p className="col-span-full py-8 text-center text-faint">Reviews coming soon!</p>
              )}
            </Reveal>
          </div>
        </section>

        {FEATURES.newsletter && <Newsletter />}
      </main>
      <SiteFooter />
    </div>
  )
}

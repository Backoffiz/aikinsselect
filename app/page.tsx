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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, TrendingUp } from "lucide-react"
import { getPublishedReviews, getCategories, getTrendingProducts } from "@/lib/db"

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  tech: "laptop", home: "home", kitchen: "utensils", fitness: "dumbbell",
  beauty: "sparkles", travel: "plane", pets: "paw", office: "briefcase",
  gaming: "gamepad", outdoors: "mountain", baby: "baby", auto: "car",
}

export default async function HomePage() {
  const [reviews, categories, trendingProducts] = await Promise.all([
    getPublishedReviews(3),
    getCategories(),
    getTrendingProducts(4),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-muted to-violet-100 py-8 md:py-14">
          <div className="container px-4 md:px-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_400px] lg:gap-8 xl:grid-cols-[1fr_500px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-flex bg-primary text-primary-foreground">AI-Powered Reviews</Badge>
                  <h1 className="text-3xl font-bold tracking-tighter text-slate-dark sm:text-4xl xl:text-5xl/none">
                    Expert Product Reviews, <br />
                    Simplified
                  </h1>
                  <p className="max-w-[600px] text-slate-default md:text-xl">
                    Discover the best products in every category, backed by thorough research and AI-powered analysis.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/reviews" passHref>
                    <Button size="lg" className="gap-1.5">
                      Browse Reviews
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/categories" passHref>
                    <Button size="lg" variant="outline">
                      Explore Categories
                    </Button>
                  </Link>
                </div>
              </div>
              <SearchBar className="lg:hidden" />
              <div className="hidden lg:block">
                <FeaturedReview />
              </div>
            </div>
          </div>
        </section>

        {/* Trending Now — Dynamic from D1 */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-dark">Trending Now</h2>
                <p className="text-slate-default">The most popular products our readers are loving</p>
              </div>
              <Link href="/reviews" className="hidden sm:flex items-center text-blue-default font-medium">
                View all trending
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {trendingProducts.length > 0 ? trendingProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  title={product.name}
                  category={product.category_name || "Products"}
                  image="/placeholder.svg?height=300&width=300"
                  rating={product.rating || 4.5}
                  reviewCount={Math.floor(Math.random() * 800) + 200}
                  price={product.price ? `$${Number(product.price).toFixed(2)}` : "Check Price"}
                  bestPick={product.is_best_pick === 1}
                />
              )) : (
                <>
                  <ProductCard title="Sony WH-1000XM5" category="Headphones" image="/placeholder.svg?height=300&width=300" rating={4.8} reviewCount={1243} price="$349.99" bestPick={true} />
                  <ProductCard title="Ninja Foodi DualZone" category="Kitchen" image="/placeholder.svg?height=300&width=300" rating={4.7} reviewCount={856} price="$199.99" bestPick={false} />
                  <ProductCard title="LG C4 OLED 65&quot;" category="TVs" image="/placeholder.svg?height=300&width=300" rating={4.6} reviewCount={532} price="$1,299.99" bestPick={false} />
                  <ProductCard title="Dyson V15 Detect" category="Home" image="/placeholder.svg?height=300&width=300" rating={4.9} reviewCount={789} price="$649.99" bestPick={true} />
                </>
              )}
            </div>
          </div>
        </section>

        {/* Browse Categories — Dynamic from D1 */}
        <section className="bg-muted py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-dark">Browse Categories</h2>
                <p className="text-muted-foreground">Find the perfect products in your favorite categories</p>
              </div>
              <Link href="/categories" className="hidden sm:flex items-center text-primary font-medium">
                All categories
                <ArrowRight className="ml-1 h-4 w-4" />
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
                <>
                  <CategoryCard title="Tech" icon="laptop" count={42} />
                  <CategoryCard title="Home" icon="home" count={38} />
                  <CategoryCard title="Kitchen" icon="utensils" count={29} />
                  <CategoryCard title="Fitness" icon="dumbbell" count={24} />
                  <CategoryCard title="Gaming" icon="gamepad" count={27} />
                  <CategoryCard title="Office" icon="briefcase" count={22} />
                </>
              )}
            </div>
          </div>
        </section>

        {/* Latest Reviews — Dynamic from D1 */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-dark">Latest Reviews</h2>
                <p className="text-slate-default">Our most recent in-depth product analyses</p>
              </div>
              <Link href="/reviews" className="hidden sm:flex items-center text-blue-default font-medium">
                All reviews
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.length > 0 ? reviews.map((review: any) => (
                <div key={review.id} className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-lg">
                  <Link href={`/reviews/${review.slug}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View Review</span>
                  </Link>
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-violet-100 to-purple-50">
                    {review.category_slug && (
                      <Image
                        src={`/categories/${review.category_slug}.jpg`}
                        alt={review.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/80 text-slate-dark backdrop-blur-sm text-xs">
                        <Clock className="mr-1 h-3 w-3" />
                        {review.published_at
                          ? new Date(review.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'New'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>{review.category_name || 'Review'}</span>
                    </div>
                    <h3 className="mt-1.5 text-lg font-bold text-slate-dark group-hover:text-primary transition-colors">
                      {review.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-default">
                      {review.subtitle || 'Expert-researched product recommendations backed by Wirecutter, RTINGS, and Reddit.'}
                    </p>
                  </div>
                </div>
              )) : (
                <p className="col-span-3 text-center text-slate-500 py-8">Reviews coming soon!</p>
              )}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  )
}

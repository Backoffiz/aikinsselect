import Link from "next/link"
import { SearchBar } from "@/components/search-bar"
import { CategoryCard } from "@/components/category-card"
import { Newsletter } from "@/components/newsletter"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, Clock, TrendingUp, Star } from "lucide-react"
import { getPublishedReviews, getCategories, getLatestProducts } from "@/lib/db"

export default async function HomePage() {
  const [reviews, categories, products] = await Promise.all([
    getPublishedReviews(6),
    getCategories(),
    getLatestProducts(8),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-slate-50 to-violet-50 py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              <Badge className="inline-flex bg-violet-600 text-white">AI-Powered Research</Badge>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl xl:text-6xl">
                Expert Product Reviews, <br />
                <span className="text-violet-600">Simplified</span>
              </h1>
              <p className="max-w-[600px] text-slate-600 md:text-xl">
                We cross-reference Wirecutter, RTINGS, and Reddit to find the products that actually deliver. No fluff, just honest picks.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/reviews" passHref>
                  <Button size="lg" className="gap-1.5 bg-violet-600 hover:bg-violet-700">
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
              <SearchBar className="w-full max-w-lg mt-4" />
            </div>
          </div>
        </section>

        {/* Latest Reviews */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Latest Reviews</h2>
                <p className="text-slate-600 mt-1">Our most recent in-depth product analyses</p>
              </div>
              <Link href="/reviews" className="hidden sm:flex items-center text-violet-600 font-medium">
                View all <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review: any) => (
                <Link
                  key={review.id}
                  href={`/reviews/${review.slug}`}
                  className="group block rounded-lg border border-slate-200 bg-white transition-all hover:shadow-lg hover:border-violet-200 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-violet-500 to-purple-600 h-2" />
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {review.category_name && (
                        <Badge className="bg-violet-100 text-violet-700 text-xs">{review.category_name}</Badge>
                      )}
                      <Badge variant="outline" className="text-xs text-slate-400">
                        <Clock className="mr-1 h-3 w-3" />
                        {review.published_at
                          ? new Date(review.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : 'New'}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                      {review.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {review.subtitle || review.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Products */}
        {products.length > 0 && (
          <section className="py-12 md:py-16 bg-slate-50">
            <div className="container px-4 md:px-6">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Top Products</h2>
                  <p className="text-slate-600 mt-1">Expert-recommended picks across all categories</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((product: any) => (
                  <div
                    key={product.id}
                    className="rounded-lg border bg-white p-5 hover:shadow-md transition-shadow"
                  >
                    {product.is_best_pick === 1 && (
                      <Badge className="bg-amber-100 text-amber-700 text-xs mb-2">⭐ Best Pick</Badge>
                    )}
                    <h3 className="font-bold text-slate-900">{product.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{product.category_name}</p>
                    {product.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    )}
                    {product.price && (
                      <p className="text-lg font-bold text-violet-600 mt-2">
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                      </p>
                    )}
                    {product.affiliate_url && (
                      <a
                        href={product.affiliate_url}
                        target="_blank"
                        rel="noopener sponsored"
                        className="mt-3 block text-center text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-md py-2 transition-colors"
                      >
                        Check Price on Amazon
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Categories */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Browse Categories</h2>
                <p className="text-slate-600 mt-1">Find the perfect products in your favorite categories</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.map((cat: any) => (
                <CategoryCard
                  key={cat.id}
                  title={cat.name}
                  icon={cat.icon || 'box'}
                  count={cat.product_count || 0}
                />
              ))}
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

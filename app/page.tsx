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

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-muted to-violet-100 py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <Badge className="inline-flex bg-primary text-primary-foreground">AI-Powered Reviews</Badge>
                  <h1 className="text-3xl font-bold tracking-tighter text-slate-dark sm:text-5xl xl:text-6xl/none">
                    Expert Product Reviews, <br />
                    Simplified
                  </h1>
                  <p className="max-w-[600px] text-slate-default md:text-xl">
                    Discover the best products in every category, backed by thorough research and AI-powered analysis.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/categories" passHref>
                    <Button size="lg" className="gap-1.5">
                      Explore Categories
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/methodology" passHref>
                    <Button size="lg" variant="outline">
                      Our Review Process
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

        {/* Trending Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight text-slate-dark">Trending Now</h2>
                <p className="text-slate-default">The most popular products our readers are loving</p>
              </div>
              <Link href="/trending" className="hidden sm:flex items-center text-blue-default font-medium">
                View all trending
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <ProductCard
                title="Sony WH-1000XM5"
                category="Headphones"
                image="/placeholder.svg?height=300&width=300"
                rating={4.8}
                reviewCount={1243}
                price="$349.99"
                bestPick={true}
              />
              <ProductCard
                title="Ninja Foodi 10-in-1"
                category="Kitchen Appliances"
                image="/placeholder.svg?height=300&width=300"
                rating={4.7}
                reviewCount={856}
                price="$199.99"
                bestPick={false}
              />
              <ProductCard
                title="Samsung Frame TV 55&quot;"
                category="TVs"
                image="/placeholder.svg?height=300&width=300"
                rating={4.6}
                reviewCount={532}
                price="$1,299.99"
                bestPick={false}
              />
              <ProductCard
                title="Dyson V12 Detect"
                category="Vacuums"
                image="/placeholder.svg?height=300&width=300"
                rating={4.9}
                reviewCount={789}
                price="$649.99"
                bestPick={true}
              />
            </div>
            <div className="mt-6 flex justify-center sm:hidden">
              <Link href="/trending" passHref>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-slate-200 text-slate-default hover:bg-aqua-light hover:text-coral-default"
                >
                  View all trending
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
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
              <CategoryCard title="Tech" icon="laptop" count={42} />
              <CategoryCard title="Home" icon="home" count={38} />
              <CategoryCard title="Kitchen" icon="utensils" count={29} />
              <CategoryCard title="Fitness" icon="dumbbell" count={24} />
              <CategoryCard title="Beauty" icon="sparkles" count={31} />
              <CategoryCard title="Travel" icon="plane" count={19} />
              <CategoryCard title="Pets" icon="paw" count={16} />
              <CategoryCard title="Office" icon="briefcase" count={22} />
              <CategoryCard title="Gaming" icon="gamepad" count={27} />
              <CategoryCard title="Outdoors" icon="mountain" count={18} />
              <CategoryCard title="Baby" icon="baby" count={14} />
              <CategoryCard title="Auto" icon="car" count={12} />
            </div>
            <div className="mt-6 flex justify-center sm:hidden">
              <Link href="/categories" passHref>
                <Button variant="outline" className="w-full sm:w-auto">
                  All categories
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Latest Reviews Section */}
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
              <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-blue-md">
                <Link href="/reviews/best-wireless-earbuds-2023" className="absolute inset-0 z-10">
                  <span className="sr-only">View Review</span>
                </Link>
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Best Wireless Earbuds"
                    width={600}
                    height={400}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/80 text-slate-dark backdrop-blur-sm">
                      <Clock className="mr-1 h-3 w-3" />3 days ago
                    </Badge>
                    <Badge variant="secondary" className="bg-white/80 text-slate-dark backdrop-blur-sm">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Popular
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Tech</span>
                    <span>•</span>
                    <span>Earbuds</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-slate-dark">
                    The 7 Best Wireless Earbuds for Every Budget (2023)
                  </h3>
                  <p className="mt-2 line-clamp-2 text-slate-default">
                    We tested 24 pairs of wireless earbuds to find the best options for sound quality, battery life,
                    comfort, and value.
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-blue-md">
                <Link href="/reviews/best-robot-vacuums-2023" className="absolute inset-0 z-10">
                  <span className="sr-only">View Review</span>
                </Link>
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Best Robot Vacuums"
                    width={600}
                    height={400}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/80 text-slate-dark backdrop-blur-sm">
                      <Clock className="mr-1 h-3 w-3" />1 week ago
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Home</span>
                    <span>•</span>
                    <span>Cleaning</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-slate-dark">
                    The 5 Best Robot Vacuums That Actually Work (2023)
                  </h3>
                  <p className="mt-2 line-clamp-2 text-slate-default">
                    After 100+ hours of testing, we've found the robot vacuums that navigate well, pick up the most
                    dirt, and offer the best value.
                  </p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:shadow-blue-md">
                <Link href="/reviews/best-air-fryers-2023" className="absolute inset-0 z-10">
                  <span className="sr-only">View Review</span>
                </Link>
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Best Air Fryers"
                    width={600}
                    height={400}
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/80 text-slate-dark backdrop-blur-sm">
                      <Clock className="mr-1 h-3 w-3" />2 weeks ago
                    </Badge>
                    <Badge variant="secondary" className="bg-white/80 text-slate-dark backdrop-blur-sm">
                      <TrendingUp className="mr-1 h-3 w-3" />
                      Trending
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Kitchen</span>
                    <span>•</span>
                    <span>Appliances</span>
                  </div>
                  <h3 className="mt-2 text-xl font-bold text-slate-dark">
                    The 6 Best Air Fryers for Crispy, Healthy Meals (2023)
                  </h3>
                  <p className="mt-2 line-clamp-2 text-slate-default">
                    We cooked 50+ meals to find the air fryers that cook evenly, are easy to use, and deliver the
                    crispiest results.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center sm:hidden">
              <Link href="/reviews" passHref>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-slate-200 text-slate-default hover:bg-aqua-light hover:text-coral-default"
                >
                  All reviews
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  )
}


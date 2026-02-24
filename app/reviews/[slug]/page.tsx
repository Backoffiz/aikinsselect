import Link from "next/link"
import Image from "next/image"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Breadcrumb } from "@/components/breadcrumb"
import { TableOfContents } from "@/components/table-of-contents"
import { ProductComparison } from "@/components/product-comparison"
import { ProductFeature } from "@/components/product-feature"
import { Newsletter } from "@/components/newsletter"
import { RelatedReviews } from "@/components/related-reviews"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Check, Info, ShoppingCart, Star, ThumbsUp } from "lucide-react"

export default function ReviewPage({ params }: { params: { slug: string } }) {
  // This would be fetched from a database or CMS in a real application
  const review = {
    title: "The 7 Best Wireless Earbuds for Every Budget (2023)",
    description:
      "We tested 24 pairs of wireless earbuds to find the best options for sound quality, battery life, comfort, and value.",
    category: "Tech",
    subcategory: "Earbuds",
    publishDate: "October 15, 2023",
    updateDate: "November 2, 2023",
    author: "Sarah Johnson",
    authorImage: "/placeholder.svg?height=100&width=100",
    heroImage: "/placeholder.svg?height=600&width=1200",
    winners: [
      {
        title: "Sony WF-1000XM4",
        subtitle: "Best Overall",
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.8,
        price: "$279.99",
        amazonUrl: "#",
        bestBuyUrl: "#",
        walmartUrl: "#",
        pros: [
          "Exceptional sound quality",
          "Best-in-class noise cancellation",
          "8-hour battery life",
          "Comfortable for extended wear",
        ],
        cons: ["Premium price", "Bulkier than some competitors"],
      },
      {
        title: "Apple AirPods Pro 2",
        subtitle: "Best for iPhone Users",
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.7,
        price: "$249.99",
        amazonUrl: "#",
        bestBuyUrl: "#",
        walmartUrl: "#",
        pros: [
          "Seamless iOS integration",
          "Excellent noise cancellation",
          "Spatial audio support",
          "Compact charging case",
        ],
        cons: ["Average battery life", "Limited functionality with Android"],
      },
      {
        title: "Anker Soundcore Liberty Air 2 Pro",
        subtitle: "Best Value",
        image: "/placeholder.svg?height=300&width=300",
        rating: 4.5,
        price: "$129.99",
        amazonUrl: "#",
        bestBuyUrl: "#",
        walmartUrl: "#",
        pros: [
          "Premium features at mid-range price",
          "Good noise cancellation",
          "Customizable EQ",
          "Multiple ear tip sizes",
        ],
        cons: ["Touch controls can be finicky", "App required for full functionality"],
      },
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted/30 py-6 md:py-10">
          <div className="container px-4 md:px-6">
            <Breadcrumb
              items={[
                { label: "Home", href: "/" },
                { label: "Reviews", href: "/reviews" },
                { label: "Tech", href: "/reviews/tech" },
                { label: "Earbuds", href: "/reviews/tech/earbuds" },
                { label: review.title, href: `/reviews/${params.slug}`, current: true },
              ]}
            />
            <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr] lg:gap-12">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/10">
                    {review.category}
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    {review.subcategory}
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10">
                    Updated {review.updateDate}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{review.title}</h1>
                <p className="text-xl text-muted-foreground">{review.description}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="relative h-10 w-10 overflow-hidden rounded-full">
                      <Image
                        src={review.authorImage || "/placeholder.svg"}
                        alt={review.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">By {review.author}</p>
                      <p className="text-xs text-muted-foreground">Published {review.publishDate}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <TableOfContents
                  items={[
                    { id: "winners", label: "Our Top Picks" },
                    { id: "how-we-tested", label: "How We Tested" },
                    { id: "comparison", label: "Product Comparison" },
                    { id: "best-overall", label: "Best Overall: Sony WF-1000XM4" },
                    { id: "best-iphone", label: "Best for iPhone: AirPods Pro 2" },
                    { id: "best-value", label: "Best Value: Anker Soundcore" },
                    { id: "other-options", label: "Other Good Options" },
                    { id: "buying-guide", label: "Buying Guide" },
                    { id: "faq", label: "Frequently Asked Questions" },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Hero Image */}
        <div className="container px-4 md:px-6 py-6">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={review.heroImage || "/placeholder.svg"}
              alt={review.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="container px-4 md:px-6 py-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:gap-16">
            <div className="space-y-10">
              {/* Winners Section */}
              <section id="winners" className="scroll-mt-20 space-y-6">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Our Top Picks</h2>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {review.winners.map((winner, index) => (
                    <div
                      key={index}
                      className="relative flex flex-col overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md"
                    >
                      <div className="absolute top-4 left-4 z-20">
                        <Badge className="bg-primary text-primary-foreground">{winner.subtitle}</Badge>
                      </div>
                      <div className="relative flex items-center justify-center bg-muted/50 p-6">
                        <Image
                          src={winner.image || "/placeholder.svg"}
                          alt={winner.title}
                          width={200}
                          height={200}
                          className="h-48 w-auto object-contain"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="mb-2 flex items-center">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(winner.rating) ? "fill-primary text-primary" : "fill-muted text-muted"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm font-medium">{winner.rating}</span>
                        </div>
                        <h3 className="text-xl font-bold">{winner.title}</h3>
                        <p className="mt-1 text-xl font-semibold text-primary">{winner.price}</p>
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-semibold">Pros:</h4>
                          <ul className="space-y-1">
                            {winner.pros.map((pro, i) => (
                              <li key={i} className="flex items-start text-sm">
                                <Check className="mr-2 h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-semibold">Cons:</h4>
                          <ul className="space-y-1">
                            {winner.cons.map((con, i) => (
                              <li key={i} className="flex items-start text-sm text-muted-foreground">
                                <span className="mr-2 flex h-4 w-4 items-center justify-center text-red-500">—</span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-6 space-y-2">
                          <Button className="w-full gap-1.5">
                            <ShoppingCart className="h-4 w-4" />
                            View on Amazon
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              Best Buy
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1 text-xs">
                              Walmart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* How We Tested */}
              <section id="how-we-tested" className="scroll-mt-20 space-y-6">
                <div className="flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">How We Tested</h2>
                </div>
                <div className="rounded-lg border bg-muted/20 p-6">
                  <p className="mb-4 text-muted-foreground">
                    Our testing process is thorough and objective, focusing on real-world usage scenarios to help you
                    make informed decisions.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-md bg-background p-4 text-center">
                      <p className="font-semibold">24</p>
                      <p className="text-sm text-muted-foreground">Products Tested</p>
                    </div>
                    <div className="rounded-md bg-background p-4 text-center">
                      <p className="font-semibold">80+</p>
                      <p className="text-sm text-muted-foreground">Hours of Testing</p>
                    </div>
                    <div className="rounded-md bg-background p-4 text-center">
                      <p className="font-semibold">5</p>
                      <p className="text-sm text-muted-foreground">Expert Reviewers</p>
                    </div>
                    <div className="rounded-md bg-background p-4 text-center">
                      <p className="font-semibold">12</p>
                      <p className="text-sm text-muted-foreground">Key Metrics</p>
                    </div>
                  </div>
                </div>
                <p>
                  We evaluated each pair of wireless earbuds based on sound quality, noise cancellation effectiveness,
                  comfort during extended wear, battery life, connectivity reliability, call quality, and overall value.
                  Our testing included:
                </p>
                <ul className="ml-6 list-disc space-y-2">
                  <li>Listening tests with various music genres to assess audio quality</li>
                  <li>
                    Noise cancellation tests in different environments (office, street, airplane cabin simulation)
                  </li>
                  <li>Comfort assessments during 4+ hour wearing sessions</li>
                  <li>Battery drain tests at various volume levels</li>
                  <li>Connection stability tests at different distances from the source device</li>
                  <li>Call quality evaluations in quiet and noisy environments</li>
                </ul>
              </section>

              {/* Product Comparison */}
              <section id="comparison" className="scroll-mt-20 space-y-6">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Product Comparison</h2>
                </div>
                <ProductComparison
                  products={[
                    {
                      name: "Sony WF-1000XM4",
                      image: "/placeholder.svg?height=100&width=100",
                      price: "$279.99",
                      rating: 4.8,
                      soundQuality: 5,
                      noiseCancellation: 5,
                      batteryLife: 4,
                      comfort: 4,
                      features: 5,
                    },
                    {
                      name: "Apple AirPods Pro 2",
                      image: "/placeholder.svg?height=100&width=100",
                      price: "$249.99",
                      rating: 4.7,
                      soundQuality: 4,
                      noiseCancellation: 5,
                      batteryLife: 3,
                      comfort: 5,
                      features: 5,
                    },
                    {
                      name: "Anker Soundcore Liberty Air 2 Pro",
                      image: "/placeholder.svg?height=100&width=100",
                      price: "$129.99",
                      rating: 4.5,
                      soundQuality: 4,
                      noiseCancellation: 3,
                      batteryLife: 4,
                      comfort: 4,
                      features: 4,
                    },
                  ]}
                />
              </section>

              {/* Best Overall */}
              <section id="best-overall" className="scroll-mt-20 space-y-6">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Best Overall: Sony WF-1000XM4</h2>
                </div>
                <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                  <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6">
                    <Image
                      src="/placeholder.svg?height=300&width=300"
                      alt="Sony WF-1000XM4"
                      width={200}
                      height={200}
                      className="h-48 w-auto object-contain"
                    />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < 5 ? "fill-primary text-primary" : "fill-muted text-muted"}`}
                        />
                      ))}
                      <span className="ml-2 font-medium">4.8</span>
                    </div>
                    <p className="text-2xl font-semibold text-primary">$279.99</p>
                    <Button className="w-full gap-1.5">
                      <ShoppingCart className="h-4 w-4" />
                      View on Amazon
                    </Button>
                    <div className="flex w-full gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Best Buy
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Walmart
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p>
                      The Sony WF-1000XM4 earbuds stand out as our top pick due to their exceptional combination of
                      sound quality, noise cancellation, and battery life. These premium earbuds deliver an audio
                      experience that's hard to match in the wireless earbud market.
                    </p>
                    <Tabs defaultValue="features">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="features">Key Features</TabsTrigger>
                        <TabsTrigger value="pros">Pros</TabsTrigger>
                        <TabsTrigger value="cons">Cons</TabsTrigger>
                      </TabsList>
                      <TabsContent value="features" className="space-y-4 pt-4">
                        <ProductFeature
                          title="Industry-Leading Noise Cancellation"
                          description="Sony's proprietary V1 processor and dual noise sensor microphones work together to block out more ambient noise than previous generations."
                        />
                        <ProductFeature
                          title="Exceptional Sound Quality"
                          description="8mm drivers with high compliance diaphragms deliver rich, clear sound with powerful bass and detailed highs."
                        />
                        <ProductFeature
                          title="LDAC Codec Support"
                          description="Supports Sony's LDAC codec for high-resolution audio transmission at up to 990kbps (with compatible devices)."
                        />
                        <ProductFeature
                          title="Impressive Battery Life"
                          description="Up to 8 hours of playback with ANC on, and an additional 16 hours with the charging case."
                        />
                      </TabsContent>
                      <TabsContent value="pros" className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Exceptional sound quality with detailed audio across all frequencies</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Best-in-class noise cancellation that adapts to your environment</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Impressive 8-hour battery life with ANC enabled</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Comfortable foam ear tips that create an excellent seal</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Speak-to-chat feature automatically pauses music when you speak</span>
                          </li>
                        </ul>
                      </TabsContent>
                      <TabsContent value="cons" className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start text-muted-foreground">
                            <span className="mr-2 flex h-5 w-5 items-center justify-center text-red-500">—</span>
                            <span>Premium price point may be prohibitive for some buyers</span>
                          </li>
                          <li className="flex items-start text-muted-foreground">
                            <span className="mr-2 flex h-5 w-5 items-center justify-center text-red-500">—</span>
                            <span>Bulkier than some competitors like the AirPods Pro</span>
                          </li>
                          <li className="flex items-start text-muted-foreground">
                            <span className="mr-2 flex h-5 w-5 items-center justify-center text-red-500">—</span>
                            <span>Touch controls can be finicky and take time to master</span>
                          </li>
                        </ul>
                      </TabsContent>
                    </Tabs>
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="font-medium">Who should buy the Sony WF-1000XM4?</p>
                      <p className="mt-2 text-muted-foreground">
                        These earbuds are ideal for audiophiles who prioritize sound quality and effective noise
                        cancellation. They're perfect for frequent travelers, commuters, and anyone who wants premium
                        audio in a portable package. If you're willing to invest in top-tier sound quality and features,
                        these are the earbuds to get.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Best for iPhone */}
              <section id="best-iphone" className="scroll-mt-20 space-y-6">
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                    Best for iPhone: Apple AirPods Pro 2
                  </h2>
                </div>
                <div className="grid gap-6 md:grid-cols-[300px_1fr]">
                  <div className="flex flex-col items-center space-y-4 rounded-lg border bg-background p-6">
                    <Image
                      src="/placeholder.svg?height=300&width=300"
                      alt="Apple AirPods Pro 2"
                      width={200}
                      height={200}
                      className="h-48 w-auto object-contain"
                    />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < 4 ? "fill-primary text-primary" : i < 5 ? "fill-primary text-primary opacity-50" : "fill-muted text-muted"}`}
                        />
                      ))}
                      <span className="ml-2 font-medium">4.7</span>
                    </div>
                    <p className="text-2xl font-semibold text-primary">$249.99</p>
                    <Button className="w-full gap-1.5">
                      <ShoppingCart className="h-4 w-4" />
                      View on Amazon
                    </Button>
                    <div className="flex w-full gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Best Buy
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Apple Store
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p>
                      For iPhone users, the Apple AirPods Pro 2 offer the most seamless and integrated experience
                      possible. With significant improvements over the original AirPods Pro, these earbuds deliver
                      excellent sound quality, improved noise cancellation, and the convenience of the Apple ecosystem.
                    </p>
                    <Tabs defaultValue="features">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="features">Key Features</TabsTrigger>
                        <TabsTrigger value="pros">Pros</TabsTrigger>
                        <TabsTrigger value="cons">Cons</TabsTrigger>
                      </TabsList>
                      <TabsContent value="features" className="space-y-4 pt-4">
                        <ProductFeature
                          title="H2 Chip"
                          description="Apple's new H2 chip powers improved noise cancellation, better battery efficiency, and enhanced sound quality."
                        />
                        <ProductFeature
                          title="Personalized Spatial Audio"
                          description="Creates an immersive, theater-like sound experience that adapts to your head movements and ear shape."
                        />
                        <ProductFeature
                          title="Adaptive Transparency Mode"
                          description="Lets in outside sounds when needed but reduces loud noises like sirens or construction."
                        />
                        <ProductFeature
                          title="Touch Controls with Volume Adjustment"
                          description="Swipe up or down on the stem to adjust volume, a feature missing from the original AirPods Pro."
                        />
                      </TabsContent>
                      <TabsContent value="pros" className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Seamless integration with Apple devices</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Significantly improved noise cancellation over the first generation</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Spatial audio creates an immersive listening experience</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Compact, lightweight design with excellent comfort</span>
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                            <span>Find My integration helps locate lost earbuds</span>
                          </li>
                        </ul>
                      </TabsContent>
                      <TabsContent value="cons" className="pt-4">
                        <ul className="space-y-2">
                          <li className="flex items-start text-muted-foreground">
                            <span className="mr-2 flex h-5 w-5 items-center justify-center text-red-500">—</span>
                            <span>Battery life is average at 6 hours (30 hours with case)</span>
                          </li>
                          <li className="flex items-start text-muted-foreground">
                            <span className="mr-2 flex h-5 w-5 items-center justify-center text-red-500">—</span>
                            <span>Limited functionality with Android devices</span>
                          </li>
                          <li className="flex items-start text-muted-foreground">
                            <span className="mr-2 flex h-5 w-5 items-center justify-center text-red-500">—</span>
                            <span>No high-resolution audio codec support</span>
                          </li>
                        </ul>
                      </TabsContent>
                    </Tabs>
                    <div className="rounded-lg bg-muted/30 p-4">
                      <p className="font-medium">Who should buy the Apple AirPods Pro 2?</p>
                      <p className="mt-2 text-muted-foreground">
                        These earbuds are the perfect choice for iPhone, iPad, and Mac users who want the most
                        integrated audio experience possible. If you're already in the Apple ecosystem and value
                        features like automatic device switching, spatial audio, and Find My integration, the AirPods
                        Pro 2 are worth the investment.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section id="faq" className="scroll-mt-20 space-y-6">
                <div className="flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Frequently Asked Questions</h2>
                </div>
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">Are wireless earbuds worth it compared to wired options?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Wireless earbuds offer convenience and freedom of movement that wired earbuds can't match. While
                      audiophiles might still prefer wired options for critical listening, today's premium wireless
                      earbuds deliver excellent sound quality that satisfies most listeners. The convenience of no wires
                      typically outweighs any minor sound quality differences for everyday use.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">How long do wireless earbuds typically last?</h3>
                    <p className="mt-2 text-muted-foreground">
                      With regular use, you can expect wireless earbuds to last 2-3 years before the battery life begins
                      to noticeably degrade. Premium models may last longer with proper care. The battery in the earbuds
                      will typically degrade faster than the charging case battery due to more frequent charging cycles.
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold">Are noise-cancelling earbuds safe for your hearing?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Active noise cancellation (ANC) is safe for your hearing and can actually be beneficial by
                      allowing you to listen at lower volumes in noisy environments. However, be cautious about using
                      ANC in situations where you need to be aware of your surroundings, such as walking near traffic.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-20">
                <div className="hidden lg:block">
                  <div className="rounded-lg border bg-background p-4">
                    <h3 className="mb-4 font-semibold">Quick Links</h3>
                    <ul className="space-y-2">
                      <li>
                        <Link href="#winners" className="text-sm text-muted-foreground hover:text-foreground">
                          Our Top Picks
                        </Link>
                      </li>
                      <li>
                        <Link href="#how-we-tested" className="text-sm text-muted-foreground hover:text-foreground">
                          How We Tested
                        </Link>
                      </li>
                      <li>
                        <Link href="#comparison" className="text-sm text-muted-foreground hover:text-foreground">
                          Product Comparison
                        </Link>
                      </li>
                      <li>
                        <Link href="#best-overall" className="text-sm text-muted-foreground hover:text-foreground">
                          Best Overall: Sony WF-1000XM4
                        </Link>
                      </li>
                      <li>
                        <Link href="#best-iphone" className="text-sm text-muted-foreground hover:text-foreground">
                          Best for iPhone: AirPods Pro 2
                        </Link>
                      </li>
                      <li>
                        <Link href="#best-value" className="text-sm text-muted-foreground hover:text-foreground">
                          Best Value: Anker Soundcore
                        </Link>
                      </li>
                      <li>
                        <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground">
                          Frequently Asked Questions
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border bg-background p-4">
                  <h3 className="mb-4 font-semibold">Related Reviews</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="Best Noise Cancelling Headphones"
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <Link href="#" className="line-clamp-2 font-medium hover:underline">
                          The Best Noise Cancelling Headphones for 2023
                        </Link>
                        <p className="text-xs text-muted-foreground">Updated 2 weeks ago</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="Best Bluetooth Speakers"
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <Link href="#" className="line-clamp-2 font-medium hover:underline">
                          The 5 Best Bluetooth Speakers for Every Budget
                        </Link>
                        <p className="text-xs text-muted-foreground">Updated 1 month ago</p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src="/placeholder.svg?height=100&width=100"
                          alt="Best Smart Speakers"
                          width={100}
                          height={100}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <Link href="#" className="line-clamp-2 font-medium hover:underline">
                          Smart Speakers Compared: Amazon Echo vs. Google Nest vs. Apple HomePod
                        </Link>
                        <p className="text-xs text-muted-foreground">Updated 3 weeks ago</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 rounded-lg border bg-background p-4">
                  <h3 className="mb-4 font-semibold">Popular Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link href="#" className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80">
                      Headphones
                    </Link>
                    <Link href="#" className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80">
                      Smartphones
                    </Link>
                    <Link href="#" className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80">
                      Laptops
                    </Link>
                    <Link href="#" className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80">
                      TVs
                    </Link>
                    <Link href="#" className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80">
                      Smart Home
                    </Link>
                    <Link href="#" className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80">
                      Kitchen
                    </Link>
                    <Link href="#" className="rounded-full bg-muted px-3 py-1 text-xs font-medium hover:bg-muted/80">
                      Fitness
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Reviews */}
        <RelatedReviews />

        {/* Newsletter */}
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  )
}


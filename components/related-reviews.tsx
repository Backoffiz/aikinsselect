import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function RelatedReviews() {
  return (
    <section className="py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Related Reviews</h2>
            <p className="text-muted-foreground">You might also be interested in these reviews</p>
          </div>
          <Link href="/reviews" className="hidden sm:flex items-center text-primary font-medium">
            View all reviews
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md">
            <Link href="/reviews/best-noise-cancelling-headphones-2023" className="absolute inset-0 z-10">
              <span className="sr-only">View Review</span>
            </Link>
            <div className="relative aspect-video overflow-hidden">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Best Noise Cancelling Headphones"
                width={600}
                height={400}
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Tech</span>
                <span>•</span>
                <span>Headphones</span>
              </div>
              <h3 className="mt-2 text-xl font-bold">The Best Noise Cancelling Headphones for 2023</h3>
              <p className="mt-2 line-clamp-2 text-muted-foreground">
                We tested 18 pairs of noise cancelling headphones to find the best options for travel, work, and
                everyday use.
              </p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md">
            <Link href="/reviews/best-bluetooth-speakers-2023" className="absolute inset-0 z-10">
              <span className="sr-only">View Review</span>
            </Link>
            <div className="relative aspect-video overflow-hidden">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Best Bluetooth Speakers"
                width={600}
                height={400}
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Tech</span>
                <span>•</span>
                <span>Speakers</span>
              </div>
              <h3 className="mt-2 text-xl font-bold">The 5 Best Bluetooth Speakers for Every Budget</h3>
              <p className="mt-2 line-clamp-2 text-muted-foreground">
                From portable options to premium sound, we've found the best Bluetooth speakers for every situation.
              </p>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-lg border bg-background transition-all hover:shadow-md">
            <Link href="/reviews/best-smart-speakers-2023" className="absolute inset-0 z-10">
              <span className="sr-only">View Review</span>
            </Link>
            <div className="relative aspect-video overflow-hidden">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Best Smart Speakers"
                width={600}
                height={400}
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Tech</span>
                <span>•</span>
                <span>Smart Home</span>
              </div>
              <h3 className="mt-2 text-xl font-bold">
                Smart Speakers Compared: Amazon Echo vs. Google Nest vs. Apple HomePod
              </h3>
              <p className="mt-2 line-clamp-2 text-muted-foreground">
                We compare the top smart speakers to help you find the best one for your home and ecosystem.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/reviews" passHref>
            <Button variant="outline" className="w-full sm:w-auto">
              View all reviews
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}


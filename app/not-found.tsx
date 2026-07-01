import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="hero-glow flex flex-1 items-center justify-center">
        <div className="px-4 text-center">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">Error 404</p>
          <h1 className="mb-4 font-serif text-7xl font-medium tracking-tight text-brand md:text-8xl">404</h1>
          <h2 className="mb-3 font-serif text-2xl font-medium tracking-tight text-ink md:text-3xl">Page Not Found</h2>
          <p className="mb-8 text-muted-ink">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
            <Button asChild size="lg">
              <Link href="/">Go Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/reviews">Browse Reviews</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

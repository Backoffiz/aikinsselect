import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="mb-4 font-serif text-7xl md:text-8xl font-medium tracking-tight text-brand">404</h1>
          <h2 className="mb-3 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">Page Not Found</h2>
          <p className="mb-8 text-muted-ink">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <div className="flex gap-4 justify-center">
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

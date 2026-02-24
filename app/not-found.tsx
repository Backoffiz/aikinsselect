import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-6xl font-bold text-violet-600 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
          <p className="text-slate-600 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/" className="px-6 py-3 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-700 transition-colors">
              Go Home
            </Link>
            <Link href="/reviews" className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
              Browse Reviews
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SavedClient } from '@/components/saved/saved-client'
import { FEATURES } from '@/lib/flags'

export const metadata: Metadata = {
  title: 'Saved items',
  description: 'Your saved products and lists on Aikins Select.',
  robots: { index: false, follow: false },
}

export default function SavedPage() {
  // Feature gated off until the saved-list backend ships — hide the route entirely.
  if (!FEATURES.saved) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1">
        <SavedClient />
      </main>
      <SiteFooter />
    </div>
  )
}

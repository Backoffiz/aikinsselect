import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { SavedClient } from '@/components/saved/saved-client'

export const metadata: Metadata = {
  title: 'Saved items',
  description: 'Your saved products and lists on Aikins Select.',
  robots: { index: false, follow: false },
}

export default function SavedPage() {
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

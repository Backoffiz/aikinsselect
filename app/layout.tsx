import type { Metadata } from 'next'
import { Newsreader, Public_Sans } from 'next/font/google'
import './globals.css'
import { SavedProvider } from '@/components/providers/saved-provider'
import { Toaster } from '@/components/ui/sonner'

const serif = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-newsreader',
  display: 'swap',
})
const sans = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-public-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Aikins Select — Expert Product Reviews, Simplified',
    template: '%s | Aikins Select',
  },
  description: 'We cross-reference Wirecutter, RTINGS, and Reddit to find the products that actually deliver. No fluff, just honest picks.',
  metadataBase: new URL('https://aikinsselect.com'),
  openGraph: {
    title: 'Aikins Select — Expert Product Reviews, Simplified',
    description: 'We cross-reference Wirecutter, RTINGS, and Reddit to find the products that actually deliver.',
    siteName: 'Aikins Select',
    locale: 'en_US',
    type: 'website',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Aikins Select - Expert Product Reviews' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aikins Select — Expert Product Reviews',
    description: 'We cross-reference Wirecutter, RTINGS, and Reddit to find the products that actually deliver.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body className="font-sans antialiased bg-paper text-body">
        <SavedProvider>{children}</SavedProvider>
        <Toaster />
      </body>
    </html>
  )
}

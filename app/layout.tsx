import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ["latin"] })

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
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aikins Select',
    description: 'Expert Product Reviews, Simplified',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

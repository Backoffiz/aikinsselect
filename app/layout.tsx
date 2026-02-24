import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}

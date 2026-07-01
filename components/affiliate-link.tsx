'use client'

import type { ReactNode, MouseEvent } from 'react'

type AffiliateLinkProps = {
  href: string
  /** Product being clicked (D1 product id). */
  productId?: string | null
  /** Review/guide the click happened on, when applicable (review slug or id). */
  guideId?: string | null
  /** Merchant the link points to. Defaults to Amazon (our only program today). */
  merchant?: string
  /** On-page placement — must match the LOCATIONS whitelist in app/api/click/route.ts. */
  location: string
  className?: string
  children: ReactNode
}

/**
 * Outbound affiliate link that records a first-party click event (T5) before navigating.
 *
 * Uses navigator.sendBeacon: the POST is queued instantly and survives the page unload,
 * so it never delays or blocks the click through to the merchant. Fully fire-and-forget —
 * if the beacon is blocked (privacy extension) or fails, the link still works normally.
 */
export function AffiliateLink({
  href,
  productId,
  guideId,
  merchant = 'amazon',
  location,
  className,
  children,
}: AffiliateLinkProps) {
  const track = (_e: MouseEvent<HTMLAnchorElement>) => {
    try {
      const payload = JSON.stringify({
        product_id: productId ?? null,
        guide_id: guideId ?? null,
        merchant,
        button_location: location,
        page_url: typeof window !== 'undefined' ? window.location.pathname : null,
      })
      navigator.sendBeacon?.('/api/click', new Blob([payload], { type: 'application/json' }))
    } catch {
      // never block the click on a tracking failure
    }
  }

  return (
    <a href={href} target="_blank" rel="noopener sponsored nofollow" className={className} onClick={track}>
      {children}
    </a>
  )
}

export const runtime = 'edge'

import { recordAffiliateClick } from '@/lib/db'

// Whitelist of on-page placements. Anything else is coerced to 'unknown' so the
// enum stays clean for GROUP BY reporting and a spoofed payload can't pollute it.
const LOCATIONS = new Set([
  'top_comparison_table',
  'product_card',
  'sticky_mobile_cta',
  'product_page_primary',
  'product_page_merchant',
  'review_sidebar',
  'hero_featured_offer',
  'quiz_result',
  'gift_guide_card',
  'category_card',
  'inline_cta',
])

const clip = (v: unknown, n: number): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, n) : null

/**
 * T5 click-tracking ingest. Receives a navigator.sendBeacon POST fired the instant
 * a buy button is clicked, writes one row to affiliate_clicks, and returns 204.
 * Best-effort by design: it never throws and never makes the user wait — a failure
 * here must never affect the outbound click, which has already navigated.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    const ua = req.headers.get('user-agent') || ''
    // Drop bots / prefetchers so the funnel reflects real humans.
    if (!ua || /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|facebookexternalhit/i.test(ua)) {
      return new Response(null, { status: 204 })
    }

    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null
    if (!body || typeof body !== 'object') return new Response(null, { status: 204 })

    const loc = LOCATIONS.has(body.button_location as string) ? (body.button_location as string) : 'unknown'
    const device = /mobile/i.test(ua) ? 'mobile' : /tablet|ipad/i.test(ua) ? 'tablet' : 'desktop'
    const country = req.headers.get('cf-ipcountry') // Cloudflare sets this on every request — free geo

    await recordAffiliateClick({
      product_id: clip(body.product_id, 64),
      guide_id: clip(body.guide_id, 64),
      merchant: clip(body.merchant, 32) || 'amazon',
      button_location: loc,
      page_url: clip(body.page_url, 300),
      device_type: device,
      country: country && country !== 'XX' ? country.slice(0, 2) : null,
    })
  } catch {
    // analytics must never surface an error — swallow and 204
  }
  return new Response(null, { status: 204 })
}

import { SITE_URL } from './seo'

/**
 * Append UTM campaign params to a URL so traffic from a share is attributable in analytics
 * even when the referrer is stripped (native/app shares, messaging apps, email). Idempotent:
 * re-tagging overwrites rather than duplicates.
 */
export function withUtm(url: string, source: string, medium = 'social', campaign = 'share'): string {
  const u = new URL(url, SITE_URL)
  u.searchParams.set('utm_source', source)
  u.searchParams.set('utm_medium', medium)
  u.searchParams.set('utm_campaign', campaign)
  return u.toString()
}

export type ShareTarget = { key: string; label: string; href: string }

/**
 * Platform share-intent URLs, each pointing at the page with a UTM tag naming that platform
 * (utm_source=x|facebook|reddit|whatsapp|email). So a click that comes back from a Reddit
 * share shows up as reddit/social/share, not "direct".
 */
export function shareTargets(pageUrl: string, title: string): ShareTarget[] {
  const t = encodeURIComponent(title)
  const link = (src: string, medium = 'social') => encodeURIComponent(withUtm(pageUrl, src, medium))
  return [
    { key: 'x', label: 'X', href: `https://twitter.com/intent/tweet?text=${t}&url=${link('x')}` },
    { key: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${link('facebook')}` },
    { key: 'reddit', label: 'Reddit', href: `https://www.reddit.com/submit?title=${t}&url=${link('reddit')}` },
    {
      key: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${title} ${withUtm(pageUrl, 'whatsapp', 'social')}`)}`,
    },
    {
      key: 'email',
      label: 'Email',
      href: `mailto:?subject=${t}&body=${encodeURIComponent(`${title}\n\n${withUtm(pageUrl, 'email', 'email')}`)}`,
    },
  ]
}

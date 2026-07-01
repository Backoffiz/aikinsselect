import { Headphones, ArrowRight } from 'lucide-react'
import { AffiliateLink } from '@/components/affiliate-link'
import { AUDIBLE_OFFER } from '@/lib/curation'

/**
 * Hero "Featured offer" bounty tile (Audible). Sits beneath the Editor's Choice card.
 * A labeled affiliate offer — not a paid placement — with a click-tracked CTA.
 */
export function FeaturedOffer() {
  const o = AUDIBLE_OFFER
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink text-paper shadow-card-lift">
      <div className="flex items-center gap-4 p-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/20 text-brand-on-dark">
          <Headphones className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-paper/55">{o.eyebrow}</p>
          <h3 className="mt-0.5 font-serif text-[18px] font-medium leading-tight text-paper">{o.title}</h3>
          <p className="mt-1 text-[13px] leading-snug text-paper/70">{o.blurb}</p>
        </div>
      </div>
      <div className="px-5 pb-5">
        <AffiliateLink
          href={o.url}
          merchant="audible"
          location="hero_featured_offer"
          className="flex items-center justify-center gap-2 rounded-lg bg-brand py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-hover"
        >
          {o.cta} <ArrowRight className="h-4 w-4" />
        </AffiliateLink>
        <p className="mt-2 text-center text-[11px] text-paper/45">Affiliate offer — we may earn a commission.</p>
      </div>
    </div>
  )
}

/**
 * Homepage curation — hand-picked, not algorithmic.
 *
 * The hero "Editor's Choice" and the featured bounty offer are deliberately chosen
 * here (in source) rather than derived from a DB flag, because every review currently
 * carries is_featured=1 (the flag is meaningless) and "newest published" is not the
 * same as "most compelling." Change these lists to re-curate — no migration needed.
 */

/** Hero flagship guide. First slug that resolves to a published review wins; if none
 *  match, getFeaturedReview() falls back to the newest published review. */
export const HERO_REVIEW_CANDIDATES = [
  'best-espresso-machine',      // Kitchen — aspirational imagery, 4.5% commission band
  'best-robot-vacuum',          // Home — mass appeal
  'best-wireless-earbuds',      // Tech — high traffic
  'best-noise-cancelling-headphones',
  'best-air-fryer',
]

/**
 * Audible bounty tile in the hero. REPLACE `url` with the exact bounty creative link
 * from Associates Central → Promotions/Bounties (or SiteStripe on the Audible trial
 * page) so the bounty actually attributes — this default is a reasonable placeholder,
 * not a guaranteed-tracking link.
 */
export const AUDIBLE_OFFER = {
  url: 'https://www.amazon.com/hz/audible/mlp?tag=aikinsselect-20',
  eyebrow: 'Featured offer',
  title: 'Try Audible free',
  blurb: 'Start a free trial — your first audiobook is on us.',
  cta: 'Start free trial',
}

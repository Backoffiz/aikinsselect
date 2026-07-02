export const runtime = 'edge'

import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Newsletter } from "@/components/newsletter"
import { Reveal } from "@/components/ui/reveal"
import { StickyBuyBar } from "@/components/product/sticky-buy-bar"
import { AffiliateLink } from "@/components/affiliate-link"
import { ShareButtons } from "@/components/share-buttons"
import { ArrowLeft, ArrowRight, Shield, Activity, ChevronRight, ThumbsUp, AlertTriangle, Zap, Target } from "lucide-react"
import { getReviewBySlug, getProductsForReview, getPublishedReviews } from "@/lib/db"
import { FEATURES } from "@/lib/flags"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { JsonLd } from "@/components/seo/json-ld"
import { jsonLdGraph, organizationNode, editorialTeamNode, breadcrumbNode, itemListNode, articleNode, SITE_URL, SITE_NAME } from "@/lib/seo"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const review = await getReviewBySlug(slug)
  if (!review) return { title: 'Review Not Found' }
  const description = review.subtitle || `${review.title} - Expert review by Aikins Select`
  const ogImage = review.category_slug ? `/categories/${review.category_slug}.jpg` : '/og-image.jpg'
  const canonical = `/reviews/${slug}`
  const published = review.published_at ? new Date(review.published_at) : null
  const publishedTime = published && !isNaN(published.getTime()) ? published.toISOString() : undefined
  return {
    title: review.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      title: review.title,
      description,
      url: canonical,
      images: [{ url: ogImage }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: review.title, description, images: [ogImage] },
  }
}

function parseProsConsJSON(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try { return JSON.parse(val) } catch { return [] }
}

// D1 stores datetimes as 'YYYY-MM-DD HH:MM:SS'; normalize before formatting so the
// "Updated <month year>" freshness signal renders consistently.
function fmtMonthYear(v: any): string | null {
  if (!v) return null
  const d = new Date(String(v).replace(' ', 'T'))
  return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function renderEditorialContent(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let skipUntilNextH2 = false
  let inTable = false
  let inProsCons = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith('|') && line.endsWith('|')) {
      if (/^\|[\s\-:|]+\|$/.test(line)) continue
      inTable = true
      continue
    }
    if (inTable && (!line.startsWith('|'))) inTable = false

    if (/^###\s*(What We Like|What Could Be Better|Pros|Cons)/i.test(line)) {
      inProsCons = true
      continue
    }
    if (inProsCons) {
      if (line.startsWith('-') || line === '') continue
      if (line.startsWith('#')) inProsCons = false
      else continue
    }

    if (/^##.*Top Picks at a Glance/i.test(line)) {
      skipUntilNextH2 = true
      continue
    }
    if (skipUntilNextH2) {
      if (line.startsWith('## ') && !/Top Picks/i.test(line)) skipUntilNextH2 = false
      else continue
    }

    if (/^##\s*(Best Overall|Runner-Up|Budget Pick|Premium Pick|Best Value|Most Popular|Also Great):/i.test(line)) {
      skipUntilNextH2 = true
      continue
    }

    if (/^##.*Reddit Says/i.test(line)) {
      result.push('## What Real Users Say')
      continue
    }
    if (/^Reddit:\s*r\//i.test(line)) {
      const cleaned = line.replace(/^Reddit:\s*r\/\w+\s*on Reddit:\s*/i, '').trim()
      if (cleaned.length > 10) {
        result.push(`> "${cleaned}"`)
        result.push('> — Community discussion')
      }
      continue
    }

    result.push(lines[i])
  }

  return result.join('\n')
    .replace(/^### (.*$)/gim, '<h3 class="font-serif text-[23px] font-medium text-ink mt-14 mb-5 tracking-tight leading-tight">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="font-serif text-[30px] font-medium text-ink mt-16 mb-6 pb-5 border-b border-hairline tracking-tight leading-tight">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-ink">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-body leading-[1.9] py-0.5 text-[16.5px]">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-5 list-decimal text-body leading-[1.9] py-0.5 text-[16.5px]">$2</li>')
    .replace(/^>\s*(.*)$/gim, '<blockquote class="border-l-2 border-brand/40 pl-5 my-6 text-[16px] text-muted-ink italic leading-relaxed">$1</blockquote>')
    .replace(/\n\n/g, '</p><p class="text-body leading-[1.95] mb-6 text-[17px]">')
    .replace(/^(?!<[hlu])/gm, '')
}

// Award labels are PRICE-AWARE (mirrors scraper/lib/scoring.ts). Products arrive
// ordered by rank ascending. Rank #1 = Best Overall; the cheapest of the rest =
// Budget Pick; the priciest = Premium Pick; #2 = Runner-Up; everything else = Also
// Great. Keyed by product id so every render site agrees, and so "Budget Pick"
// always lands on the genuinely cheapest contender — never just the 5th in the list.
function buildAwardLabels(products: any[]): Record<string, string> {
  const labels: Record<string, string> = {}
  if (products.length === 0) return labels

  const [best, ...rest] = products
  labels[best.id] = 'Best Overall'

  const priced = rest.filter((p) => Number(p.price) > 0)
  if (priced.length) {
    const cheapest = priced.reduce((a, b) => (Number(a.price) <= Number(b.price) ? a : b))
    const dearest = priced.reduce((a, b) => (Number(a.price) >= Number(b.price) ? a : b))
    labels[cheapest.id] = 'Budget Pick'
    if (dearest.id !== cheapest.id) labels[dearest.id] = 'Premium Pick'
  }

  if (rest[0] && !labels[rest[0].id]) labels[rest[0].id] = 'Runner-Up'
  for (const p of rest) if (!labels[p.id]) labels[p.id] = 'Also Great'

  return labels
}

export default async function ReviewPage({ params }: Props) {
  const { slug } = await params
  const [review, products, relatedReviews] = await Promise.all([
    getReviewBySlug(slug),
    getProductsForReview(slug),
    getPublishedReviews(4),
  ])

  if (!review) notFound()

  const related = relatedReviews.filter((r: any) => r.slug !== slug).slice(0, 3)
  const topThree = products.slice(0, 3)
  const awardLabels = buildAwardLabels(products)

  // Mobile sticky CTA for the #1 pick — desktop keeps the sticky sidebar instead.
  const topPick = products[0]
  const topPickPrice = topPick?.price ? `$${Number(topPick.price).toFixed(2)}` : 'Check price'
  const topPickItem = topPick
    ? { id: topPick.id, name: topPick.name, price: topPickPrice, sub: review.category_name, slug: topPick.slug, image: topPick.image_url }
    : null

  const canonicalPath = `/reviews/${slug}`
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Reviews', url: '/reviews' },
    ...(review.category_name && review.category_slug
      ? [{ name: review.category_name, url: `/categories/${review.category_slug}` }]
      : []),
    { name: review.title, url: canonicalPath },
  ]
  // Freshness signal — prefer the last content update over first publish.
  const updatedLabel = fmtMonthYear(review.updated_at) || fmtMonthYear(review.published_at)
  const guideImage =
    review.hero_image ||
    products[0]?.image_url ||
    (review.category_slug ? `/categories/${review.category_slug}.jpg` : undefined)

  const structuredData = jsonLdGraph([
    organizationNode(),
    editorialTeamNode(),
    breadcrumbNode(breadcrumbItems),
    // Article node carries organizational authorship + publish/modified dates (E-E-A-T + freshness).
    articleNode({
      headline: review.title,
      description: review.subtitle || review.excerpt,
      url: canonicalPath,
      datePublished: review.published_at,
      dateModified: review.updated_at || review.published_at,
      image: guideImage,
      section: review.category_name,
    }),
    products.length > 0 ? itemListNode(products, { name: review.title, url: canonicalPath }) : null,
  ])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main className="flex-1">

        {/* HERO */}
        <section className="border-b border-hairline bg-white">
          <div className="mx-auto max-w-7xl px-5 pb-14 pt-8 sm:px-8 md:pb-20 md:pt-10 lg:px-12">
            <nav className="mb-10 flex items-center gap-2.5 text-[13px] font-medium text-faint">
              <Link href="/" className="transition-colors hover:text-brand">Home</Link>
              <ChevronRight className="h-3 w-3 text-card-edge" />
              <Link href="/reviews" className="transition-colors hover:text-brand">Reviews</Link>
              {review.category_name && (
                <>
                  <ChevronRight className="h-3 w-3 text-card-edge" />
                  <Link href={`/categories/${review.category_slug}`} className="transition-colors hover:text-brand">
                    {review.category_name}
                  </Link>
                </>
              )}
            </nav>

            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                {review.category_name && (
                  <span className="mb-5 inline-block text-[12px] font-bold uppercase tracking-[0.15em] text-brand">
                    {review.category_name} Buying Guide
                  </span>
                )}
                <h1 className="font-serif text-[40px] font-medium leading-[1.05] tracking-tight text-ink md:text-[52px] lg:text-[58px]">
                  {review.title}
                </h1>
                {review.subtitle && (
                  <p className="mt-6 text-[19px] leading-[1.55] text-muted-ink md:text-[21px]">
                    {review.subtitle}
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium text-faint">
                  <Link href="/how-we-review" className="flex items-center gap-2 transition-colors hover:text-brand">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand"></span>
                    By the {SITE_NAME} Editorial Team
                  </Link>
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand"></span>
                    {products.length} products compared
                  </span>
                  {updatedLabel && (
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand"></span>
                      Updated {updatedLabel}
                    </span>
                  )}
                </div>
                <ShareButtons url={`${SITE_URL}${canonicalPath}`} title={review.title} />
              </div>

              {topThree.length > 0 && (
                <div className="hidden items-center justify-center gap-6 lg:flex lg:gap-8">
                  {topThree.map((p: any, i: number) => (
                    <div key={p.id} className={`flex flex-col items-center ${i === 0 ? 'z-10 scale-110' : 'opacity-90'}`}>
                      <div className={`relative flex items-center justify-center rounded-xl border border-card-edge bg-white p-5 shadow-card-hover ${i === 0 ? 'h-44 w-44' : 'h-32 w-32'}`}>
                        {p.image_url && (
                          <img src={p.image_url} alt={p.name} className="max-h-full max-w-full object-contain drop-shadow-md" />
                        )}
                      </div>
                      <span className={`mt-3 rounded-pill px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${i === 0 ? 'bg-brand text-white' : i === 1 ? 'bg-ink text-white' : 'bg-panel text-brand'}`}>
                        {awardLabels[p.id] || `#${i + 1}`}
                      </span>
                      <span className="mt-1.5 max-w-[120px] text-center text-[12px] font-semibold leading-tight text-ink">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* COMPARISON SHELF */}
        {topThree.length > 0 && (
          <section className="bg-paper py-12 md:py-16">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
              <h2 className="mb-8 text-[13px] font-bold uppercase tracking-[0.15em] text-faint">
                Our Top Picks at a Glance
              </h2>
              <Reveal stagger className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                {topThree.map((product: any, i: number) => {
                  const pros = parseProsConsJSON(product.pros)
                  return (
                    <div
                      key={product.id}
                      className={`group relative overflow-hidden rounded-xl shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover ${i === 0 ? 'border-2 border-brand/20 bg-white' : 'border border-card-edge bg-white'}`}
                    >
                      <div className="px-6 pt-5">
                        <span className={`inline-block rounded-pill px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider ${i === 0 ? 'bg-brand text-white' : i === 1 ? 'bg-ink text-white' : 'border border-card-edge bg-panel text-brand'}`}>
                          {awardLabels[product.id]}
                        </span>
                      </div>

                      <div className="flex h-40 justify-center px-6 py-5">
                        {product.image_url && (
                          <img src={product.image_url} alt={product.name} className="max-h-full object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                        )}
                      </div>

                      <div className="px-6 pb-6">
                        <h3 className="font-serif text-[18px] font-medium leading-snug tracking-tight text-ink">{product.name}</h3>

                        {pros.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {pros.slice(0, 3).map((pro: string, j: number) => (
                              <div key={j} className="flex items-start gap-2">
                                <ThumbsUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                                <span className="text-[13px] leading-snug text-muted-ink">{pro}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
                          {product.price ? (
                            <span className="font-serif text-[24px] font-semibold tabular-nums tracking-tight text-ink">
                              ${Number(product.price).toFixed(0)}
                            </span>
                          ) : (
                            <span className="text-[14px] text-faint">Check price</span>
                          )}
                          {product.rating && (
                            <span className="rounded-pill bg-savings-bg px-3 py-1 text-[14px] font-bold text-savings">
                              {product.rating}/5
                            </span>
                          )}
                        </div>

                        {product.affiliate_url && (
                          <AffiliateLink
                            href={product.affiliate_url}
                            productId={product.id}
                            guideId={slug}
                            location="top_comparison_table"
                            className={`mt-4 flex items-center justify-center gap-2 rounded-lg py-3 text-[14px] font-bold transition-all ${i === 0 ? 'bg-brand text-white shadow-xs hover:bg-brand-hover hover:shadow-brand-cta' : 'bg-panel text-ink hover:bg-paper-deep'}`}
                          >
                            Check Price on Amazon
                            <ArrowRight className="h-4 w-4" />
                          </AffiliateLink>
                        )}
                      </div>
                    </div>
                  )
                })}
              </Reveal>
            </div>
          </section>
        )}

        {/* COMPARISON TABLE — scannable side-by-side of every pick (featured-snippet friendly) */}
        {products.length >= 2 && (
          <section className="bg-paper pb-4 md:pb-8">
            <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
              <h2 className="mb-6 text-[13px] font-bold uppercase tracking-[0.15em] text-faint">
                How the picks compare
              </h2>
              <div className="overflow-x-auto rounded-xl border border-card-edge bg-white shadow-card">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-hairline bg-white">
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-faint">#</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-faint">Product</th>
                      <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-faint">Best for</th>
                      <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-faint">Score</th>
                      <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-faint">Price</th>
                      <th className="px-5 py-3.5" aria-label="Buy" />
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product: any, i: number) => {
                      const label = awardLabels[product.id] || `Pick #${i + 1}`
                      return (
                        <tr key={product.id} className="border-b border-hairline transition-colors last:border-0 hover:bg-paper">
                          <td className="px-5 py-4 align-middle">
                            <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${i === 0 ? 'bg-brand text-white' : 'bg-panel text-brand'}`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <div className="flex items-center gap-3">
                              {product.image_url && (
                                <img src={product.image_url} alt="" className="h-10 w-10 shrink-0 object-contain" loading="lazy" />
                              )}
                              <span className="text-[14px] font-semibold leading-tight text-ink">{product.name}</span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 align-middle text-[13px] font-medium text-muted-ink">
                            {label}
                          </td>
                          <td className="px-5 py-4 text-center align-middle">
                            {product.rating ? (
                              <span className="rounded-pill bg-savings-bg px-2.5 py-1 text-[13px] font-bold tabular-nums text-savings">
                                {product.rating}/5
                              </span>
                            ) : (
                              <span className="text-faint">—</span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-5 py-4 text-right align-middle text-[14px] font-semibold tabular-nums text-ink">
                            {product.price ? `$${Number(product.price).toFixed(0)}` : <span className="font-normal text-faint">Check price</span>}
                          </td>
                          <td className="px-5 py-4 text-right align-middle">
                            {product.affiliate_url && (
                              <AffiliateLink
                                href={product.affiliate_url}
                                productId={product.id}
                                guideId={slug}
                                location="comparison_table_row"
                                className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-brand px-4 py-2 text-[13px] font-bold text-white transition-all hover:bg-brand-hover hover:shadow-brand-cta"
                              >
                                Check price
                                <ArrowRight className="h-3.5 w-3.5" />
                              </AffiliateLink>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* MAIN CONTENT */}
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20 lg:px-12">
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_300px] lg:gap-20">

            <div className="min-w-0">
              <div className="mb-12 flex items-start gap-3 rounded-xl border border-card-edge bg-white px-5 py-4 text-[13px] text-faint shadow-card">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>
                  <strong className="text-muted-ink">Editorial integrity:</strong> We research independently and score every pick the same way. Links may earn a commission at no cost to you.{' '}
                  <Link href="/how-we-review" className="text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand">How we score</Link>
                  {' · '}
                  <Link href="/disclosure" className="text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand">Disclosure</Link>
                </span>
              </div>

              {/* PRODUCT DECISION MODULES */}
              {products.map((product: any, i: number) => {
                const pros = parseProsConsJSON(product.pros)
                const cons = parseProsConsJSON(product.cons)
                const label = awardLabels[product.id] || `Pick #${i + 1}`

                return (
                  <div key={product.id} className="mb-14">
                    <div className={`overflow-hidden rounded-xl border bg-white shadow-card ${i === 0 ? 'border-brand/20' : 'border-card-edge'}`}>
                      <div className={`flex items-center justify-between px-6 py-3 ${i === 0 ? 'bg-brand' : 'border-b border-hairline bg-paper'}`}>
                        <span className={`text-[12px] font-bold uppercase tracking-[0.12em] ${i === 0 ? 'text-white' : 'text-faint'}`}>
                          {label}
                        </span>
                        {product.rating && (
                          <span className={`text-[13px] font-bold ${i === 0 ? 'text-white/80' : 'text-faint'}`}>
                            {product.rating}/5
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-0 md:grid-cols-[280px_1fr]">
                        <div className="flex items-center justify-center p-8 md:border-r md:border-hairline">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="max-h-48 max-w-full object-contain drop-shadow-md" loading="lazy" />
                          ) : (
                            <div className="h-48 w-48 rounded-lg bg-paper" />
                          )}
                        </div>

                        <div className="p-6 md:p-8">
                          <h3 className="font-serif text-[26px] font-medium leading-tight tracking-tight text-ink">
                            {product.name}
                          </h3>

                          {product.description && (
                            <p className="mt-3 text-[16px] leading-[1.7] text-muted-ink">
                              {product.description}
                            </p>
                          )}

                          <div className="mt-5 flex flex-wrap items-center gap-4">
                            {product.price && (
                              <span className="font-serif text-[28px] font-semibold tabular-nums tracking-tight text-ink">
                                ${Number(product.price).toFixed(0)}
                              </span>
                            )}
                            {product.affiliate_url && (
                              <AffiliateLink
                                href={product.affiliate_url}
                                productId={product.id}
                                guideId={slug}
                                location="inline_cta"
                                className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-[14px] font-bold text-white shadow-xs transition-all hover:bg-brand-hover hover:shadow-brand-cta"
                              >
                                Check Price
                                <ArrowRight className="h-4 w-4" />
                              </AffiliateLink>
                            )}
                          </div>

                          {(pros.length > 0 || cons.length > 0) && (
                            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                              {pros.length > 0 && (
                                <div className="rounded-lg border border-[#CFE6D8] bg-[#F1F7F3] p-4">
                                  <div className="mb-3 flex items-center gap-2">
                                    <ThumbsUp className="h-4 w-4 text-brand" />
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-brand">What we love</span>
                                  </div>
                                  <ul className="space-y-2">
                                    {pros.map((pro: string, j: number) => (
                                      <li key={j} className="flex items-start gap-2.5">
                                        <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-brand" />
                                        <span className="text-[13.5px] leading-snug text-[#2A4A38]">{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {cons.length > 0 && (
                                <div className="rounded-lg border border-[#ECD4CB] bg-[#FBF4F1] p-4">
                                  <div className="mb-3 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-deal" />
                                    <span className="text-[12px] font-bold uppercase tracking-wider text-[#B45309]">Worth noting</span>
                                  </div>
                                  <ul className="space-y-2">
                                    {cons.map((con: string, j: number) => (
                                      <li key={j} className="flex items-start gap-2.5">
                                        <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-deal" />
                                        <span className="text-[13.5px] leading-snug text-[#7A4A2E]">{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {i === 0 && (
                        <div className="border-t border-hairline bg-paper px-6 py-4 md:px-8">
                          <div className="flex items-start gap-3">
                            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
                            <p className="text-[14.5px] leading-relaxed text-muted-ink">
                              <strong className="text-ink">Our verdict:</strong>{' '}
                              For most people, the {product.name} is the smartest buy in this category —
                              strong performance, reliable build quality, and excellent value for the price.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* EDITORIAL BODY */}
              {review.content && (
                <div className="mt-8" dangerouslySetInnerHTML={{ __html: renderEditorialContent(review.content) }} />
              )}

              <div className="mt-20 border-t border-hairline pt-10">
                <Link href="/reviews" className="inline-flex items-center gap-2 text-[14px] font-semibold text-brand transition-colors hover:text-brand-hover">
                  <ArrowLeft className="h-4 w-4" />
                  All buying guides
                </Link>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <aside className="hidden space-y-5 lg:sticky lg:top-8 lg:block lg:self-start">
              <div className="overflow-hidden rounded-xl border border-card-edge bg-white shadow-card">
                <div className="border-b border-hairline px-5 py-4">
                  <h3 className="text-[12px] font-bold uppercase tracking-[0.12em] text-faint">Quick Picks</h3>
                </div>
                <div className="divide-y divide-hairline">
                  {products.slice(0, 5).map((product: any, i: number) => {
                    const rowClass = "flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-paper"
                    const inner = (
                      <>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${i === 0 ? 'bg-brand text-white' : 'bg-panel text-brand'}`}>
                          {i + 1}
                        </span>
                        {product.image_url && (
                          <img src={product.image_url} alt="" className="h-9 w-9 shrink-0 object-contain" loading="lazy" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12.5px] font-semibold leading-tight text-ink">{product.name}</p>
                          <p className="mt-0.5 text-[11px] text-faint">
                            {product.price ? `$${Number(product.price).toFixed(0)}` : 'Check price'}
                          </p>
                        </div>
                      </>
                    )
                    return product.affiliate_url ? (
                      <AffiliateLink
                        key={product.id}
                        href={product.affiliate_url}
                        productId={product.id}
                        guideId={slug}
                        location="review_sidebar"
                        className={rowClass}
                      >
                        {inner}
                      </AffiliateLink>
                    ) : (
                      <div key={product.id} className={rowClass}>{inner}</div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-xl border border-card-edge bg-white p-5 shadow-card">
                <h3 className="mb-4 text-[12px] font-bold uppercase tracking-[0.12em] text-faint">
                  Why Trust Us
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Target, stat: `${products.length}`, label: 'Products compared' },
                    { icon: Activity, stat: '5', label: 'Factors scored' },
                    { icon: Shield, stat: '100%', label: 'Independent' },
                  ].map(({ icon: Icon, stat, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-panel">
                        <Icon className="h-4 w-4 text-brand" />
                      </div>
                      <div>
                        <span className="text-[15px] font-extrabold text-ink">{stat}</span>
                        <span className="ml-1.5 text-[12px] text-faint">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/how-we-review" className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-brand transition-colors hover:text-brand-hover">
                  How we score <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="rounded-xl border border-card-edge bg-white p-5 shadow-card">
                <h3 className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-faint">
                  Best For
                </h3>
                <div className="space-y-1">
                  {products.slice(0, 5).map((p: any, i: number) => {
                    const rowClass = "group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13px] transition-colors hover:bg-panel"
                    const inner = (
                      <>
                        <span className="truncate text-muted-ink transition-colors group-hover:text-ink">
                          {awardLabels[p.id] || `Pick #${i + 1}`}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-card-edge transition-colors group-hover:text-brand" />
                      </>
                    )
                    return p.affiliate_url ? (
                      <AffiliateLink
                        key={p.id}
                        href={p.affiliate_url}
                        productId={p.id}
                        guideId={slug}
                        location="review_sidebar"
                        className={rowClass}
                      >
                        {inner}
                      </AffiliateLink>
                    ) : (
                      <div key={p.id} className={rowClass}>{inner}</div>
                    )
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* RELATED */}
        {related.length > 0 && (
          <section className="border-t border-hairline bg-white">
            <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20 lg:px-12">
              <div className="mb-10 flex items-center justify-between">
                <h2 className="font-serif text-[26px] font-medium tracking-tight text-ink">More Buying Guides</h2>
                <Link href="/reviews" className="flex items-center gap-1.5 text-[13px] font-bold text-brand transition-colors hover:text-brand-hover">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <Reveal stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r: any) => (
                  <Link
                    key={r.id}
                    href={`/reviews/${r.slug}`}
                    className="group block rounded-xl border border-card-edge bg-white p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                  >
                    <span className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.12em] text-brand">
                      {r.category_name}
                    </span>
                    <h3 className="font-serif text-[19px] font-medium leading-snug tracking-tight text-ink transition-colors group-hover:text-brand">
                      {r.title}
                    </h3>
                    {r.subtitle && (
                      <p className="mt-3 line-clamp-2 text-[14px] leading-relaxed text-faint">{r.subtitle}</p>
                    )}
                    <span className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-brand transition-all group-hover:gap-2.5">
                      Read guide <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </Reveal>
            </div>
          </section>
        )}

        {FEATURES.newsletter && <Newsletter />}
      </main>
      {topPick?.affiliate_url && topPickItem && (
        <StickyBuyBar
          name={topPick.name}
          image={topPick.image_url}
          rating={topPick.rating || undefined}
          price={topPickPrice}
          affiliateUrl={topPick.affiliate_url}
          item={topPickItem}
          productId={topPick.id}
          guideId={slug}
          className="lg:hidden"
        />
      )}
      <SiteFooter />
    </div>
  )
}

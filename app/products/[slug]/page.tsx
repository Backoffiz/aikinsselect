export const runtime = 'edge'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/product-card'
import { SaveHeartButton } from '@/components/saved/save-heart-button'
import { StickyBuyBar } from '@/components/product/sticky-buy-bar'
import { AffiliateLink } from '@/components/affiliate-link'
import { Star, ChevronRight, ArrowRight, Award } from 'lucide-react'
import { Reveal } from '@/components/ui/reveal'
import {
  getProductBySlug,
  getAlternativeProducts,
  getReviewForProduct,
} from '@/lib/db'
import { JsonLd } from '@/components/seo/json-ld'
import { jsonLdGraph, organizationNode, breadcrumbNode, productNode } from '@/lib/seo'
import { FEATURES } from '@/lib/flags'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Product Not Found' }
  const description =
    product.description ||
    `${product.name} — expert review, specs, and the best price from Aikins Select.`
  const canonical = `/products/${slug}`
  const ogImage = product.image_url || '/og-image.jpg'
  return {
    title: product.name,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: canonical,
      images: [{ url: ogImage }],
    },
    twitter: { card: 'summary_large_image', title: product.name, description, images: [ogImage] },
  }
}

function parseJSONArray(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    const parsed = JSON.parse(val)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseSpecs(val: any): { k: string; v: string }[] {
  if (!val) return []
  let obj = val
  if (typeof val === 'string') {
    try {
      obj = JSON.parse(val)
    } catch {
      return []
    }
  }
  if (Array.isArray(obj)) {
    return obj
      .map((e: any) => (e && typeof e === 'object' ? { k: String(e.k ?? e.label ?? ''), v: String(e.v ?? e.value ?? '') } : null))
      .filter(Boolean) as { k: string; v: string }[]
  }
  if (obj && typeof obj === 'object') {
    return Object.entries(obj).map(([k, v]) => ({ k, v: String(v) }))
  }
  return []
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [alternatives, linkedReview] = await Promise.all([
    product.category_id ? getAlternativeProducts(product.category_id, product.id, 3) : Promise.resolve([]),
    getReviewForProduct(product.id),
  ])

  const pros = parseJSONArray(product.pros)
  const cons = parseJSONArray(product.cons)
  const specs = parseSpecs(product.specs)
  const rating: number = product.rating || 0
  const priceStr = product.price ? `$${Number(product.price).toFixed(2)}` : 'Check price'
  const buyUrl: string | undefined = product.affiliate_url || product.amazon_url || product.bestbuy_url

  const retailers = [
    { name: 'Amazon', url: product.amazon_url },
    { name: 'Best Buy', url: product.bestbuy_url },
    { name: 'Buy now', url: product.affiliate_url && product.affiliate_url !== product.amazon_url ? product.affiliate_url : null },
  ].filter((r) => r.url)

  const savedItem = {
    id: product.id,
    name: product.name,
    price: priceStr,
    sub: product.category_name,
    slug: product.slug,
    image: product.image_url,
  }

  const verdict = linkedReview?.mini_review || product.description || null

  const canonicalPath = `/products/${slug}`
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    ...(product.category_name && product.category_slug
      ? [{ name: product.category_name, url: `/categories/${product.category_slug}` }]
      : []),
    { name: product.name, url: canonicalPath },
  ]
  const structuredData = jsonLdGraph([
    organizationNode(),
    breadcrumbNode(breadcrumbItems),
    productNode({ ...product, description: product.description || verdict || undefined }),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main className="flex-1 pb-24">
        <div className="container px-4 pt-6 md:px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-[13px] text-faint">
            <Link href="/" className="hover:text-brand">Home</Link>
            <ChevronRight className="h-3 w-3 text-card-edge" />
            {product.category_slug ? (
              <>
                <Link href={`/categories/${product.category_slug}`} className="hover:text-brand">
                  {product.category_name}
                </Link>
                <ChevronRight className="h-3 w-3 text-card-edge" />
              </>
            ) : null}
            <span className="text-ink">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
            {/* LEFT */}
            <div className="min-w-0">
              {product.is_best_pick === 1 && (
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.06em] text-white shadow-xs">
                  <Award className="h-3.5 w-3.5" /> Best Overall
                </span>
              )}
              <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-ink md:text-[42px]">
                {product.name}
              </h1>

              {/* Rating row */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {rating > 0 && (
                  <span className="flex items-center gap-2">
                    <span className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i < Math.round(rating) ? 'fill-star text-star' : 'fill-hairline text-hairline'}`}
                        />
                      ))}
                    </span>
                    <span className="text-sm font-semibold text-ink">{rating.toFixed(1)}</span>
                    <span className="text-sm text-faint">Aikins Score</span>
                  </span>
                )}
                {product.brand && (
                  <>
                    <span className="text-card-edge">•</span>
                    <span className="text-sm text-muted-ink">{product.brand}</span>
                  </>
                )}
              </div>

              {/* Main image */}
              <div className="mt-6 flex h-[360px] items-center justify-center rounded-xl border border-card-edge bg-white p-8 shadow-card md:h-[420px]">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="font-serif text-2xl text-muted-ink">{product.name}</span>
                )}
              </div>

              {/* Verdict */}
              {verdict && (
                <section className="mt-10 border-t border-ink pt-7">
                  <h2 className="font-serif text-2xl font-medium text-ink">The verdict</h2>
                  <p className="mt-3 text-[16px] leading-[1.7] text-body">{verdict}</p>
                  {linkedReview && (
                    <Link
                      href={`/reviews/${linkedReview.slug}`}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover"
                    >
                      Read the full review <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </section>
              )}

              {/* Pros / cons */}
              {(pros.length > 0 || cons.length > 0) && (
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {pros.length > 0 && (
                    <div className="rounded-xl border border-[#CFE6D8] bg-[#F1F7F3] p-6">
                      <div className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.08em] text-brand">What we love</div>
                      <ul className="space-y-2.5">
                        {pros.map((p, i) => (
                          <li key={i} className="flex gap-2.5 text-[14.5px] leading-snug text-[#2A4A38]">
                            <span className="font-bold text-brand">+</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cons.length > 0 && (
                    <div className="rounded-xl border border-[#ECD4CB] bg-[#FBF4F1] p-6">
                      <div className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#B45309]">Worth noting</div>
                      <ul className="space-y-2.5">
                        {cons.map((c, i) => (
                          <li key={i} className="flex gap-2.5 text-[14.5px] leading-snug text-[#7A4A2E]">
                            <span className="font-bold text-deal">–</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* How it scored — single overall bar (per-criterion data not available) */}
              {rating > 0 && (
                <section className="mt-10 border-t border-ink pt-7">
                  <h2 className="font-serif text-2xl font-medium text-ink">How it scored</h2>
                  <div className="mt-5 grid grid-cols-[120px_1fr_44px] items-center gap-4">
                    <span className="text-sm font-semibold text-body">Aikins Score</span>
                    <span className="h-2 overflow-hidden rounded-pill bg-hairline">
                      <span className="block h-full rounded-pill bg-brand" style={{ width: `${(rating / 5) * 100}%` }} />
                    </span>
                    <span className="text-right text-sm font-bold text-ink">{rating.toFixed(1)}</span>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT — sticky buy box */}
            <div className="lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-2xl border border-card-edge bg-white shadow-card-lift">
                <div className="border-b border-hairline px-6 py-5">
                  <div className="text-xs text-faint">Best price right now</div>
                  <div className="mt-1 font-serif text-[38px] font-semibold tabular-nums text-ink">{priceStr}</div>
                </div>
                <div className="px-6 py-5">
                  {buyUrl ? (
                    <AffiliateLink
                      href={buyUrl}
                      productId={product.id}
                      location="product_page_primary"
                      className="mb-2.5 block rounded-lg bg-brand py-4 text-center text-base font-bold text-white shadow-brand-cta transition-colors hover:bg-brand-hover"
                    >
                      Check price at Amazon →
                    </AffiliateLink>
                  ) : null}
                  {FEATURES.saved && (
                    <SaveHeartButton item={savedItem} variant="inline" className="w-full" />
                  )}
                  <p className="mt-2.5 text-center text-[11.5px] text-faint">
                    We may earn a commission, at no cost to you.
                  </p>
                </div>

                {retailers.length >= 2 && (
                  <div className="px-6 pb-5 pt-1">
                    <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-faint">Where to buy</div>
                    {retailers.map((r) => (
                      <AffiliateLink
                        key={r.name}
                        href={r.url as string}
                        productId={product.id}
                        merchant={r.name}
                        location="product_page_merchant"
                        className="flex items-center justify-between border-b border-hairline py-3 last:border-0"
                      >
                        <span className="text-sm font-bold text-ink">{r.name}</span>
                        <span className="text-xs font-bold text-brand">Check price →</span>
                      </AffiliateLink>
                    ))}
                  </div>
                )}
              </div>

              {/* Specs */}
              {specs.length > 0 && (
                <div className="mt-4 rounded-xl border border-card-edge bg-white p-6 shadow-card">
                  <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.06em] text-faint">At a glance</div>
                  {specs.map((s, i) => (
                    <div key={i} className="flex justify-between border-b border-hairline py-2.5 text-[13.5px] last:border-0">
                      <span className="text-faint">{s.k}</span>
                      <span className="font-semibold text-ink">{s.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <section className="mt-16 border-t border-card-edge pt-10">
              <p className="mb-2.5 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
                <span className="h-px w-6 bg-brand/50" />
                More options
              </p>
              <h2 className="font-serif text-2xl font-medium tracking-tight text-ink">Also worth considering</h2>
              <p className="mt-1 text-sm text-faint">Other top picks in {product.category_name}</p>
              <Reveal stagger className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {alternatives.map((alt: any) => (
                  <ProductCard
                    key={alt.id}
                    productId={alt.id}
                    slug={alt.slug}
                    title={alt.name}
                    category={alt.category_name || product.category_name}
                    image={alt.image_url}
                    rating={alt.rating || 4.5}
                    price={alt.price ? `$${Number(alt.price).toFixed(2)}` : 'Check price'}
                    bestPick={alt.is_best_pick === 1}
                    affiliateUrl={alt.affiliate_url}
                  />
                ))}
              </Reveal>
            </section>
          )}
        </div>
      </main>

      <StickyBuyBar
        name={product.name}
        image={product.image_url}
        rating={rating || undefined}
        price={priceStr}
        affiliateUrl={buyUrl}
        item={savedItem}
        productId={product.id}
      />
      <SiteFooter />
    </div>
  )
}

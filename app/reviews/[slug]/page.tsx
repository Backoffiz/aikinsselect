export const runtime = 'edge'

import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Newsletter } from "@/components/newsletter"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Clock, ShoppingCart, Star, Award, CheckCircle, Shield, Activity, ChevronRight, ThumbsUp, AlertTriangle, Zap, Target } from "lucide-react"
import { getReviewBySlug, getProductsForReview, getPublishedReviews } from "@/lib/db"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const review = await getReviewBySlug(slug)
  if (!review) return { title: 'Review Not Found' }
  return {
    title: review.title,
    description: review.subtitle || `${review.title} - Expert review by Aikins Select`,
  }
}

function parseProsConsJSON(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try { return JSON.parse(val) } catch { return [] }
}

function renderEditorialContent(content: string): string {
  // Strip out the product-specific sections (What We Like/Better, tables)
  // Keep only the editorial narrative
  const lines = content.split('\n')
  const result: string[] = []
  let skipUntilNextH2 = false
  let inTable = false
  let inProsCons = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip tables entirely (handled by award shelf)
    if (line.startsWith('|') && line.endsWith('|')) {
      if (/^\|[\s\-:|]+\|$/.test(line)) continue
      inTable = true
      continue
    }
    if (inTable && (!line.startsWith('|'))) inTable = false

    // Skip "What We Like" / "What Could Be Better" sections (handled by product modules)
    if (/^###\s*(What We Like|What Could Be Better|Pros|Cons)/i.test(line)) {
      inProsCons = true
      continue
    }
    if (inProsCons) {
      if (line.startsWith('-') || line === '') continue
      if (line.startsWith('#')) inProsCons = false
      else continue
    }

    // Skip "Our Top Picks at a Glance" heading and table
    if (/^##.*Top Picks at a Glance/i.test(line)) {
      skipUntilNextH2 = true
      continue
    }
    if (skipUntilNextH2) {
      if (line.startsWith('## ') && !/Top Picks/i.test(line)) skipUntilNextH2 = false
      else continue
    }

    // Skip individual product heading sections (## Best Overall: ..., ## Runner-Up: ..., etc.)
    // These are already rendered as product decision modules above
    if (/^##\s*(Best Overall|Runner-Up|Budget Pick|Premium Pick|Best Value|Most Popular|Also Great):/i.test(line)) {
      skipUntilNextH2 = true
      continue
    }

    // Rebrand "What Reddit Says" → "What Real Users Say"
    if (/^##.*Reddit Says/i.test(line)) {
      result.push('## What Real Users Say')
      continue
    }
    // Clean up Reddit-specific references in body text
    if (/^Reddit:\s*r\//i.test(line)) {
      // Convert "Reddit: r/airfryer on Reddit: ..." → cleaner quote format
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
    .replace(/^### (.*$)/gim, '<h3 class="text-[23px] font-bold text-[#121212] mt-14 mb-5 tracking-tight leading-tight">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-[30px] font-bold text-[#121212] mt-16 mb-6 pb-5 border-b border-[#E8E5EF] tracking-tight leading-tight">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-[#121212]">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-5 list-disc text-[#4A4A4A] leading-[1.9] py-0.5 text-[16.5px]">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-5 list-decimal text-[#4A4A4A] leading-[1.9] py-0.5 text-[16.5px]">$2</li>')
    .replace(/^>\s*(.*)$/gim, '<blockquote class="border-l-3 border-[#6D28D9]/30 pl-5 my-6 text-[16px] text-[#5F6368] italic leading-relaxed">$1</blockquote>')
    .replace(/\n\n/g, '</p><p class="text-[#4A4A4A] leading-[1.95] mb-6 text-[17px]">')
    .replace(/^(?!<[hlu])/gm, '')
}

const AWARD_LABELS: Record<number, string> = {
  1: 'Best Overall',
  2: 'Runner-Up',
  3: 'Best Value',
  4: 'Also Great',
  5: 'Budget Pick',
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

  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      <SiteHeader />
      <main className="flex-1">

        {/* ════════════════════════════════════════════
            HERO — Two-column editorial statement
            ════════════════════════════════════════════ */}
        <section className="bg-white border-b border-[#E8E5EF]">
          <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-8 pb-14 md:pt-10 md:pb-20">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2.5 text-[13px] text-[#999] mb-10 font-medium">
              <Link href="/" className="hover:text-[#6D28D9] transition-colors">Home</Link>
              <ChevronRight className="h-3 w-3 text-[#DDD]" />
              <Link href="/reviews" className="hover:text-[#6D28D9] transition-colors">Reviews</Link>
              {review.category_name && (
                <>
                  <ChevronRight className="h-3 w-3 text-[#DDD]" />
                  <Link href={`/categories/${review.category_slug}`} className="hover:text-[#6D28D9] transition-colors">
                    {review.category_name}
                  </Link>
                </>
              )}
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left — Headline */}
              <div>
                {review.category_name && (
                  <span className="inline-block text-[12px] font-bold text-[#6D28D9] uppercase tracking-[0.15em] mb-5">
                    {review.category_name} Buying Guide
                  </span>
                )}
                <h1 className="text-[40px] md:text-[52px] lg:text-[58px] font-extrabold text-[#121212] leading-[1.05] tracking-[-0.02em]">
                  {review.title}
                </h1>
                {review.subtitle && (
                  <p className="mt-6 text-[19px] md:text-[21px] text-[#5F6368] leading-[1.55]">
                    {review.subtitle}
                  </p>
                )}
                {/* Trust strip */}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-[#888] font-medium">
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9]"></span>
                    Researched &amp; reviewed
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9]"></span>
                    {products.length} products compared
                  </span>
                  {review.published_at && (
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6D28D9]"></span>
                      Updated {new Date(review.published_at).toLocaleDateString('en-US', {
                        month: 'long', year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Right — Product gallery */}
              {topThree.length > 0 && (
                <div className="flex items-center justify-center gap-6 lg:gap-8">
                  {topThree.map((p: any, i: number) => (
                    <div key={p.id} className={`flex flex-col items-center ${i === 0 ? 'scale-110 z-10' : 'opacity-90'}`}>
                      <div className={`relative bg-white rounded-3xl border border-[#E8E5EF] p-5 shadow-lg ${
                        i === 0 ? 'w-44 h-44 shadow-xl shadow-[#6D28D9]/8' : 'w-32 h-32'
                      } flex items-center justify-center`}>
                        {p.image_url && (
                          <img src={p.image_url} alt={p.name} className="max-h-full max-w-full object-contain drop-shadow-md" />
                        )}
                      </div>
                      <span className={`mt-3 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        i === 0 ? 'bg-[#6D28D9] text-white' : i === 1 ? 'bg-[#121212] text-white' : 'bg-[#F3EEFF] text-[#6D28D9]'
                      }`}>
                        {AWARD_LABELS[i + 1] || `#${i + 1}`}
                      </span>
                      <span className="mt-1.5 text-[12px] font-semibold text-[#121212] text-center max-w-[120px] leading-tight">
                        {p.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════
            COMPARISON SHELF — Replaces the table
            ════════════════════════════════════════════ */}
        {topThree.length > 0 && (
          <section className="bg-[#FAFAF8] py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
              <h2 className="text-[13px] font-bold text-[#999] uppercase tracking-[0.15em] mb-8">
                Our Top Picks at a Glance
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {topThree.map((product: any, i: number) => {
                  const pros = parseProsConsJSON(product.pros)
                  return (
                    <div
                      key={product.id}
                      className={`relative rounded-3xl overflow-hidden transition-all hover:shadow-xl group ${
                        i === 0
                          ? 'bg-white border-2 border-[#6D28D9]/15 shadow-lg shadow-[#6D28D9]/5'
                          : 'bg-white border border-[#E8E5EF] shadow-sm hover:border-[#6D28D9]/20'
                      }`}
                    >
                      {/* Award tag */}
                      <div className="px-6 pt-5">
                        <span className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${
                          i === 0 ? 'bg-[#6D28D9] text-white' : i === 1 ? 'bg-[#121212] text-white' : 'bg-[#F3EEFF] text-[#6D28D9] border border-[#E8E5EF]'
                        }`}>
                          {AWARD_LABELS[i + 1]}
                        </span>
                      </div>

                      {/* Product image */}
                      <div className="flex justify-center h-40 py-5 px-6">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="max-h-full object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="px-6 pb-6">
                        <h3 className="font-bold text-[#121212] text-[18px] leading-snug tracking-tight">{product.name}</h3>

                        {/* Key strengths */}
                        {pros.length > 0 && (
                          <div className="mt-3 space-y-1.5">
                            {pros.slice(0, 3).map((pro: string, j: number) => (
                              <div key={j} className="flex items-start gap-2">
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-[13px] text-[#5F6368] leading-snug">{pro}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Price + Score */}
                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#E8E5EF]">
                          {product.price ? (
                            <span className="text-[24px] font-extrabold text-[#121212] tracking-tight">
                              ${Number(product.price).toFixed(0)}
                            </span>
                          ) : (
                            <span className="text-[14px] text-[#999]">Check price</span>
                          )}
                          {product.rating && (
                            <span className={`text-[14px] font-bold px-3 py-1 rounded-full ${
                              product.rating >= 4.5 ? 'bg-emerald-50 text-emerald-700' : 'bg-[#F3EEFF] text-[#6D28D9]'
                            }`}>
                              {product.rating}/5
                            </span>
                          )}
                        </div>

                        {/* CTA */}
                        {product.affiliate_url && (
                          <a
                            href={product.affiliate_url}
                            target="_blank"
                            rel="noopener sponsored"
                            className={`mt-4 flex items-center justify-center gap-2 text-[14px] font-bold rounded-2xl py-3 transition-all ${
                              i === 0
                                ? 'text-white bg-[#121212] hover:bg-[#2A2A2A] shadow-sm'
                                : 'text-[#121212] bg-[#F3F3F1] hover:bg-[#EAEAE8]'
                            }`}
                          >
                            Check Price on Amazon
                            <ArrowRight className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ════════════════════════════════════════════
            MAIN CONTENT — Article + Sidebar
            ════════════════════════════════════════════ */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-14 lg:gap-20">

            {/* ── LEFT: Editorial + Product Modules ── */}
            <div className="min-w-0">
              {/* Affiliate notice */}
              <div className="mb-12 flex items-start gap-3 px-5 py-4 bg-white border border-[#E8E5EF] rounded-2xl text-[13px] text-[#888]">
                <Shield className="h-4 w-4 text-[#6D28D9] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#5F6368]">Editorial integrity:</strong> We research independently. Links may earn a commission at no cost to you.{' '}
                  <Link href="/disclosure" className="text-[#6D28D9] underline underline-offset-2 decoration-[#6D28D9]/30 hover:decoration-[#6D28D9]">Learn more</Link>
                </span>
              </div>

              {/* ── PRODUCT DECISION MODULES ── */}
              {products.map((product: any, i: number) => {
                const pros = parseProsConsJSON(product.pros)
                const cons = parseProsConsJSON(product.cons)
                const label = AWARD_LABELS[product.rank || i + 1] || `Pick #${i + 1}`

                return (
                  <div key={product.id} className="mb-14">
                    {/* Module header */}
                    <div className={`rounded-3xl overflow-hidden border ${
                      i === 0 ? 'border-[#6D28D9]/15 shadow-lg shadow-[#6D28D9]/5' : 'border-[#E8E5EF] shadow-sm'
                    } bg-white`}>

                      {/* Top bar */}
                      <div className={`px-6 py-3 flex items-center justify-between ${
                        i === 0 ? 'bg-[#6D28D9]' : 'bg-[#FAFAF8] border-b border-[#E8E5EF]'
                      }`}>
                        <span className={`text-[12px] font-bold uppercase tracking-[0.12em] ${
                          i === 0 ? 'text-white' : 'text-[#999]'
                        }`}>
                          {label}
                        </span>
                        {product.rating && (
                          <span className={`text-[13px] font-bold ${i === 0 ? 'text-white/80' : 'text-[#999]'}`}>
                            {product.rating}/5
                          </span>
                        )}
                      </div>

                      {/* Two-column product layout */}
                      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-0">
                        {/* Left: Image */}
                        <div className="flex items-center justify-center p-8 md:border-r border-[#E8E5EF]">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="max-h-48 max-w-full object-contain drop-shadow-lg"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-48 h-48 bg-[#FAFAF8] rounded-2xl" />
                          )}
                        </div>

                        {/* Right: Details */}
                        <div className="p-6 md:p-8">
                          <h3 className="text-[26px] font-extrabold text-[#121212] tracking-tight leading-tight">
                            {product.name}
                          </h3>

                          {product.description && (
                            <p className="mt-3 text-[16px] text-[#5F6368] leading-[1.7]">
                              {product.description}
                            </p>
                          )}

                          {/* Price + CTA */}
                          <div className="mt-5 flex flex-wrap items-center gap-4">
                            {product.price && (
                              <span className="text-[28px] font-extrabold text-[#121212] tracking-tight">
                                ${Number(product.price).toFixed(0)}
                              </span>
                            )}
                            {product.affiliate_url && (
                              <a
                                href={product.affiliate_url}
                                target="_blank"
                                rel="noopener sponsored"
                                className="inline-flex items-center gap-2 text-[14px] font-bold text-white bg-[#121212] hover:bg-[#2A2A2A] px-6 py-3 rounded-xl transition-all shadow-sm"
                              >
                                Check Price
                                <ArrowRight className="h-4 w-4" />
                              </a>
                            )}
                          </div>

                          {/* Pros & Cons side by side */}
                          {(pros.length > 0 || cons.length > 0) && (
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {pros.length > 0 && (
                                <div className="bg-emerald-50/60 rounded-2xl p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <ThumbsUp className="h-4 w-4 text-emerald-600" />
                                    <span className="text-[12px] font-bold text-emerald-800 uppercase tracking-wider">What we like</span>
                                  </div>
                                  <ul className="space-y-2">
                                    {pros.map((pro: string, j: number) => (
                                      <li key={j} className="flex items-start gap-2.5">
                                        <span className="shrink-0 w-1 h-1 rounded-full bg-emerald-400 mt-2.5" />
                                        <span className="text-[13.5px] text-emerald-900 leading-snug">{pro}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {cons.length > 0 && (
                                <div className="bg-amber-50/60 rounded-2xl p-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                                    <span className="text-[12px] font-bold text-amber-800 uppercase tracking-wider">Could be better</span>
                                  </div>
                                  <ul className="space-y-2">
                                    {cons.map((con: string, j: number) => (
                                      <li key={j} className="flex items-start gap-2.5">
                                        <span className="shrink-0 w-1 h-1 rounded-full bg-amber-400 mt-2.5" />
                                        <span className="text-[13.5px] text-amber-900 leading-snug">{con}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Verdict bar */}
                      {i === 0 && (
                        <div className="px-6 md:px-8 py-4 bg-[#FAFAF8] border-t border-[#E8E5EF]">
                          <div className="flex items-start gap-3">
                            <Zap className="h-5 w-5 text-[#6D28D9] shrink-0 mt-0.5" />
                            <p className="text-[14.5px] text-[#5F6368] leading-relaxed">
                              <strong className="text-[#121212]">Our verdict:</strong>{' '}
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

              {/* ── EDITORIAL BODY ── */}
              {review.content && (
                <div className="mt-8" dangerouslySetInnerHTML={{ __html: renderEditorialContent(review.content) }} />
              )}

              {/* Back */}
              <div className="mt-20 pt-10 border-t border-[#E8E5EF]">
                <Link href="/reviews" className="inline-flex items-center text-[#6D28D9] hover:text-[#5B21B6] font-semibold text-[14px] transition-colors gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  All buying guides
                </Link>
              </div>
            </div>

            {/* ── RIGHT SIDEBAR ── */}
            <aside className="hidden lg:block lg:self-start lg:sticky lg:top-8 space-y-5">

              {/* Quick picks */}
              <div className="bg-white border border-[#E8E5EF] rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-[#E8E5EF]">
                  <h3 className="text-[12px] font-bold text-[#999] uppercase tracking-[0.12em]">Quick Picks</h3>
                </div>
                <div className="divide-y divide-[#E8E5EF]">
                  {products.slice(0, 5).map((product: any, i: number) => (
                    <a
                      key={product.id}
                      href={product.affiliate_url || '#'}
                      target="_blank"
                      rel="noopener sponsored"
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-[#FAFAF8] transition-colors"
                    >
                      <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                        i === 0 ? 'bg-[#6D28D9] text-white' : 'bg-[#F3EEFF] text-[#6D28D9]'
                      }`}>
                        {i + 1}
                      </span>
                      {product.image_url && (
                        <img src={product.image_url} alt="" className="w-9 h-9 object-contain shrink-0" loading="lazy" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[12.5px] font-semibold text-[#121212] truncate leading-tight">{product.name}</p>
                        <p className="text-[11px] text-[#999] mt-0.5">
                          {product.price ? `$${Number(product.price).toFixed(0)}` : 'Check price'}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Why trust us */}
              <div className="bg-white border border-[#E8E5EF] rounded-2xl p-5 shadow-sm">
                <h3 className="text-[12px] font-bold text-[#999] uppercase tracking-[0.12em] mb-4">
                  Why Trust Us
                </h3>
                <div className="space-y-4">
                  {[
                    { icon: Target, stat: `${products.length}+`, label: 'Products evaluated' },
                    { icon: Activity, stat: '50+', label: 'Hours researched' },
                    { icon: Shield, stat: '100%', label: 'Independent reviews' },
                  ].map(({ icon: Icon, stat, label }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-xl bg-[#F3EEFF] flex items-center justify-center">
                        <Icon className="h-4 w-4 text-[#6D28D9]" />
                      </div>
                      <div>
                        <span className="text-[15px] font-extrabold text-[#121212]">{stat}</span>
                        <span className="text-[12px] text-[#999] ml-1.5">{label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best for use cases */}
              <div className="bg-white border border-[#E8E5EF] rounded-2xl p-5 shadow-sm">
                <h3 className="text-[12px] font-bold text-[#999] uppercase tracking-[0.12em] mb-3">
                  Best For
                </h3>
                <div className="space-y-1">
                  {products.slice(0, 5).map((p: any, i: number) => (
                    <a
                      key={p.id}
                      href={p.affiliate_url || '#'}
                      target="_blank"
                      rel="noopener sponsored"
                      className="flex items-center justify-between py-2.5 px-3 rounded-xl text-[13px] hover:bg-[#F3EEFF]/40 transition-colors group"
                    >
                      <span className="text-[#5F6368] group-hover:text-[#121212] transition-colors truncate">
                        {AWARD_LABELS[i + 1] || `Pick #${i + 1}`}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-[#CCC] group-hover:text-[#6D28D9] transition-colors shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ════════════════════════════════════════════
            RELATED — More buying guides
            ════════════════════════════════════════════ */}
        {related.length > 0 && (
          <section className="border-t border-[#E8E5EF] bg-white">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 md:py-20">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-[26px] font-extrabold text-[#121212] tracking-tight">More Buying Guides</h2>
                <Link href="/reviews" className="text-[13px] font-bold text-[#6D28D9] hover:text-[#5B21B6] flex items-center gap-1.5 transition-colors">
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((r: any) => (
                  <Link
                    key={r.id}
                    href={`/reviews/${r.slug}`}
                    className="group block rounded-2xl border border-[#E8E5EF] bg-white p-7 hover:shadow-xl hover:border-[#6D28D9]/15 transition-all"
                  >
                    <span className="inline-block text-[11px] font-bold text-[#6D28D9] uppercase tracking-[0.12em] mb-3">
                      {r.category_name}
                    </span>
                    <h3 className="font-extrabold text-[#121212] text-[19px] leading-snug tracking-tight group-hover:text-[#6D28D9] transition-colors">
                      {r.title}
                    </h3>
                    {r.subtitle && (
                      <p className="text-[14px] text-[#888] mt-3 line-clamp-2 leading-relaxed">{r.subtitle}</p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-[#6D28D9] font-bold mt-5 group-hover:gap-2.5 transition-all">
                      Read guide <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Newsletter */}
        <section className="bg-[#121212] py-16">
          <div className="max-w-2xl mx-auto px-5 text-center">
            <h2 className="text-[28px] font-extrabold text-white tracking-tight">No hype. Just the best gear, researched properly.</h2>
            <p className="mt-3 text-[16px] text-[#888]">Join our newsletter for expert picks delivered weekly.</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { JsonLd } from "@/components/seo/json-ld"
import { jsonLdGraph, organizationNode, websiteNode, breadcrumbNode } from "@/lib/seo"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "How We Review",
  description:
    "Our methodology: how the Aikins Score is calculated, what each weighted factor measures, and the honesty rules we hold ourselves to — no lab-testing claims, no fabricated prices or ratings.",
  alternates: { canonical: "/how-we-review" },
}

// Mirrors scraper/lib/scoring.ts WEIGHTS — the single source of truth for the score.
// Keep these in sync if the weights are ever retuned.
const FACTORS = [
  { name: "Expert consensus", weight: "35%", measures: "How strongly and consistently independent expert reviews recommend a product across the web." },
  { name: "Owner sentiment", weight: "25%", measures: "What real owners say after living with it — the praise and the recurring complaints alike." },
  { name: "Value for money", weight: "15%", measures: "Performance, build, and features relative to what the product actually costs." },
  { name: "Build & features", weight: "15%", measures: "Materials, durability, and the specific feature set that matters in the category." },
  { name: "How current", weight: "10%", measures: "Whether it's the current generation or an aging model about to be replaced." },
]

export default function HowWeReviewPage() {
  const structuredData = jsonLdGraph([
    organizationNode(),
    websiteNode(),
    breadcrumbNode([
      { name: "Home", url: "/" },
      { name: "How we review", url: "/how-we-review" },
    ]),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <JsonLd data={structuredData} />
      <SiteHeader />
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-14 md:py-20">
        <p className="mb-3 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
          <span className="h-px w-6 bg-brand/50" />
          Methodology
        </p>
        <h1 className="mb-6 font-serif text-4xl font-medium tracking-tight text-ink md:text-5xl">
          How we review
        </h1>
        <p className="text-lg leading-relaxed text-body">
          Aikins Select exists to answer one question honestly: of all the products in a category,
          which one should you actually buy? We don&apos;t take a manufacturer&apos;s word for it and
          we don&apos;t rely on a single opinion. Every recommendation is built from the weight of the
          evidence — and scored the same, transparent way every time.
        </p>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">
          The Aikins Score
        </h2>
        <p className="mt-4 leading-relaxed text-body">
          Every product earns a single 0–10 Aikins Score. It is <strong>not</strong> a number we ask an
          AI to guess — it&apos;s a fixed, weighted formula applied identically to every contender, so
          the ranking is explainable and reproducible. Five factors go into it:
        </p>

        <div className="mt-6 overflow-hidden rounded-xl border border-card-edge bg-white shadow-card">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-hairline bg-paper">
                <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-faint">Factor</th>
                <th className="px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-faint">Weight</th>
                <th className="hidden px-5 py-3 text-[12px] font-bold uppercase tracking-wider text-faint sm:table-cell">What it measures</th>
              </tr>
            </thead>
            <tbody>
              {FACTORS.map((f) => (
                <tr key={f.name} className="border-b border-hairline last:border-0">
                  <td className="px-5 py-4 align-top text-[15px] font-semibold text-ink">{f.name}</td>
                  <td className="px-5 py-4 align-top">
                    <span className="rounded-pill bg-savings-bg px-2.5 py-1 text-[13px] font-bold tabular-nums text-savings">
                      {f.weight}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-top text-[14px] leading-relaxed text-muted-ink">
                    <span className="sm:hidden font-semibold text-ink">{f.measures}</span>
                    <span className="hidden sm:inline">{f.measures}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-faint">
          The top-scoring pick becomes our Best Overall. The cheapest strong contender is flagged as the
          Budget Pick and the priciest as the Premium Pick, so you can jump straight to the one that fits
          your situation.
        </p>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">
          Our process
        </h2>
        <ol className="mt-4 list-decimal space-y-3 pl-5 leading-relaxed text-body">
          <li><strong>Gather the evidence.</strong> We pull together expert reviews and buying guides from trusted independent sources, plus real owner feedback and community discussion, for each &quot;best&quot; category.</li>
          <li><strong>Synthesize, don&apos;t parrot.</strong> Our research engine extracts the products that genuinely earn recommendations, the concrete pros and cons, and the complaints owners raise most often — never invented specs or quotes.</li>
          <li><strong>Score it.</strong> Each contender gets the five weighted factor scores above, combined into its Aikins Score.</li>
          <li><strong>Rank and label.</strong> Products are ordered by score and given honest, price-aware badges (Best Overall, Runner-Up, Budget Pick, Premium Pick).</li>
        </ol>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">
          What we don&apos;t do
        </h2>
        <ul className="mt-4 space-y-3 leading-relaxed text-body">
          <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span>We don&apos;t run our own lab tests, and we never pretend to. When we say &quot;we reviewed&quot; or &quot;we researched,&quot; we mean exactly that — we analyze the best available expert and owner evidence.</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span>We never show a price we can&apos;t confirm. If a live price isn&apos;t verified, you&apos;ll see &quot;Check price&quot; rather than a made-up number.</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span>We never fabricate ratings or reviews. Every score traces back to the weighted formula and the underlying evidence.</span></li>
          <li className="flex gap-3"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span>We don&apos;t let affiliate commissions move a product up the list. The ranking is set by the score, full stop.</span></li>
        </ul>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">
          Who&apos;s behind the reviews
        </h2>
        <p className="mt-4 leading-relaxed text-body">
          Aikins Select is an independent publisher. Our guides are produced by the Aikins Select
          editorial team using a research-and-scoring system we built and maintain — the same
          methodology on this page, applied consistently across every category. We publish the formula
          openly precisely so you can judge the recommendations on their merits.
        </p>

        <h2 className="mt-12 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">
          How we make money
        </h2>
        <p className="mt-4 leading-relaxed text-body">
          Aikins Select is reader-supported. When you buy through a link on our site we may earn an
          affiliate commission at no extra cost to you. That&apos;s what keeps the site free — and, as
          above, it never influences which product wins.{" "}
          <Link href="/disclosure" className="font-semibold text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand">
            Read our full affiliate disclosure
          </Link>.
        </p>

        <div className="mt-14 rounded-xl border border-card-edge bg-white p-6 shadow-card">
          <p className="text-[15px] leading-relaxed text-muted-ink">
            Questions about our methodology or a specific recommendation? Email{" "}
            <a href="mailto:hello@aikinsselect.com" className="font-semibold text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand">hello@aikinsselect.com</a>{" "}
            — we read everything.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

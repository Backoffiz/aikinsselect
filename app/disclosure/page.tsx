import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "Aikins Select affiliate disclosure — how we earn revenue and maintain editorial independence.",
  alternates: { canonical: "/disclosure" },
}

export default function DisclosurePage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-14 md:py-20">
        <p className="mb-3 inline-flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand">
          <span className="h-px w-6 bg-brand/50" />
          Legal
        </p>
        <h1 className="mb-2 font-serif text-4xl font-medium tracking-tight text-ink md:text-5xl">Affiliate Disclosure</h1>
        <p className="mb-8 text-sm text-faint">Last updated: February 24, 2026</p>

        <div className="space-y-6 leading-relaxed text-body">
          <p className="text-lg">
            Aikins Select is reader-supported. When you buy products through links on our site,
            we may earn an affiliate commission. Here&apos;s what that means for you.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">How Affiliate Links Work</h2>
          <p>
            Some links on Aikins Select are &quot;affiliate links.&quot; This means if you click on a link
            and purchase the product, we receive a small commission from the retailer. This
            comes at <strong>no additional cost to you</strong> — you pay the same price whether
            you use our link or go directly to the store.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Amazon Associates Program</h2>
          <p>
            Aikins Select is a participant in the <strong>Amazon Services LLC Associates Program</strong>,
            an affiliate advertising program designed to provide a means for sites to earn advertising
            fees by advertising and linking to Amazon.com. As an Amazon Associate, we earn from
            qualifying purchases.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Our Editorial Independence</h2>
          <p>
            Affiliate relationships <strong>never influence our recommendations</strong>. Our reviews
            are based on independent research, expert source analysis, and real user feedback.
            We recommend products because we believe they&apos;re genuinely good — not because
            we earn a commission.
          </p>
          <p>
            If a product doesn&apos;t meet our standards, we won&apos;t recommend it regardless of
            potential affiliate revenue. Your trust is more valuable to us than any commission.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Other Affiliate Partners</h2>
          <p>
            In addition to Amazon, we may partner with other retailers and affiliate networks
            including but not limited to Best Buy, Walmart, ShareASale, and brand-specific
            affiliate programs. The same editorial standards apply to all partnerships.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Why We Use Affiliate Links</h2>
          <p>
            Affiliate commissions help us fund our research, maintain the site, and continue
            providing free product recommendations. Without affiliate revenue, we would not
            be able to offer this service.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Questions?</h2>
          <p>
            If you have questions about our affiliate relationships, please contact us at{" "}
            <a href="mailto:hello@aikinsselect.com" className="font-semibold text-brand underline decoration-brand/40 underline-offset-2 hover:decoration-brand">hello@aikinsselect.com</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

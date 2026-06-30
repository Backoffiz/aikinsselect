import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Aikins Select and our AI-powered product review methodology.",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 container px-4 py-12 md:py-16 max-w-3xl mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">About</p>
        <h1 className="mt-2 mb-8 font-serif text-4xl md:text-5xl font-medium tracking-tight text-ink">About Aikins Select</h1>

        <div className="space-y-6">
          <p className="text-lg leading-relaxed text-body">
            Aikins Select is an independent product review site that helps you find the best products
            without the guesswork. We combine expert analysis from trusted sources with real user
            feedback to deliver honest, research-backed recommendations.
          </p>

          <h2 className="mt-10 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">Our Review Process</h2>
          <p className="leading-relaxed text-body">
            Every product recommendation on Aikins Select goes through a rigorous research process:
          </p>
          <ol className="list-decimal list-inside space-y-3 leading-relaxed text-body">
            <li><strong>Expert Source Analysis</strong> — We cross-reference expert reviews and buying guides from trusted publications across the web to understand expert consensus.</li>
            <li><strong>Real User Feedback</strong> — We analyze hundreds of real user reviews and community discussions to capture what everyday users actually experience.</li>
            <li><strong>AI-Powered Synthesis</strong> — Our AI research engine aggregates all this data to produce balanced, comprehensive reviews that highlight true strengths and weaknesses.</li>
            <li><strong>Independent Scoring</strong> — Each product receives an Aikins Select score based on performance, value, reliability, and user satisfaction across all sources.</li>
          </ol>

          <h2 className="mt-10 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">Why Trust Us?</h2>
          <p className="leading-relaxed text-body">
            Unlike single-source reviews, we don&apos;t rely on one opinion. By synthesizing many
            expert reviews and real user feedback, we surface products that
            consistently earn praise — in everyday, real-world use.
          </p>

          <h2 className="mt-10 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">How We Make Money</h2>
          <p className="leading-relaxed text-body">
            Aikins Select is reader-supported. When you buy through links on our site, we may earn
            an affiliate commission at no extra cost to you. This supports our research and helps
            us keep the site free. We never let affiliate relationships influence our recommendations —
            our reviews are based purely on research and data.
          </p>

          <h2 className="mt-10 font-serif text-2xl md:text-3xl font-medium tracking-tight text-ink">Contact Us</h2>
          <p className="leading-relaxed text-body">
            Have questions, feedback, or product suggestions? We&apos;d love to hear from you.
            Reach us at <a href="mailto:hello@aikinsselect.com" className="text-brand hover:underline">hello@aikinsselect.com</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

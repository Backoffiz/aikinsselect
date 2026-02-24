import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Aikins Select and our AI-powered product review methodology.",
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container px-4 py-12 max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">About Aikins Select</h1>

        <div className="prose prose-slate max-w-none space-y-6">
          <p className="text-lg text-slate-600">
            Aikins Select is an independent product review site that helps you find the best products
            without the guesswork. We combine expert analysis from trusted sources with real user
            feedback to deliver honest, research-backed recommendations.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8">Our Review Process</h2>
          <p className="text-slate-600">
            Every product recommendation on Aikins Select goes through a rigorous research process:
          </p>
          <ol className="list-decimal list-inside space-y-3 text-slate-600">
            <li><strong>Expert Source Analysis</strong> — We cross-reference reviews from Wirecutter, RTINGS, Tom&apos;s Guide, and other trusted publications to understand expert consensus.</li>
            <li><strong>Real User Feedback</strong> — We analyze hundreds of user reviews from Amazon, Reddit, and enthusiast forums to capture what everyday users actually experience.</li>
            <li><strong>AI-Powered Synthesis</strong> — Our AI research engine aggregates all this data to produce balanced, comprehensive reviews that highlight true strengths and weaknesses.</li>
            <li><strong>Independent Scoring</strong> — Each product receives an Aikins Select score based on performance, value, reliability, and user satisfaction across all sources.</li>
          </ol>

          <h2 className="text-2xl font-bold text-slate-900 mt-8">Why Trust Us?</h2>
          <p className="text-slate-600">
            Unlike single-source reviews, we don&apos;t rely on one opinion. By synthesizing data from
            5+ professional review sites and real user communities, we surface products that
            consistently perform well — not just in lab tests, but in real life.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8">How We Make Money</h2>
          <p className="text-slate-600">
            Aikins Select is reader-supported. When you buy through links on our site, we may earn
            an affiliate commission at no extra cost to you. This supports our research and helps
            us keep the site free. We never let affiliate relationships influence our recommendations —
            our reviews are based purely on research and data.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-8">Contact Us</h2>
          <p className="text-slate-600">
            Have questions, feedback, or product suggestions? We&apos;d love to hear from you.
            Reach us at <a href="mailto:hello@aikinsselect.com" className="text-violet-600 hover:underline">hello@aikinsselect.com</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

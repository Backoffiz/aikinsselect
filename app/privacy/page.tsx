import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Aikins Select privacy policy — how we collect, use, and protect your information.",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 container px-4 py-12 md:py-16 max-w-3xl mx-auto">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brand">Legal</p>
        <h1 className="mt-2 mb-2 font-serif text-4xl md:text-5xl font-medium tracking-tight text-ink">Privacy Policy</h1>
        <p className="mb-8 text-sm text-faint">Last updated: February 24, 2026</p>

        <div className="space-y-6 leading-relaxed text-body">
          <p>
            Aikins Select (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website aikinsselect.com.
            This page informs you of our policies regarding the collection, use, and disclosure
            of personal information when you use our site.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Information We Collect</h2>
          <p>We collect minimal information to improve your experience:</p>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Usage Data</strong> — Pages visited, time spent, referral sources, and browser type. This is collected automatically via analytics.</li>
            <li><strong>Email Address</strong> — Only if you voluntarily subscribe to our newsletter.</li>
            <li><strong>Cookies</strong> — We use essential cookies for site functionality and analytics cookies to understand usage patterns.</li>
          </ul>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>To operate and improve our website</li>
            <li>To send newsletters (only if you subscribed)</li>
            <li>To analyze site traffic and optimize content</li>
          </ul>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Affiliate Links & Third Parties</h2>
          <p>
            Our site contains affiliate links to third-party retailers including Amazon.com.
            When you click these links, the retailer may collect information about your visit
            according to their own privacy policy. We do not control or have access to
            information collected by third-party sites.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Amazon Associates Disclosure</h2>
          <p>
            Aikins Select is a participant in the Amazon Services LLC Associates Program,
            an affiliate advertising program designed to provide a means for sites to earn
            advertising fees by advertising and linking to Amazon.com.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Data Retention</h2>
          <p>
            We retain your email address for as long as you remain subscribed to our newsletter.
            You can unsubscribe at any time. Analytics data is retained in aggregate form and
            does not personally identify you.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Your Rights</h2>
          <p>
            You have the right to request access to, correction of, or deletion of your personal
            information. Contact us at{" "}
            <a href="mailto:hello@aikinsselect.com" className="text-brand hover:underline">hello@aikinsselect.com</a>{" "}
            for any privacy-related requests.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Changes to This Policy</h2>
          <p>
            We may update this privacy policy from time to time. Changes will be posted on this
            page with an updated revision date.
          </p>

          <h2 className="mt-10 font-serif text-2xl font-medium tracking-tight text-ink">Contact</h2>
          <p>
            Questions about this privacy policy? Email us at{" "}
            <a href="mailto:hello@aikinsselect.com" className="text-brand hover:underline">hello@aikinsselect.com</a>.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

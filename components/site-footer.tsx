import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FEATURES } from "@/lib/flags"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-ink-deep text-paper/70">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-medium text-paper">Aikins Select</h3>
            <p className="text-sm text-paper/60">
              Independent product reviews. We review so you buy the right one — once.
            </p>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" asChild className="text-paper/70 hover:text-brand-on-dark hover:bg-white/5">
                <Link href="#"><Facebook className="h-4 w-4" /><span className="sr-only">Facebook</span></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="text-paper/70 hover:text-brand-on-dark hover:bg-white/5">
                <Link href="#"><Twitter className="h-4 w-4" /><span className="sr-only">Twitter</span></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="text-paper/70 hover:text-brand-on-dark hover:bg-white/5">
                <Link href="#"><Instagram className="h-4 w-4" /><span className="sr-only">Instagram</span></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="text-paper/70 hover:text-brand-on-dark hover:bg-white/5">
                <Link href="#"><Youtube className="h-4 w-4" /><span className="sr-only">YouTube</span></Link>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-paper">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/categories/tech" className="text-paper/70 hover:text-brand-on-dark">Tech</Link></li>
              <li><Link href="/categories/home" className="text-paper/70 hover:text-brand-on-dark">Home</Link></li>
              <li><Link href="/categories/kitchen" className="text-paper/70 hover:text-brand-on-dark">Kitchen</Link></li>
              <li><Link href="/categories/fitness" className="text-paper/70 hover:text-brand-on-dark">Fitness</Link></li>
              <li><Link href="/categories/beauty" className="text-paper/70 hover:text-brand-on-dark">Beauty</Link></li>
              <li><Link href="/categories" className="text-paper/70 hover:text-brand-on-dark">All categories</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-paper">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/reviews" className="text-paper/70 hover:text-brand-on-dark">Reviews</Link></li>
              <li><Link href="/about" className="text-paper/70 hover:text-brand-on-dark">How we review</Link></li>
              {FEATURES.saved && (
                <li><Link href="/saved" className="text-paper/70 hover:text-brand-on-dark">Saved items</Link></li>
              )}
              <li><Link href="/disclosure" className="text-paper/70 hover:text-brand-on-dark">Affiliate Disclosure</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-paper">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-paper/70 hover:text-brand-on-dark">About Us</Link></li>
              <li><Link href="/privacy" className="text-paper/70 hover:text-brand-on-dark">Privacy Policy</Link></li>
              <li><Link href="/disclosure" className="text-paper/70 hover:text-brand-on-dark">Affiliate Disclosure</Link></li>
              <li><a href="mailto:hello@aikinsselect.com" className="text-paper/70 hover:text-brand-on-dark">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-8 text-center text-xs text-faint space-y-2">
          <p>© {new Date().getFullYear()} Aikins Select. As an affiliate we earn from qualifying purchases.</p>
          <p>
            Aikins Select is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.
          </p>
        </div>
      </div>
    </footer>
  )
}

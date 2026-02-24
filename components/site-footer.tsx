import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-muted">
      <div className="container px-4 md:px-6 py-8 md:py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-muted-foreground">Aikins Select</h3>
            <p className="text-sm text-slate-default">
              Expert product reviews and recommendations powered by AI and human expertise.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild className="text-slate-default hover:text-primary hover:bg-white">
                <Link href="#"><Facebook className="h-4 w-4" /><span className="sr-only">Facebook</span></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="text-slate-default hover:text-primary hover:bg-white">
                <Link href="#"><Twitter className="h-4 w-4" /><span className="sr-only">Twitter</span></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="text-slate-default hover:text-primary hover:bg-white">
                <Link href="#"><Instagram className="h-4 w-4" /><span className="sr-only">Instagram</span></Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="text-slate-default hover:text-primary hover:bg-white">
                <Link href="#"><Youtube className="h-4 w-4" /><span className="sr-only">YouTube</span></Link>
              </Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/reviews" className="text-slate-default hover:text-primary">Tech</Link></li>
              <li><Link href="/reviews" className="text-slate-default hover:text-primary">Home</Link></li>
              <li><Link href="/reviews" className="text-slate-default hover:text-primary">Kitchen</Link></li>
              <li><Link href="/reviews" className="text-slate-default hover:text-primary">Fitness</Link></li>
              <li><Link href="/reviews" className="text-slate-default hover:text-primary">Beauty</Link></li>
              <li><Link href="/reviews" className="text-slate-default hover:text-primary">Travel</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/reviews" className="text-slate-default hover:text-primary">Reviews</Link></li>
              <li><Link href="/about" className="text-slate-default hover:text-primary">How We Research</Link></li>
              <li><Link href="/disclosure" className="text-slate-default hover:text-primary">Affiliate Disclosure</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-slate-default hover:text-primary">About Us</Link></li>
              <li><Link href="/privacy" className="text-slate-default hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/disclosure" className="text-slate-default hover:text-primary">Affiliate Disclosure</Link></li>
              <li><a href="mailto:hello@aikinsselect.com" className="text-slate-default hover:text-primary">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-8 text-center text-xs text-slate-400 space-y-2">
          <p>© {new Date().getFullYear()} Aikins Select. All rights reserved.</p>
          <p>
            Aikins Select is reader-supported. When you buy through links on our site, we may earn an affiliate commission at no extra cost to you.
          </p>
          <p>
            As an Amazon Associate, Aikins Select earns from qualifying purchases.
          </p>
        </div>
      </div>
    </footer>
  )
}

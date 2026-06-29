import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  return (
    <section id="newsletter" className="scroll-mt-20 bg-ink-deep py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-medium tracking-tight text-paper md:text-4xl">
              Get the picks that actually matter
            </h2>
            <p className="max-w-[600px] text-[15px] leading-relaxed text-paper/70 md:text-lg">
              One email a week: the latest reviews, buying guides, and verified price drops. No fluff.
            </p>
          </div>
          <div className="mx-auto w-full max-w-md space-y-2">
            <form className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-lg flex-1 border-white/15 bg-white/5 text-paper placeholder:text-faint focus-visible:ring-brand-on-dark"
                required
              />
              <Button type="submit" className="gap-1.5">
                <Mail className="h-4 w-4" />
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-faint">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

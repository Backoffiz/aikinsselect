import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function Newsletter() {
  return (
    <section className="bg-muted py-12 md:py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter text-muted-foreground md:text-4xl">Stay Updated</h2>
            <p className="max-w-[600px] text-slate-default md:text-xl">
              Subscribe to our newsletter for the latest product reviews, buying guides, and exclusive deals.
            </p>
          </div>
          <div className="mx-auto w-full max-w-md space-y-2">
            <form className="flex space-x-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="max-w-lg flex-1 bg-white border-slate-200 text-slate-default placeholder:text-slate-400 focus-visible:ring-primary"
                required
              />
              <Button type="submit" className="gap-1.5 bg-accent text-accent-foreground hover:bg-teal-dark">
                <Mail className="h-4 w-4" />
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-slate-default">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}


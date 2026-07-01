"use client"

import Link from "next/link"
import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { SavedBadge } from "@/components/saved/saved-badge"
import { FEATURES } from "@/lib/flags"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, X } from "lucide-react"

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand font-serif text-[16px] font-semibold leading-none text-white shadow-xs">
        A
      </span>
      <span className="font-serif text-[22px] font-semibold tracking-tight text-ink">Aikins Select</span>
    </span>
  )
}

export function SiteHeader() {
  const [showSearch, setShowSearch] = useState(false)

  const mobileLinks = [
    { href: "/reviews", label: "Reviews" },
    { href: "/categories", label: "Categories" },
    ...(FEATURES.saved ? [{ href: "/saved", label: "Saved" }] : []),
    { href: "/about", label: "About" },
    { href: "/disclosure", label: "Affiliate Disclosure" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/75">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-ml-2 text-body md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="border-r border-border bg-paper pr-0">
            <div className="px-7">
              <Link href="/" className="flex items-center">
                <Wordmark />
              </Link>
            </div>
            <div className="mt-8 px-7">
              <SearchBar className="mb-6" />
            </div>
            <nav className="grid gap-1 px-4">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-[15px] font-medium text-body transition-colors hover:bg-accent hover:text-ink"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="mr-8 flex items-center">
          <Wordmark />
        </Link>

        <nav className="hidden items-center gap-7 text-sm md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-0 text-sm font-semibold text-body hover:bg-transparent hover:text-brand">
                Reviews
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 border border-border bg-white">
              <DropdownMenuLabel className="text-muted-ink">By Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/categories/tech">Tech</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/home">Home</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/kitchen">Kitchen</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/gaming">Gaming</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/fitness">Fitness</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/beauty">Beauty</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link href="/reviews" className="font-semibold">All Reviews</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/categories" className="group relative text-sm font-semibold text-body transition-colors hover:text-brand">
            Categories
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-brand transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link href="/about" className="group relative text-sm font-semibold text-body transition-colors hover:text-brand">
            About
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 rounded-full bg-brand transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {showSearch ? (
            <div className="relative hidden items-center md:flex">
              <SearchBar className="w-[280px]" />
              <Button variant="ghost" size="icon" className="absolute right-0 text-faint" onClick={() => setShowSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="hidden text-body hover:text-brand md:flex" onClick={() => setShowSearch(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-body hover:text-brand md:hidden" onClick={() => setShowSearch(!showSearch)}>
            <Search className="h-5 w-5" />
          </Button>
          {FEATURES.saved && <SavedBadge />}
          {FEATURES.newsletter && (
            <Button asChild variant="ink" size="sm" className="hidden sm:inline-flex">
              <Link href="/#newsletter">Subscribe</Link>
            </Button>
          )}
        </div>
      </div>
      {showSearch && (
        <div className="container px-4 pb-4 md:hidden">
          <SearchBar />
        </div>
      )}
    </header>
  )
}

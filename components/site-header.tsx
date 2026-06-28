"use client"

import Link from "next/link"
import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
import { SavedBadge } from "@/components/saved/saved-badge"
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

export function SiteHeader() {
  const [showSearch, setShowSearch] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/80">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-body">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-paper border-r border-border pr-0">
            <div className="px-7">
              <Link href="/" className="flex items-center">
                <span className="font-serif text-2xl font-semibold text-ink">Aikins Select</span>
              </Link>
            </div>
            <div className="mt-8 px-7">
              <SearchBar className="mb-6" />
            </div>
            <nav className="grid gap-2 px-2">
              <Link href="/reviews" className="flex items-center gap-2 rounded-[3px] px-3 py-2 text-body hover:bg-accent hover:text-ink">Reviews</Link>
              <Link href="/categories" className="flex items-center gap-2 rounded-[3px] px-3 py-2 text-body hover:bg-accent hover:text-ink">Categories</Link>
              <Link href="/saved" className="flex items-center gap-2 rounded-[3px] px-3 py-2 text-body hover:bg-accent hover:text-ink">Saved</Link>
              <Link href="/about" className="flex items-center gap-2 rounded-[3px] px-3 py-2 text-body hover:bg-accent hover:text-ink">About</Link>
              <Link href="/disclosure" className="flex items-center gap-2 rounded-[3px] px-3 py-2 text-body hover:bg-accent hover:text-ink">Affiliate Disclosure</Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-8 flex items-center">
          <span className="font-serif text-2xl font-semibold tracking-tight text-ink">Aikins Select</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-0 text-sm font-semibold text-body hover:bg-transparent hover:text-brand">
                Reviews
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-white border border-border">
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
          <Link href="/categories" className="text-sm font-semibold text-body hover:text-brand">Categories</Link>
          <Link href="/about" className="text-sm font-semibold text-body hover:text-brand">About</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {showSearch ? (
            <div className="relative hidden md:flex items-center">
              <SearchBar className="w-[280px]" />
              <Button variant="ghost" size="icon" className="absolute right-0 text-faint" onClick={() => setShowSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="hidden md:flex text-body hover:text-brand" onClick={() => setShowSearch(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-body hover:text-brand" onClick={() => setShowSearch(!showSearch)}>
            <Search className="h-5 w-5" />
          </Button>
          <SavedBadge />
          <Button asChild variant="ink" size="sm" className="hidden sm:inline-flex">
            <Link href="/#newsletter">Subscribe</Link>
          </Button>
        </div>
      </div>
      {showSearch && (
        <div className="container md:hidden pb-4 px-4">
          <SearchBar />
        </div>
      )}
    </header>
  )
}

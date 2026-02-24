"use client"

import Link from "next/link"
import { useState } from "react"
import { SearchBar } from "@/components/search-bar"
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-slate-default">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-white border-r border-slate-200 pr-0">
            <div className="px-7">
              <Link href="/" className="flex items-center">
                <span className="text-xl font-bold text-primary">Aikins Select</span>
              </Link>
            </div>
            <div className="mt-8 px-7">
              <SearchBar className="mb-6" />
            </div>
            <nav className="grid gap-2 px-2">
              <Link href="/reviews" className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-default hover:text-primary hover:bg-muted">Reviews</Link>
              <Link href="/categories" className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-default hover:text-primary hover:bg-muted">Categories</Link>
              <Link href="/about" className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-default hover:text-primary hover:bg-muted">About</Link>
              <Link href="/disclosure" className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-default hover:text-primary hover:bg-muted">Affiliate Disclosure</Link>
            </nav>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-6 flex items-center">
          <span className="text-xl font-bold text-primary">Aikins Select</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-base text-slate-default hover:text-primary">
                Reviews
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-white border border-slate-200">
              <DropdownMenuLabel className="text-slate-default">By Category</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200" />
              <DropdownMenuItem asChild><Link href="/categories/tech" className="text-slate-default hover:text-primary">Tech</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/home" className="text-slate-default hover:text-primary">Home</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/kitchen" className="text-slate-default hover:text-primary">Kitchen</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/gaming" className="text-slate-default hover:text-primary">Gaming</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/fitness" className="text-slate-default hover:text-primary">Fitness</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/categories/beauty" className="text-slate-default hover:text-primary">Beauty</Link></DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200" />
              <DropdownMenuItem asChild><Link href="/reviews" className="text-slate-default hover:text-primary font-medium">All Reviews</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/categories" className="text-base text-slate-default hover:text-primary">Categories</Link>
          <Link href="/about" className="text-base text-slate-default hover:text-primary">About</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {showSearch ? (
            <div className="relative hidden md:flex items-center">
              <SearchBar className="w-[300px]" />
              <Button variant="ghost" size="icon" className="absolute right-0 text-slate-default" onClick={() => setShowSearch(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="hidden md:flex text-slate-default hover:text-primary" onClick={() => setShowSearch(true)}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="md:hidden text-slate-default hover:text-primary" onClick={() => setShowSearch(!showSearch)}>
            <Search className="h-5 w-5" />
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

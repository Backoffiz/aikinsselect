"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchBarProps {
  className?: string
}

export function SearchBar({ className }: SearchBarProps) {
  const [query, setQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log("Searching for:", query)
  }

  return (
    <form onSubmit={handleSearch} className={`relative ${className}`}>
      <Input
        type="search"
        placeholder="Search for products, brands, or categories..."
        className="pr-10 bg-white border-slate-200 text-slate-default placeholder:text-slate-400 focus-visible:ring-blue-default"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button
        type="submit"
        size="icon"
        variant="ghost"
        className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-blue-default"
      >
        <Search className="h-4 w-4" />
        <span className="sr-only">Search</span>
      </Button>
    </form>
  )
}


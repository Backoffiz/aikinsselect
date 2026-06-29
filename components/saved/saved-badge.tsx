'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useSaved } from '@/components/providers/saved-provider'

export function SavedBadge() {
  const { count, hydrated } = useSaved()
  const show = hydrated && count > 0

  return (
    <Link
      href="/saved"
      className="relative inline-flex items-center gap-1.5 rounded-[3px] border border-input px-3.5 py-2 text-[13px] font-semibold text-body transition-colors hover:border-ink hover:text-ink"
    >
      <Heart className="h-4 w-4" />
      <span className="hidden sm:inline">Saved</span>
      {show && (
        <span className="ml-0.5 inline-flex min-w-[18px] items-center justify-center rounded-pill bg-brand px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">
          {count}
        </span>
      )}
    </Link>
  )
}

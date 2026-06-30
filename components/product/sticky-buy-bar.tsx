'use client'

import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'
import { SaveHeartButton } from '@/components/saved/save-heart-button'
import { FEATURES } from '@/lib/flags'
import type { SavedItem } from '@/lib/saved/types'

interface StickyBuyBarProps {
  name: string
  image?: string
  rating?: number
  price: string
  affiliateUrl?: string
  item: SavedItem
}

export function StickyBuyBar({ name, image, rating, price, affiliateUrl, item }: StickyBuyBarProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-ink/95 backdrop-blur transition-transform duration-300 ${
        show ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="container flex items-center justify-between gap-4 px-4 py-3 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {image && (
            <span className="hidden h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-white sm:flex">
              <img src={image} alt="" className="max-h-full max-w-full object-contain" />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-paper">{name}</p>
            {rating ? (
              <span className="flex items-center gap-1 text-xs text-paper/70">
                <Star className="h-3 w-3 fill-brand-on-dark text-brand-on-dark" />
                {rating.toFixed(1)} / 5
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden font-serif text-lg font-semibold tabular-nums text-paper sm:inline">{price}</span>
          {FEATURES.saved && (
            <SaveHeartButton
              item={item}
              variant="inline"
              className="border-white/15 bg-white/5 px-3 py-2.5 text-paper hover:bg-white/10"
            />
          )}
          {affiliateUrl && (
            <a
              href={affiliateUrl}
              target="_blank"
              rel="noopener sponsored"
              className="whitespace-nowrap rounded-[3px] bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
            >
              Check price →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

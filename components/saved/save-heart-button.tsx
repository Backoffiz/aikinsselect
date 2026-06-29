'use client'

import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useSaved } from '@/components/providers/saved-provider'
import type { SavedItem } from '@/lib/saved/types'
import { cn } from '@/lib/utils'

interface SaveHeartButtonProps {
  item: SavedItem
  /** "circle" = floating heart on a card image; "inline" = button with label. */
  variant?: 'circle' | 'inline'
  className?: string
}

export function SaveHeartButton({ item, variant = 'circle', className }: SaveHeartButtonProps) {
  const { isSaved, toggle, hydrated } = useSaved()
  const saved = hydrated && isSaved(item.id)

  const onClick = (e: React.MouseEvent) => {
    // Card is wrapped in an <a>; don't navigate or bubble when saving.
    e.preventDefault()
    e.stopPropagation()
    const nowSaved = toggle(item)
    toast(nowSaved ? 'Saved' : 'Removed', {
      description: nowSaved ? `${item.name} added to your saved items.` : `${item.name} removed.`,
    })
  }

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from saved' : 'Save'}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-[3px] border px-4 py-3 text-sm font-bold transition-colors',
          saved
            ? 'border-deal/40 bg-deal/5 text-deal'
            : 'border-input text-body hover:bg-accent',
          className
        )}
      >
        <Heart className={cn('h-4 w-4', saved && 'fill-deal text-deal')} />
        {saved ? 'Saved' : 'Save to cart'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from saved' : 'Save'}
      className={cn(
        'absolute right-2.5 top-2.5 z-20 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.14)] transition-colors hover:bg-white',
        className
      )}
    >
      <Heart className={cn('h-[18px] w-[18px] text-ink', saved && 'fill-deal text-deal')} />
    </button>
  )
}

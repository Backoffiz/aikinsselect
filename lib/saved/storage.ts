import type { SavedItem, SavedList } from './types'

// localStorage keys kept identical to the handoff's cart.js for continuity.
export const ITEMS_KEY = 'aikins_cart_v1'
export const LISTS_KEY = 'aikins_lists_v1'

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T) : fallback
  } catch {
    return fallback
  }
}

export function readItems(): SavedItem[] {
  if (typeof window === 'undefined') return []
  return safeParse<SavedItem[]>(window.localStorage.getItem(ITEMS_KEY), [])
}

export function readLists(): SavedList[] {
  if (typeof window === 'undefined') return []
  return safeParse<SavedList[]>(window.localStorage.getItem(LISTS_KEY), [])
}

export function writeItems(items: SavedItem[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
}

export function writeLists(lists: SavedList[]): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LISTS_KEY, JSON.stringify(lists))
}

// Stable-ish id without Date.now()/Math.random() collisions across rapid calls.
let listSeq = 0
export function newListId(): string {
  listSeq += 1
  const t = typeof performance !== 'undefined' ? Math.floor(performance.now()) : 0
  return `list-${t}-${listSeq}`
}

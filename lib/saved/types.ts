// Saved / wishlist store types — reimplements the handoff's cart.js item & list shapes.
// price / wasPrice are DISPLAY strings (e.g. "$250").

export interface SavedItem {
  id: string
  name: string
  price: string
  wasPrice?: string
  sub?: string // category / subtitle
  swatch?: string // placeholder bg color (until real imagery)
  short?: string // short placeholder label
  // production additions (all serializable, passed from server cards):
  slug?: string // → /products/[slug]
  image?: string
  kind?: 'product' | 'experience' | 'gift-card'
}

export interface SavedList {
  id: string
  name: string
  itemIds: string[]
}

export interface SavedContextValue {
  hydrated: boolean // false during SSR + first client render
  items: SavedItem[]
  lists: SavedList[]
  count: number
  isSaved: (id: string) => boolean
  getItem: (id: string) => SavedItem | null
  toggle: (item: SavedItem) => boolean // returns new saved state; prunes from lists on remove
  remove: (id: string) => void
  createList: (name: string) => string
  renameList: (id: string, name: string) => void
  deleteList: (id: string) => void
  toggleInList: (listId: string, itemId: string) => void
  removeFromList: (listId: string, itemId: string) => void
  itemListIds: (itemId: string) => string[]
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Plus, Trash2, Check, X, Pencil, ListPlus } from 'lucide-react'
import { useSaved } from '@/components/providers/saved-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { SavedItem } from '@/lib/saved/types'

const ALL = 'all'

function toNumber(s?: string): number {
  if (!s) return 0
  const n = Number(s.replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function SavedClient() {
  const {
    hydrated,
    items,
    lists,
    remove,
    createList,
    renameList,
    deleteList,
    toggleInList,
    itemListIds,
  } = useSaved()

  const [selected, setSelected] = useState<string>(ALL)
  const [newListName, setNewListName] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  if (!hydrated) {
    return <div className="container px-4 py-16 text-center text-faint md:px-6">Loading your saved items…</div>
  }

  const activeList = lists.find((l) => l.id === selected) || null
  const visibleItems: SavedItem[] =
    selected === ALL ? items : items.filter((i) => activeList?.itemIds.includes(i.id))

  const total = visibleItems.reduce((sum, i) => sum + toNumber(i.price), 0)
  const savings = visibleItems.reduce((sum, i) => sum + Math.max(0, toNumber(i.wasPrice) - toNumber(i.price)), 0)

  const handleCreate = () => {
    if (!newListName.trim()) return
    const id = createList(newListName)
    setNewListName('')
    setSelected(id)
  }

  return (
    <div className="container px-4 py-10 md:px-6 md:py-12">
      <h1 className="font-serif text-4xl font-medium tracking-tight text-ink">Saved items</h1>
      <p className="mt-2 text-muted-ink">Your shortlist, organized into lists. Stored on this device.</p>

      {items.length === 0 ? (
        <div className="mt-12 rounded-[6px] border border-card-edge bg-white p-12 text-center">
          <Heart className="mx-auto h-8 w-8 text-faint" />
          <h2 className="mt-4 font-serif text-2xl font-medium text-ink">Nothing saved yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-muted-ink">
            Tap the heart on any product to save it here and build lists for later.
          </p>
          <Button asChild className="mt-6">
            <Link href="/categories">Browse products →</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[248px_1fr]">
          {/* Left rail */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-faint">Your lists</div>
            <nav className="space-y-1">
              <button
                onClick={() => { setSelected(ALL); setRenaming(false) }}
                className={`flex w-full items-center justify-between rounded-[3px] px-3 py-2 text-sm font-semibold transition-colors ${
                  selected === ALL ? 'bg-ink text-paper' : 'text-body hover:bg-accent'
                }`}
              >
                All saved <span className="text-xs opacity-70">{items.length}</span>
              </button>
              {lists.map((l) => (
                <button
                  key={l.id}
                  onClick={() => { setSelected(l.id); setRenaming(false) }}
                  className={`flex w-full items-center justify-between rounded-[3px] px-3 py-2 text-sm font-semibold transition-colors ${
                    selected === l.id ? 'bg-ink text-paper' : 'text-body hover:bg-accent'
                  }`}
                >
                  <span className="truncate">{l.name}</span>
                  <span className="text-xs opacity-70">{l.itemIds.length}</span>
                </button>
              ))}
            </nav>

            <div className="mt-4 flex gap-2">
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="New list"
                className="h-9 bg-white"
              />
              <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" onClick={handleCreate} aria-label="Create list">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-6 rounded-[6px] border border-card-edge bg-panel p-4 text-[13px] leading-relaxed text-muted-ink">
              <Heart className="mb-2 h-4 w-4 text-brand" />
              Saved items are kept on this device. Sign-in &amp; price alerts are coming soon.
            </div>
          </aside>

          {/* Main */}
          <div className="min-w-0">
            {/* List header */}
            <div className="flex items-center justify-between gap-3">
              {renaming && activeList ? (
                <div className="flex flex-1 items-center gap-2">
                  <Input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="h-9 max-w-xs bg-white"
                    autoFocus
                  />
                  <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => { renameList(activeList.id, renameValue); setRenaming(false) }}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-9 w-9" onClick={() => setRenaming(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <h2 className="font-serif text-2xl font-medium text-ink">
                  {selected === ALL ? 'All saved' : activeList?.name}
                </h2>
              )}
              {activeList && !renaming && (
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => { setRenameValue(activeList.name); setRenaming(true) }}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Rename
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-deal hover:text-deal"
                    onClick={() => { deleteList(activeList.id); setSelected(ALL) }}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              )}
            </div>

            {/* Summary strip */}
            {visibleItems.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[6px] border border-card-edge bg-white px-5 py-4">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-2xl font-semibold tabular-nums text-ink">${total.toFixed(2)}</span>
                  <span className="text-sm text-faint">{visibleItems.length} item{visibleItems.length === 1 ? '' : 's'}</span>
                  {savings > 0 && (
                    <span className="rounded-pill bg-savings-bg px-2.5 py-0.5 text-xs font-bold text-savings">
                      Save ${savings.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Items */}
            {visibleItems.length === 0 ? (
              <div className="mt-6 rounded-[6px] border border-dashed border-card-edge p-10 text-center text-muted-ink">
                This list is empty. Use “Add to list” on a saved item to fill it.
              </div>
            ) : (
              <div className="mt-4 divide-y divide-hairline overflow-hidden rounded-[6px] border border-card-edge bg-white">
                {visibleItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-4 py-4">
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-paper-deep"
                      style={item.swatch ? { background: item.swatch } : undefined}
                    >
                      {item.image ? (
                        <img src={item.image} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="px-1 text-center text-[10px] font-semibold text-muted-ink">{item.short || item.name.slice(0, 12)}</span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">
                        {item.slug ? (
                          <Link href={`/products/${item.slug}`} className="hover:text-brand">{item.name}</Link>
                        ) : (
                          item.name
                        )}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-sm">
                        <span className="font-serif font-semibold tabular-nums text-ink">{item.price}</span>
                        {item.wasPrice && <span className="text-xs text-faint line-through">{item.wasPrice}</span>}
                        {item.sub && <span className="text-xs text-faint">· {item.sub}</span>}
                      </div>
                    </div>

                    {/* Add to list popover */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button size="sm" variant="outline">
                          <ListPlus className="mr-1.5 h-3.5 w-3.5" /> Add to list
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-60 bg-white">
                        <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-faint">Add to list</div>
                        <AddToListBody itemId={item.id} lists={lists} itemListIds={itemListIds} toggleInList={toggleInList} createList={createList} />
                      </PopoverContent>
                    </Popover>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-faint hover:text-deal"
                      onClick={() => remove(item.id)}
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AddToListBody({
  itemId,
  lists,
  itemListIds,
  toggleInList,
  createList,
}: {
  itemId: string
  lists: { id: string; name: string; itemIds: string[] }[]
  itemListIds: (id: string) => string[]
  toggleInList: (listId: string, itemId: string) => void
  createList: (name: string) => string
}) {
  const [name, setName] = useState('')
  const inLists = itemListIds(itemId)

  return (
    <div className="space-y-2">
      {lists.length === 0 && <p className="text-sm text-muted-ink">No lists yet — create one below.</p>}
      {lists.map((l) => (
        <label key={l.id} className="flex cursor-pointer items-center gap-2.5 text-sm text-body">
          <Checkbox checked={inLists.includes(l.id)} onCheckedChange={() => toggleInList(l.id, itemId)} />
          <span className="truncate">{l.name}</span>
        </label>
      ))}
      <div className="mt-2 flex gap-2 border-t border-hairline pt-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && name.trim()) {
              const id = createList(name)
              toggleInList(id, itemId)
              setName('')
            }
          }}
          placeholder="New list"
          className="h-8 bg-white text-sm"
        />
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 shrink-0"
          onClick={() => {
            if (!name.trim()) return
            const id = createList(name)
            toggleInList(id, itemId)
            setName('')
          }}
          aria-label="Create and add"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

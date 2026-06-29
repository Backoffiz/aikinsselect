'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { SavedContextValue, SavedItem, SavedList } from '@/lib/saved/types'
import {
  ITEMS_KEY,
  LISTS_KEY,
  newListId,
  readItems,
  readLists,
  writeItems,
  writeLists,
} from '@/lib/saved/storage'

const SavedContext = createContext<SavedContextValue | null>(null)

export function SavedProvider({ children }: { children: React.ReactNode }) {
  // Empty + not-hydrated on server and first client paint → identical markup, no mismatch.
  const [items, setItems] = useState<SavedItem[]>([])
  const [lists, setLists] = useState<SavedList[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Load persisted state after mount.
  useEffect(() => {
    setItems(readItems())
    setLists(readLists())
    setHydrated(true)
  }, [])

  // Cross-tab sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === ITEMS_KEY) setItems(readItems())
      if (e.key === LISTS_KEY) setLists(readLists())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const persistItems = useCallback((next: SavedItem[]) => {
    setItems(next)
    writeItems(next)
  }, [])

  const persistLists = useCallback((next: SavedList[]) => {
    setLists(next)
    writeLists(next)
  }, [])

  const isSaved = useCallback((id: string) => items.some((i) => i.id === id), [items])

  const getItem = useCallback(
    (id: string) => items.find((i) => i.id === id) ?? null,
    [items]
  )

  const toggle = useCallback(
    (item: SavedItem) => {
      const exists = items.some((i) => i.id === item.id)
      if (exists) {
        persistItems(items.filter((i) => i.id !== item.id))
        // prune from every list
        persistLists(
          lists.map((l) => ({ ...l, itemIds: l.itemIds.filter((x) => x !== item.id) }))
        )
        return false
      }
      persistItems([...items, item])
      return true
    },
    [items, lists, persistItems, persistLists]
  )

  const remove = useCallback(
    (id: string) => {
      persistItems(items.filter((i) => i.id !== id))
      persistLists(lists.map((l) => ({ ...l, itemIds: l.itemIds.filter((x) => x !== id) })))
    },
    [items, lists, persistItems, persistLists]
  )

  const createList = useCallback(
    (name: string) => {
      const id = newListId()
      persistLists([...lists, { id, name: name.trim() || 'Untitled list', itemIds: [] }])
      return id
    },
    [lists, persistLists]
  )

  const renameList = useCallback(
    (id: string, name: string) => {
      persistLists(lists.map((l) => (l.id === id ? { ...l, name: name.trim() || l.name } : l)))
    },
    [lists, persistLists]
  )

  const deleteList = useCallback(
    (id: string) => {
      persistLists(lists.filter((l) => l.id !== id))
    },
    [lists, persistLists]
  )

  const toggleInList = useCallback(
    (listId: string, itemId: string) => {
      persistLists(
        lists.map((l) => {
          if (l.id !== listId) return l
          const has = l.itemIds.includes(itemId)
          return {
            ...l,
            itemIds: has ? l.itemIds.filter((x) => x !== itemId) : [...l.itemIds, itemId],
          }
        })
      )
    },
    [lists, persistLists]
  )

  const removeFromList = useCallback(
    (listId: string, itemId: string) => {
      persistLists(
        lists.map((l) =>
          l.id === listId ? { ...l, itemIds: l.itemIds.filter((x) => x !== itemId) } : l
        )
      )
    },
    [lists, persistLists]
  )

  const itemListIds = useCallback(
    (itemId: string) => lists.filter((l) => l.itemIds.includes(itemId)).map((l) => l.id),
    [lists]
  )

  const value = useMemo<SavedContextValue>(
    () => ({
      hydrated,
      items,
      lists,
      count: items.length,
      isSaved,
      getItem,
      toggle,
      remove,
      createList,
      renameList,
      deleteList,
      toggleInList,
      removeFromList,
      itemListIds,
    }),
    [
      hydrated,
      items,
      lists,
      isSaved,
      getItem,
      toggle,
      remove,
      createList,
      renameList,
      deleteList,
      toggleInList,
      removeFromList,
      itemListIds,
    ]
  )

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

export function useSaved(): SavedContextValue {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved must be used within <SavedProvider>')
  return ctx
}

// Ergonomic aliases (same context, different intent).
export const useSavedItems = useSaved
export const useLists = useSaved

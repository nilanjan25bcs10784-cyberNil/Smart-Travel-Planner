// src/hooks/usePacking.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getPackingItems, addPackingItem,
  updatePackingItem, deletePackingItem,
} from '../services/firestoreService'

export const usePacking = (tripId) => {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    try   { setItems(await getPackingItems(tripId)) }
    finally { setLoading(false) }
  }, [tripId])

  useEffect(() => { fetch() }, [fetch])

  const addItem      = async (item)           => { await addPackingItem(tripId, item);           fetch() }
  const togglePacked = async (id, packed)     => { await updatePackingItem(tripId, id, { packed }); fetch() }
  const editItem     = async (id, data)       => { await updatePackingItem(tripId, id, data);    fetch() }
  const removeItem   = async (id)             => { await deletePackingItem(tripId, id);          fetch() }

  const byCategory = useMemo(() =>
    items.reduce((acc, item) => {
      const cat = item.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {}), [items])

  const progress = useMemo(() => {
    if (!items.length) return 0
    return Math.round((items.filter(i => i.packed).length / items.length) * 100)
  }, [items])

  return { items, byCategory, progress, loading, fetch, addItem, togglePacked, editItem, removeItem }
}

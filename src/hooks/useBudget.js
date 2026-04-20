// src/hooks/useBudget.js
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  getBudgetItems, addBudgetItem,
  updateBudgetItem, deleteBudgetItem,
} from '../services/firestoreService'

export const useBudget = (tripId) => {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    try   { setItems(await getBudgetItems(tripId)) }
    finally { setLoading(false) }
  }, [tripId])

  useEffect(() => { fetch() }, [fetch])

  const addItem    = async (item)     => { await addBudgetItem(tripId, item);         fetch() }
  const editItem   = async (id, data) => { await updateBudgetItem(tripId, id, data);  fetch() }
  const removeItem = async (id)       => { await deleteBudgetItem(tripId, id);        fetch() }

  // Derived stats — memoised to avoid needless recalculation
  const stats = useMemo(() => {
    const total    = items.reduce((s, i) => s + Number(i.amount || 0), 0)
    const byCategory = items.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + Number(i.amount || 0)
      return acc
    }, {})
    return { total, byCategory }
  }, [items])

  return { items, loading, fetch, addItem, editItem, removeItem, stats }
}

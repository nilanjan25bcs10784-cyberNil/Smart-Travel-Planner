// src/hooks/useItinerary.js
import { useState, useEffect, useCallback } from 'react'
import {
  getItinerary, addItineraryItem,
  updateItineraryItem, deleteItineraryItem,
} from '../services/firestoreService'

export const useItinerary = (tripId) => {
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    try   { setItems(await getItinerary(tripId)) }
    finally { setLoading(false) }
  }, [tripId])

  useEffect(() => { fetch() }, [fetch])

  const addItem    = async (item)         => { await addItineraryItem(tripId, item);         fetch() }
  const editItem   = async (id, data)     => { await updateItineraryItem(tripId, id, data);  fetch() }
  const removeItem = async (id)           => { await deleteItineraryItem(tripId, id);        fetch() }

  // Group items by day for easy rendering
  const byDay = items.reduce((acc, item) => {
    const day = item.day || 1
    if (!acc[day]) acc[day] = []
    acc[day].push(item)
    return acc
  }, {})

  return { items, byDay, loading, fetch, addItem, editItem, removeItem }
}

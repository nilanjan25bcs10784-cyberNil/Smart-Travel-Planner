// src/hooks/useTrips.js
import { useState, useEffect, useCallback } from 'react'
import { getTrips, createTrip, updateTrip, deleteTrip } from '../services/firestoreService'
import { useAuth } from '../context/AuthContext'

export const useTrips = () => {
  const { user }              = useAuth()
  const [trips, setTrips]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const fetchTrips = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getTrips(user.uid)
      setTrips(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchTrips() }, [fetchTrips])

  const addTrip = useCallback(async (tripData) => {
    const id = await createTrip(user.uid, tripData)
    await fetchTrips()
    return id
  }, [user, fetchTrips])

  const editTrip = useCallback(async (id, data) => {
    await updateTrip(id, data)
    await fetchTrips()
  }, [fetchTrips])

  const removeTrip = useCallback(async (id) => {
    await deleteTrip(id)
    await fetchTrips()
  }, [fetchTrips])

  return { trips, loading, error, fetchTrips, addTrip, editTrip, removeTrip }
}

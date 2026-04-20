// src/context/TripContext.jsx
import { createContext, useContext, useState, useCallback } from 'react'

const TripContext = createContext(null)

export const useTripContext = () => {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTripContext must be used within TripProvider')
  return ctx
}

export const TripProvider = ({ children }) => {
  const [activeTrip, setActiveTrip]   = useState(null)
  const [trips, setTrips]             = useState([])
  const [refreshKey, setRefreshKey]   = useState(0)

  const selectTrip = useCallback((trip) => setActiveTrip(trip), [])
  const clearTrip  = useCallback(() => setActiveTrip(null), [])
  const triggerRefresh = useCallback(() => setRefreshKey(k => k + 1), [])

  return (
    <TripContext.Provider value={{ activeTrip, trips, setTrips, selectTrip, clearTrip, refreshKey, triggerRefresh }}>
      {children}
    </TripContext.Provider>
  )
}

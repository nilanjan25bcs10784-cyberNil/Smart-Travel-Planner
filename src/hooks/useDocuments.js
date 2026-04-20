// src/hooks/useDocuments.js
import { useState, useEffect, useCallback } from 'react'
import {
  getDocuments, addDocument,
  updateDocument, deleteDocument,
} from '../services/firestoreService'

export const useDocuments = (tripId) => {
  const [docs, setDocs]       = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!tripId) return
    setLoading(true)
    try   { setDocs(await getDocuments(tripId)) }
    finally { setLoading(false) }
  }, [tripId])

  useEffect(() => { fetch() }, [fetch])

  const addDoc    = async (data)       => { await addDocument(tripId, data);        fetch() }
  const editDoc   = async (id, data)   => { await updateDocument(tripId, id, data); fetch() }
  const removeDoc = async (id)         => { await deleteDocument(tripId, id);       fetch() }

  return { docs, loading, fetch, addDoc, editDoc, removeDoc }
}

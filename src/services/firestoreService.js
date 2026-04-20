// src/services/firestoreService.js
import {
  collection, doc,
  addDoc, getDoc, getDocs, updateDoc, deleteDoc,
  query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ─── Trips ────────────────────────────────────────────────────────────────────

export const createTrip = async (userId, tripData) => {
  const ref = await addDoc(collection(db, 'trips'), {
    ...tripData,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export const getTrips = async (userId) => {
  const q = query(
    collection(db, 'trips'),
    where('userId', '==', userId),
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getTrip = async (tripId) => {
  const snap = await getDoc(doc(db, 'trips', tripId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

export const updateTrip = async (tripId, data) => {
  await updateDoc(doc(db, 'trips', tripId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const deleteTrip = async (tripId) => {
  await deleteDoc(doc(db, 'trips', tripId))
}

// ─── Itinerary Items ──────────────────────────────────────────────────────────

export const addItineraryItem = async (tripId, item) => {
  const ref = await addDoc(collection(db, 'trips', tripId, 'itinerary'), {
    ...item,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getItinerary = async (tripId) => {
  const snap = await getDocs(collection(db, 'trips', tripId, 'itinerary'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateItineraryItem = async (tripId, itemId, data) => {
  await updateDoc(doc(db, 'trips', tripId, 'itinerary', itemId), data)
}

export const deleteItineraryItem = async (tripId, itemId) => {
  await deleteDoc(doc(db, 'trips', tripId, 'itinerary', itemId))
}

// ─── Budget Items ─────────────────────────────────────────────────────────────

export const addBudgetItem = async (tripId, item) => {
  const ref = await addDoc(collection(db, 'trips', tripId, 'budget'), {
    ...item,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getBudgetItems = async (tripId) => {
  const snap = await getDocs(collection(db, 'trips', tripId, 'budget'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateBudgetItem = async (tripId, itemId, data) => {
  await updateDoc(doc(db, 'trips', tripId, 'budget', itemId), data)
}

export const deleteBudgetItem = async (tripId, itemId) => {
  await deleteDoc(doc(db, 'trips', tripId, 'budget', itemId))
}

// ─── Packing Items ────────────────────────────────────────────────────────────

export const addPackingItem = async (tripId, item) => {
  const ref = await addDoc(collection(db, 'trips', tripId, 'packing'), {
    ...item,
    packed: false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getPackingItems = async (tripId) => {
  const snap = await getDocs(collection(db, 'trips', tripId, 'packing'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updatePackingItem = async (tripId, itemId, data) => {
  await updateDoc(doc(db, 'trips', tripId, 'packing', itemId), data)
}

export const deletePackingItem = async (tripId, itemId) => {
  await deleteDoc(doc(db, 'trips', tripId, 'packing', itemId))
}

// ─── Travel Documents ─────────────────────────────────────────────────────────

export const addDocument = async (tripId, docData) => {
  const ref = await addDoc(collection(db, 'trips', tripId, 'documents'), {
    ...docData,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export const getDocuments = async (tripId) => {
  const snap = await getDocs(collection(db, 'trips', tripId, 'documents'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateDocument = async (tripId, docId, data) => {
  await updateDoc(doc(db, 'trips', tripId, 'documents', docId), data)
}

export const deleteDocument = async (tripId, docId) => {
  await deleteDoc(doc(db, 'trips', tripId, 'documents', docId))
}
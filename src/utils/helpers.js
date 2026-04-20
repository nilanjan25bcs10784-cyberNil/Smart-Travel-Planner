// src/utils/helpers.js
import { format, differenceInDays, parseISO } from 'date-fns'

export const formatDate = (date) => {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, 'dd MMM yyyy')
  } catch { return '—' }
}

export const tripDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0
  try {
    return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1
  } catch { return 0 }
}

export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

export const BUDGET_CATEGORIES = [
  'Flights', 'Accommodation', 'Food', 'Transport',
  'Activities', 'Shopping', 'Visa & Docs', 'Insurance', 'Miscellaneous',
]

export const PACKING_CATEGORIES = [
  'Clothing', 'Toiletries', 'Electronics', 'Documents',
  'Medications', 'Accessories', 'Footwear', 'Other',
]

export const DOCUMENT_TYPES = [
  'Passport', 'Visa', 'Flight Ticket', 'Hotel Booking',
  'Travel Insurance', 'ID Card', 'Vaccination', 'Other',
]

export const TRIP_TYPES = [
  'Beach', 'Mountain', 'City', 'Adventure',
  'Cultural', 'Backpacking', 'Family', 'Honeymoon', 'Business',
]

export const STATUS_COLORS = {
  upcoming:   'bg-ocean-100 text-ocean-700',
  ongoing:    'bg-forest-100 text-forest-700',
  completed:  'bg-sand-100 text-sand-700',
  cancelled:  'bg-red-100 text-red-600',
}

export const getTripStatus = (startDate, endDate) => {
  const now   = new Date()
  const start = parseISO(startDate)
  const end   = parseISO(endDate)
  if (now < start) return 'upcoming'
  if (now > end)   return 'completed'
  return 'ongoing'
}

export const CATEGORY_ICONS = {
  Flights:        '✈️',
  Accommodation:  '🏨',
  Food:           '🍜',
  Transport:      '🚌',
  Activities:     '🎭',
  Shopping:       '🛍️',
  'Visa & Docs':  '📋',
  Insurance:      '🛡️',
  Miscellaneous:  '💰',
}

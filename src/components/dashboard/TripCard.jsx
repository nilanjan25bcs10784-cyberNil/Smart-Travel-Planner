// src/components/dashboard/TripCard.jsx
import { MapPin, Calendar, Pencil, Trash2 } from 'lucide-react'
import { formatDate, tripDuration, STATUS_COLORS, getTripStatus } from '../../utils/helpers'
import { Badge, Button } from '../ui'
import { useTripContext } from '../../context/TripContext'

const COVERS = [
  'from-sand-400 to-sand-600',
  'from-ocean-400 to-ocean-600',
  'from-forest-400 to-forest-600',
  'from-dusk-400 to-dusk-600',
]

export default function TripCard({ trip, onEdit, onDelete }) {
  const { activeTrip, selectTrip } = useTripContext()
  const isActive = activeTrip?.id === trip.id
  const status   = getTripStatus(trip.startDate, trip.endDate)
  const duration = tripDuration(trip.startDate, trip.endDate)
  const coverIdx = trip.name.charCodeAt(0) % COVERS.length

  return (
    <div
      onClick={() => selectTrip(trip)}
      className={`card-hover overflow-hidden flex flex-col gap-0 p-0 transition-all duration-300 ${isActive ? 'ring-2 ring-sand-400 ring-offset-2' : ''}`}
    >
      {/* Cover gradient */}
      <div className={`h-28 bg-gradient-to-br ${COVERS[coverIdx]} flex items-end p-4 relative`}>
        <span className="text-4xl absolute top-4 right-4 opacity-60">
          {trip.tripType === 'Beach' ? '🏖️' : trip.tripType === 'Mountain' ? '⛰️' :
           trip.tripType === 'City' ? '🏙️' : trip.tripType === 'Adventure' ? '🧗' : '✈️'}
        </span>
        {isActive && (
          <span className="bg-white/90 text-sand-700 text-xs font-semibold px-2 py-0.5 rounded-full">
            ✓ Active
          </span>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-semibold text-lg text-gray-800 leading-tight">{trip.name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-400 mt-0.5">
              <MapPin size={13} />
              <span>{trip.destination}</span>
            </div>
          </div>
          <Badge color={status === 'upcoming' ? 'ocean' : status === 'ongoing' ? 'forest' : 'sand'}>
            {status}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Calendar size={13} />
          <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
        </div>
        <p className="text-xs text-sand-500 font-medium">{duration} day{duration !== 1 ? 's' : ''}</p>

        {trip.budget && (
          <p className="text-xs text-gray-400">Budget: <span className="font-semibold text-gray-600">₹{Number(trip.budget).toLocaleString('en-IN')}</span></p>
        )}

        <div className="flex gap-2 mt-auto pt-2 border-t border-sand-50">
          <Button variant="ghost" size="sm" className="flex-1" onClick={(e) => { e.stopPropagation(); onEdit(trip) }}>
            <Pencil size={13} /> Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-50 hover:text-red-500" onClick={(e) => { e.stopPropagation(); onDelete(trip) }}>
            <Trash2 size={13} />
          </Button>
        </div>
      </div>
    </div>
  )
}

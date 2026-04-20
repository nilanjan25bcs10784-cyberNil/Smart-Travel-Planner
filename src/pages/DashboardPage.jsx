// src/pages/DashboardPage.jsx
import { useState, useMemo, lazy, Suspense } from 'react'
import { Plus, Search, Map, Wallet, Package, FileText, TrendingUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTripContext } from '../context/TripContext'
import { useTrips } from '../hooks/useTrips'
import { Button, Spinner, EmptyState, ConfirmDialog } from '../components/ui'
import TripCard from '../components/dashboard/TripCard'
import toast from 'react-hot-toast'
import { formatDate, tripDuration } from '../utils/helpers'

const TripForm = lazy(() => import('../components/dashboard/TripForm'))

export default function DashboardPage() {
  const { user }                               = useAuth()
  const { activeTrip, selectTrip }             = useTripContext()
  const { trips, loading, addTrip, editTrip, removeTrip } = useTrips()

  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')
  const [showForm, setShowForm]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [delLoading, setDelLoading]     = useState(false)

  const greetingName = user?.displayName?.split(' ')[0] || 'Traveller'

  const filtered = useMemo(() => {
    return trips.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
                          t.destination.toLowerCase().includes(search.toLowerCase())
      if (filter === 'all') return matchSearch
      const now   = new Date()
      const start = new Date(t.startDate)
      const end   = new Date(t.endDate)
      if (filter === 'upcoming')  return matchSearch && now < start
      if (filter === 'ongoing')   return matchSearch && now >= start && now <= end
      if (filter === 'completed') return matchSearch && now > end
      return matchSearch
    })
  }, [trips, search, filter])

  const stats = useMemo(() => ({
    total:     trips.length,
    upcoming:  trips.filter(t => new Date() < new Date(t.startDate)).length,
    totalDays: trips.reduce((s, t) => s + tripDuration(t.startDate, t.endDate), 0),
    totalBudget: trips.reduce((s, t) => s + Number(t.budget || 0), 0),
  }), [trips])

  const handleCreate = async (data) => {
    try {
      const id = await addTrip(data)
      toast.success('Trip created! 🗺️')
      setShowForm(false)
    } catch { toast.error('Failed to create trip') }
  }

  const handleEdit = async (data) => {
    try {
      await editTrip(editTarget.id, data)
      toast.success('Trip updated!')
      setEditTarget(null)
    } catch { toast.error('Failed to update trip') }
  }

  const handleDelete = async () => {
    setDelLoading(true)
    try {
      await removeTrip(deleteTarget.id)
      if (activeTrip?.id === deleteTarget.id) selectTrip(null)
      toast.success('Trip deleted')
      setDeleteTarget(null)
    } catch { toast.error('Failed to delete') }
    finally { setDelLoading(false) }
  }

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">
            Good day, {greetingName} ✈️
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {trips.length === 0 ? 'Start planning your first adventure' : `You have ${stats.upcoming} upcoming trip${stats.upcoming !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          <Plus size={18} /> New Trip
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Map,       label: 'Total Trips',     value: stats.total,                color: 'text-sand-500',   bg: 'bg-sand-50' },
          { icon: TrendingUp,label: 'Upcoming',        value: stats.upcoming,             color: 'text-ocean-500',  bg: 'bg-ocean-50' },
          { icon: Package,   label: 'Days Planned',    value: stats.totalDays,            color: 'text-forest-500', bg: 'bg-forest-50' },
          { icon: Wallet,    label: 'Total Budget',    value: `₹${(stats.totalBudget/1000).toFixed(0)}k`, color: 'text-dusk-500', bg: 'bg-dusk-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-gray-800">{value}</p>
              <p className="text-xs text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active trip banner */}
      {activeTrip && (
        <div className="mb-6 p-4 bg-gradient-to-r from-sand-500 to-sand-400 rounded-2xl flex items-center justify-between text-white animate-slide-up">
          <div>
            <p className="text-sand-100 text-xs uppercase tracking-wide font-medium mb-0.5">Currently Planning</p>
            <h3 className="font-display text-xl font-bold">{activeTrip.name}</h3>
            <p className="text-sand-100 text-sm">{activeTrip.destination} · {formatDate(activeTrip.startDate)}</p>
          </div>
          <div className="text-5xl opacity-60">🗺️</div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search trips…"
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'upcoming', 'ongoing', 'completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === f ? 'bg-sand-500 text-white' : 'bg-white text-gray-400 border border-sand-100 hover:border-sand-300'}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Trip Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="🗺️"
          title={trips.length === 0 ? 'No trips yet' : 'No trips found'}
          description={trips.length === 0 ? 'Create your first trip to get started' : 'Try a different search or filter'}
          action={trips.length === 0 && <Button onClick={() => setShowForm(true)}><Plus size={16}/> Create First Trip</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              onEdit={(t) => setEditTarget(t)}
              onDelete={(t) => setDeleteTarget(t)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        <TripForm isOpen={showForm}       onClose={() => setShowForm(false)}    onSubmit={handleCreate} />
        <TripForm isOpen={!!editTarget}   onClose={() => setEditTarget(null)}   onSubmit={handleEdit}  initial={editTarget} />
      </Suspense>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={delLoading}
        title="Delete Trip"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}

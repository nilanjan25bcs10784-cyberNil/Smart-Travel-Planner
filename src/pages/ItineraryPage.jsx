// src/pages/ItineraryPage.jsx
import { useState, useCallback, memo } from 'react'
import { Plus, Clock, MapPin, Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useItinerary } from '../hooks/useItinerary'
import { Button, Modal, Input, Select, Spinner, EmptyState, ConfirmDialog } from '../components/ui'
import { formatCurrency, tripDuration } from '../utils/helpers'
import toast from 'react-hot-toast'

const ACTIVITY_TYPES = ['Sightseeing', 'Food', 'Transport', 'Accommodation', 'Activity', 'Shopping', 'Rest', 'Other']
const EMPTY_ITEM = { day: 1, time: '', activity: '', location: '', type: 'Sightseeing', cost: '', notes: '' }

const ActivityForm = memo(({ form, onChange, onSubmit, onClose, saving, isEdit, days }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <Select label="Day *" value={form.day} onChange={onChange('day')}>
        {Array.from({ length: days }, (_, i) => <option key={i + 1} value={i + 1}>Day {i + 1}</option>)}
      </Select>
      <Input label="Time" type="time" value={form.time} onChange={onChange('time')} />
    </div>
    <Input label="Activity *" value={form.activity} onChange={onChange('activity')}
      placeholder="e.g. Visit Basilica of Bom Jesus" required autoFocus />
    <div className="grid grid-cols-2 gap-3">
      <Input label="Location" value={form.location} onChange={onChange('location')} placeholder="e.g. Old Goa" />
      <Select label="Type" value={form.type} onChange={onChange('type')}>
        {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
      </Select>
    </div>
    <Input label="Estimated Cost (₹)" type="number" value={form.cost} onChange={onChange('cost')} placeholder="0" />
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-600">Notes</label>
      <textarea rows={3} value={form.notes} onChange={onChange('notes')}
        placeholder="Entry fee, timings, tips…" className="input-field resize-none" />
    </div>
    <div className="flex gap-3 justify-end">
      <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
      <Button type="submit" loading={saving}>{isEdit ? 'Update' : 'Add Activity'}</Button>
    </div>
  </form>
))

function ActivityItem({ item, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const typeColors = {
    Sightseeing: 'bg-ocean-100 text-ocean-700', Food: 'bg-sand-100 text-sand-700',
    Transport: 'bg-gray-100 text-gray-600', Accommodation: 'bg-dusk-100 text-dusk-700',
    Activity: 'bg-forest-100 text-forest-700', Shopping: 'bg-red-100 text-red-600',
    Rest: 'bg-blue-50 text-blue-500', Other: 'bg-gray-100 text-gray-500',
  }
  return (
    <div className="bg-white rounded-xl border border-sand-100 overflow-hidden hover:shadow-sm transition-all">
      <div className="flex items-center gap-3 p-4">
        <div className="flex flex-col items-center text-sand-400 w-12 flex-shrink-0">
          <Clock size={14} />
          <span className="text-xs font-mono mt-0.5">{item.time || '--:--'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium text-gray-800 text-sm">{item.activity}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[item.type] || typeColors.Other}`}>{item.type}</span>
          </div>
          {item.location && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><MapPin size={11} /> {item.location}</div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {item.cost > 0 && <span className="text-xs font-semibold text-forest-600 bg-forest-50 px-2 py-0.5 rounded-lg">{formatCurrency(item.cost)}</span>}
          <button onClick={() => setExpanded(e => !e)} className="p-1 text-gray-300 hover:text-gray-500">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onEdit(item)} className="p-1 text-gray-300 hover:text-sand-500"><Pencil size={14} /></button>
          <button onClick={() => onDelete(item)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 size={14} /></button>
        </div>
      </div>
      {expanded && item.notes && (
        <div className="px-4 pb-3"><p className="text-xs text-gray-400 bg-sand-50 rounded-lg p-2.5">{item.notes}</p></div>
      )}
    </div>
  )
}

export default function ItineraryPage() {
  const { activeTrip } = useTripContext()
  const { items, byDay, loading, addItem, editItem, removeItem } = useItinerary(activeTrip?.id)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_ITEM)
  const [saving, setSaving] = useState(false)
  const days = activeTrip ? tripDuration(activeTrip.startDate, activeTrip.endDate) : 0

  const handleChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }, [])

  const openAdd = useCallback((day = 1) => { setForm({ ...EMPTY_ITEM, day }); setShowForm(true) }, [])
  const openEdit = useCallback((item) => {
    setEditTarget(item)
    setForm({
      day: item.day, time: item.time, activity: item.activity,
      location: item.location || '', type: item.type, cost: item.cost || '', notes: item.notes || ''
    })
  }, [])
  const handleClose = useCallback(() => { setShowForm(false); setEditTarget(null); setForm(EMPTY_ITEM) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editTarget) {
        await editItem(editTarget.id, { ...form, cost: Number(form.cost) || 0 })
        toast.success('Activity updated!'); setEditTarget(null)
      } else {
        await addItem({ ...form, cost: Number(form.cost) || 0 })
        toast.success('Activity added!'); setShowForm(false)
      }
      setForm(EMPTY_ITEM)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await removeItem(deleteTarget.id); toast.success('Activity removed'); setDeleteTarget(null) }
    catch { toast.error('Failed to delete') }
  }

  const totalCost = items.reduce((s, i) => s + Number(i.cost || 0), 0)

  if (!activeTrip) return (
    <div className="page-container">
      <EmptyState icon="🗺️" title="No active trip" description="Select a trip from the Dashboard to manage its itinerary." />
    </div>
  )

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Itinerary</h1>
          <p className="text-sm text-gray-400 mt-0.5">{activeTrip.name} · {activeTrip.destination} · {days} days</p>
        </div>
        <div className="flex items-center gap-3">
          {totalCost > 0 && <span className="text-sm text-gray-500">Est. cost: <strong className="text-gray-700">{formatCurrency(totalCost)}</strong></span>}
          <Button onClick={() => openAdd()}><Plus size={16} /> Add Activity</Button>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        : items.length === 0 ? (
          <EmptyState icon="🗓️" title="Itinerary is empty" description="Add activities day by day to build your perfect trip plan."
            action={<Button onClick={() => openAdd()}><Plus size={16} /> Add First Activity</Button>} />
        ) : (
          <div className="space-y-6">
            {Array.from({ length: days }, (_, i) => i + 1).map(day => (
              <div key={day} className="animate-fade-in">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-sand-500 text-white flex items-center justify-center font-display font-bold text-sm flex-shrink-0">{day}</div>
                  <div>
                    <h3 className="font-semibold text-gray-700">Day {day}</h3>
                    {byDay[day]?.length > 0 && (
                      <p className="text-xs text-gray-400">{byDay[day].length} activit{byDay[day].length === 1 ? 'y' : 'ies'} · {formatCurrency(byDay[day].reduce((s, i) => s + Number(i.cost || 0), 0))}</p>
                    )}
                  </div>
                </div>
                {byDay[day]?.length > 0 ? (
                  <div className="space-y-2 pl-1">
                    {byDay[day].sort((a, b) => (a.time || '').localeCompare(b.time || '')).map(item => (
                      <ActivityItem key={item.id} item={item} onEdit={openEdit} onDelete={setDeleteTarget} />
                    ))}
                  </div>
                ) : (
                  <button onClick={() => openAdd(day)}
                    className="w-full border-2 border-dashed border-sand-200 rounded-xl py-4 text-sm text-sand-400 hover:border-sand-400 hover:text-sand-500 transition-colors">
                    + Add activity for Day {day}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      <Modal isOpen={showForm} onClose={handleClose} title="Add Activity">
        <ActivityForm form={form} onChange={handleChange} onSubmit={handleSubmit} onClose={handleClose} saving={saving} isEdit={false} days={days} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={handleClose} title="Edit Activity">
        <ActivityForm form={form} onChange={handleChange} onSubmit={handleSubmit} onClose={handleClose} saving={saving} isEdit={true} days={days} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove Activity" message={`Remove "${deleteTarget?.activity}"?`} />
    </div>
  )
}

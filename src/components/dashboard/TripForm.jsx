// src/components/dashboard/TripForm.jsx
import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select } from '../ui'
import { TRIP_TYPES } from '../../utils/helpers'

const EMPTY = { name: '', destination: '', startDate: '', endDate: '', budget: '', tripType: 'City', notes: '' }

export default function TripForm({ isOpen, onClose, onSubmit, initial }) {
  const [form, setForm]   = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm(initial ? { ...EMPTY, ...initial } : EMPTY)
  }, [initial, isOpen])

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await onSubmit(form) }
    finally { setLoading(false) }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initial ? 'Edit Trip' : 'New Trip'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Trip Name *" value={form.name} onChange={set('name')} placeholder="e.g. Goa Winter Escape" required />
        <Input label="Destination *" value={form.destination} onChange={set('destination')} placeholder="e.g. Goa, India" required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start Date *" type="date" value={form.startDate} onChange={set('startDate')} required />
          <Input label="End Date *" type="date" value={form.endDate} onChange={set('endDate')} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Total Budget (₹)" type="number" value={form.budget} onChange={set('budget')} placeholder="50000" />
          <Select label="Trip Type" value={form.tripType} onChange={set('tripType')}>
            {TRIP_TYPES.map(t => <option key={t}>{t}</option>)}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">Notes</label>
          <textarea rows={2} value={form.notes} onChange={set('notes')}
            className="input-field resize-none" placeholder="Any extra info…" />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" loading={loading}>{initial ? 'Save Changes' : 'Create Trip'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// src/pages/PackingPage.jsx
import { useState, useCallback, memo } from 'react'
import { Plus, Trash2, Pencil, CheckCircle2, Circle } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { usePacking } from '../hooks/usePacking'
import { Button, Modal, Input, Select, Spinner, EmptyState, ConfirmDialog, ProgressBar, Badge } from '../components/ui'
import { PACKING_CATEGORIES } from '../utils/helpers'
import toast from 'react-hot-toast'

const EMPTY = { item: '', category: 'Clothing', essential: false, quantity: 1 }

const PackingForm = memo(({ form, onChange, onSubmit, onClose, saving, isEdit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <Input
      label="Item Name *"
      value={form.item}
      onChange={onChange('item')}
      placeholder="e.g. Sunscreen SPF 50"
      required
      autoFocus
    />
    <div className="grid grid-cols-2 gap-3">
      <Select label="Category" value={form.category} onChange={onChange('category')}>
        {PACKING_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </Select>
      <Input label="Quantity" type="number" min="1" value={form.quantity} onChange={onChange('quantity')} />
    </div>
    <label className="flex items-center gap-3 cursor-pointer">
      <input type="checkbox" checked={form.essential} onChange={onChange('essential')} className="w-4 h-4 accent-sand-500" />
      <span className="text-sm font-medium text-gray-600">Mark as essential</span>
    </label>
    <div className="flex gap-3 justify-end">
      <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
      <Button type="submit" loading={saving}>{isEdit ? 'Update' : 'Add Item'}</Button>
    </div>
  </form>
))

export default function PackingPage() {
  const { activeTrip } = useTripContext()
  const { items, byCategory, progress, loading, addItem, togglePacked, editItem, removeItem } = usePacking(activeTrip?.id)

  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm]                 = useState(EMPTY)
  const [saving, setSaving]             = useState(false)
  const [filter, setFilter]             = useState('all')

  const handleChange = useCallback((field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(prev => ({ ...prev, [field]: val }))
  }, [])

  const openAdd = useCallback(() => { setForm(EMPTY); setShowForm(true) }, [])

  const openEdit = useCallback((item) => {
    setEditTarget(item)
    setForm({ item: item.item, category: item.category, essential: item.essential || false, quantity: item.quantity || 1 })
  }, [])

  const handleClose = useCallback(() => { setShowForm(false); setEditTarget(null); setForm(EMPTY) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editTarget) {
        await editItem(editTarget.id, form); toast.success('Updated!'); setEditTarget(null)
      } else {
        await addItem(form); toast.success('Item added!'); setShowForm(false)
      }
      setForm(EMPTY)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await removeItem(deleteTarget.id); toast.success('Removed'); setDeleteTarget(null) }
    catch { toast.error('Failed to delete') }
  }

  if (!activeTrip) return (
    <div className="page-container">
      <EmptyState icon="🎒" title="No active trip" description="Select a trip from the Dashboard to manage its packing list." />
    </div>
  )

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Packing List</h1>
          <p className="text-sm text-gray-400 mt-0.5">{activeTrip.name} · {items.length} items</p>
        </div>
        <Button onClick={openAdd}><Plus size={16}/> Add Item</Button>
      </div>

      {items.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-700">Packing Progress</p>
              <p className="text-sm text-gray-400">{items.filter(i => i.packed).length} of {items.length} packed</p>
            </div>
            <span className={`font-display text-3xl font-bold ${progress === 100 ? 'text-forest-500' : 'text-sand-500'}`}>{progress}%</span>
          </div>
          <ProgressBar value={progress} max={100} color={progress === 100 ? 'forest' : 'sand'} />
          {progress === 100 && <p className="text-center text-forest-600 text-sm font-medium mt-3">🎉 You're all packed and ready to go!</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'All',       value: 'all',       count: items.length },
          { label: 'Unpacked',  value: 'unpacked',  count: items.filter(i => !i.packed).length },
          { label: 'Packed',    value: 'packed',    count: items.filter(i => i.packed).length },
          { label: 'Essential', value: 'essential', count: items.filter(i => i.essential).length },
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border
              ${filter === f.value ? 'bg-sand-500 text-white border-sand-500' : 'bg-white text-gray-500 border-sand-100 hover:border-sand-300'}`}>
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-md text-xs ${filter === f.value ? 'bg-white/20' : 'bg-sand-100 text-sand-600'}`}>{f.count}</span>
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      : items.length === 0 ? (
        <EmptyState icon="🎒" title="Nothing to pack yet" description="Start adding items to your packing list."
          action={<Button onClick={openAdd}><Plus size={16}/> Add First Item</Button>} />
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, catItems]) => {
            const toShow = catItems.filter(i => {
              if (filter === 'packed')    return i.packed
              if (filter === 'unpacked')  return !i.packed
              if (filter === 'essential') return i.essential
              return true
            })
            if (!toShow.length) return null
            return (
              <div key={category} className="animate-fade-in">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  {category}
                  <span className="text-xs bg-sand-100 text-sand-600 px-1.5 py-0.5 rounded-md font-normal">
                    {toShow.filter(i => i.packed).length}/{toShow.length}
                  </span>
                </h3>
                <div className="space-y-2">
                  {toShow.map(item => (
                    <div key={item.id} className={`card p-3.5 flex items-center gap-3 transition-all duration-200 ${item.packed ? 'opacity-60' : ''}`}>
                      <button onClick={() => togglePacked(item.id, !item.packed)}
                        className={`flex-shrink-0 transition-colors ${item.packed ? 'text-forest-500' : 'text-gray-300 hover:text-sand-400'}`}>
                        {item.packed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-medium ${item.packed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.item}</span>
                          {item.essential && !item.packed && <Badge color="sand">Essential</Badge>}
                          {item.quantity > 1 && <span className="text-xs text-gray-400">×{item.quantity}</span>}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-sand-100 text-gray-300 hover:text-sand-500"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={handleClose} title="Add Packing Item">
        <PackingForm form={form} onChange={handleChange} onSubmit={handleSubmit} onClose={handleClose} saving={saving} isEdit={false} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={handleClose} title="Edit Item">
        <PackingForm form={form} onChange={handleChange} onSubmit={handleSubmit} onClose={handleClose} saving={saving} isEdit={true} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove Item" message={`Remove "${deleteTarget?.item}" from your packing list?`} />
    </div>
  )
}
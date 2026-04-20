// src/pages/BudgetPage.jsx
import { useState, useCallback, useMemo, memo } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useBudget } from '../hooks/useBudget'
import { Button, Modal, Input, Select, Spinner, EmptyState, ConfirmDialog, ProgressBar, Badge } from '../components/ui'
import { BUDGET_CATEGORIES, CATEGORY_ICONS, formatCurrency, formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'

const EMPTY = { title: '', category: 'Food', amount: '', date: '', notes: '', type: 'expense' }

const BudgetForm = memo(({ form, onChange, onSubmit, onClose, saving, isEdit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <Input label="Title *" value={form.title} onChange={onChange('title')}
      placeholder="e.g. Dinner at Fisherman's Wharf" required autoFocus />
    <div className="grid grid-cols-2 gap-3">
      <Select label="Category" value={form.category} onChange={onChange('category')}>
        {BUDGET_CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </Select>
      <Input label="Amount (₹) *" type="number" value={form.amount} onChange={onChange('amount')} placeholder="0" required />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Input label="Date" type="date" value={form.date} onChange={onChange('date')} />
      <Select label="Type" value={form.type} onChange={onChange('type')}>
        <option value="expense">Expense</option>
        <option value="planned">Planned</option>
      </Select>
    </div>
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-600">Notes</label>
      <textarea rows={2} value={form.notes} onChange={onChange('notes')}
        className="input-field resize-none" placeholder="Optional details…" />
    </div>
    <div className="flex gap-3 justify-end">
      <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
      <Button type="submit" loading={saving}>{isEdit ? 'Update' : 'Add Expense'}</Button>
    </div>
  </form>
))

export default function BudgetPage() {
  const { activeTrip } = useTripContext()
  const { items, loading, addItem, editItem, removeItem, stats } = useBudget(activeTrip?.id)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const budgetLimit = Number(activeTrip?.budget || 0)
  const spent = stats.total
  const remaining = budgetLimit - spent
  const overBudget = budgetLimit > 0 && spent > budgetLimit

  const handleChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }, [])

  const openAdd = useCallback(() => { setForm(EMPTY); setShowForm(true) }, [])
  const openEdit = useCallback((item) => {
    setEditTarget(item)
    setForm({
      title: item.title, category: item.category, amount: item.amount,
      date: item.date || '', notes: item.notes || '', type: item.type || 'expense'
    })
  }, [])
  const handleClose = useCallback(() => { setShowForm(false); setEditTarget(null); setForm(EMPTY) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const data = { ...form, amount: Number(form.amount) }
      if (editTarget) {
        await editItem(editTarget.id, data); toast.success('Updated!'); setEditTarget(null)
      } else {
        await addItem(data); toast.success('Expense added!'); setShowForm(false)
      }
      setForm(EMPTY)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await removeItem(deleteTarget.id); toast.success('Removed'); setDeleteTarget(null) }
    catch { toast.error('Failed to delete') }
  }

  const categoryData = useMemo(() =>
    Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]), [stats.byCategory])

  if (!activeTrip) return (
    <div className="page-container">
      <EmptyState icon="💰" title="No active trip" description="Select a trip from the Dashboard to manage its budget." />
    </div>
  )

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Budget Tracker</h1>
          <p className="text-sm text-gray-400 mt-0.5">{activeTrip.name}</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} /> Add Expense</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {budgetLimit > 0 && (
          <div className="card">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Budget</p>
            <p className="font-display text-2xl font-bold text-gray-800">{formatCurrency(budgetLimit)}</p>
          </div>
        )}
        <div className="card">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Spent</p>
          <p className={`font-display text-2xl font-bold ${overBudget ? 'text-red-500' : 'text-gray-800'}`}>{formatCurrency(spent)}</p>
        </div>
        {budgetLimit > 0 && (
          <div className="card">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Remaining</p>
            <p className={`font-display text-2xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-forest-600'}`}>
              {formatCurrency(Math.abs(remaining))}
              {remaining < 0 && <span className="text-sm font-normal text-red-400 ml-1">over</span>}
            </p>
          </div>
        )}
      </div>

      {budgetLimit > 0 && (
        <div className="card mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500">Budget usage</span>
            <span className={`font-semibold ${overBudget ? 'text-red-500' : 'text-gray-700'}`}>
              {Math.round((spent / budgetLimit) * 100)}%
            </span>
          </div>
          <ProgressBar value={spent} max={budgetLimit} color={overBudget ? 'red' : spent / budgetLimit > 0.8 ? 'sand' : 'forest'} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {categoryData.length > 0 && (
          <div className="card lg:col-span-1">
            <h3 className="font-semibold text-gray-700 mb-4">By Category</h3>
            <div className="space-y-3">
              {categoryData.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="flex items-center gap-1.5 text-gray-600"><span>{CATEGORY_ICONS[cat] || '💰'}</span> {cat}</span>
                    <span className="font-semibold text-gray-700">{formatCurrency(amt)}</span>
                  </div>
                  <ProgressBar value={amt} max={spent} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={`${categoryData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          {loading ? <div className="flex justify-center py-16"><Spinner /></div>
            : items.length === 0 ? (
              <EmptyState icon="💸" title="No expenses yet" description="Track your spending by adding expenses."
                action={<Button onClick={openAdd}><Plus size={16} /> Add First Expense</Button>} />
            ) : (
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-all">
                    <div className="w-10 h-10 rounded-xl bg-sand-50 flex items-center justify-center text-xl flex-shrink-0">
                      {CATEGORY_ICONS[item.category] || '💰'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                        <Badge color="sand">{item.category}</Badge>
                        {item.type === 'planned' && <Badge color="ocean">Planned</Badge>}
                      </div>
                      {item.date && <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.date)}</p>}
                      {item.notes && <p className="text-xs text-gray-400 truncate">{item.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-lg text-gray-800">{formatCurrency(item.amount)}</span>
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-sand-100 text-gray-400 hover:text-sand-600"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>

      <Modal isOpen={showForm} onClose={handleClose} title="Add Expense">
        <BudgetForm form={form} onChange={handleChange} onSubmit={handleSubmit} onClose={handleClose} saving={saving} isEdit={false} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={handleClose} title="Edit Expense">
        <BudgetForm form={form} onChange={handleChange} onSubmit={handleSubmit} onClose={handleClose} saving={saving} isEdit={true} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Expense" message={`Delete "${deleteTarget?.title}"?`} />
    </div>
  )
}

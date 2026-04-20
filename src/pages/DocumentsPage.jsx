// src/pages/DocumentsPage.jsx
import { useState, useCallback, memo } from 'react'
import { Plus, Pencil, Trash2, ExternalLink, AlertCircle } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useDocuments } from '../hooks/useDocuments'
import { Button, Modal, Input, Select, Spinner, EmptyState, ConfirmDialog, Badge } from '../components/ui'
import { DOCUMENT_TYPES, formatDate } from '../utils/helpers'
import toast from 'react-hot-toast'
import { differenceInDays, parseISO } from 'date-fns'

const EMPTY = { type: 'Passport', title: '', number: '', issueDate: '', expiryDate: '', issuedBy: '', notes: '', fileUrl: '' }

const DOC_ICONS = {
  Passport: '🛂', Visa: '📎', 'Flight Ticket': '✈️', 'Hotel Booking': '🏨',
  'Travel Insurance': '🛡️', 'ID Card': '🪪', Vaccination: '💉', Other: '📄',
}
const DOC_COLORS = {
  Passport: 'ocean', Visa: 'dusk', 'Flight Ticket': 'sand', 'Hotel Booking': 'forest',
  'Travel Insurance': 'forest', 'ID Card': 'ocean', Vaccination: 'forest', Other: 'sand',
}

const DocumentForm = memo(({ form, onChange, onSubmit, onClose, saving, isEdit }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <Select label="Document Type *" value={form.type} onChange={onChange('type')}>
        {DOCUMENT_TYPES.map(t => <option key={t}>{t}</option>)}
      </Select>
      <Input label="Title / Name *" value={form.title} onChange={onChange('title')}
        placeholder="e.g. My Passport" required autoFocus />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Input label="Document Number" value={form.number} onChange={onChange('number')} placeholder="e.g. A1234567" />
      <Input label="Issued By" value={form.issuedBy} onChange={onChange('issuedBy')} placeholder="e.g. Govt. of India" />
    </div>
    <div className="grid grid-cols-2 gap-3">
      <Input label="Issue Date" type="date" value={form.issueDate} onChange={onChange('issueDate')} />
      <Input label="Expiry Date" type="date" value={form.expiryDate} onChange={onChange('expiryDate')} />
    </div>
    <Input label="File / Drive Link (optional)" value={form.fileUrl} onChange={onChange('fileUrl')}
      placeholder="https://drive.google.com/…" />
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-600">Notes</label>
      <textarea rows={2} value={form.notes} onChange={onChange('notes')}
        className="input-field resize-none" placeholder="Visa on arrival, e-visa, etc." />
    </div>
    <div className="flex gap-3 justify-end">
      <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
      <Button type="submit" loading={saving}>{isEdit ? 'Update' : 'Save Document'}</Button>
    </div>
  </form>
))

export default function DocumentsPage() {
  const { activeTrip } = useTripContext()
  const { docs, loading, addDoc, editDoc, removeDoc } = useDocuments(activeTrip?.id)
  const [showForm, setShowForm]         = useState(false)
  const [editTarget, setEditTarget]     = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm]                 = useState(EMPTY)
  const [saving, setSaving]             = useState(false)

  const handleChange = useCallback((field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }, [])

  const openAdd = useCallback(() => { setForm(EMPTY); setShowForm(true) }, [])
  const openEdit = useCallback((doc) => {
    setEditTarget(doc)
    setForm({ type: doc.type, title: doc.title, number: doc.number || '',
      issueDate: doc.issueDate || '', expiryDate: doc.expiryDate || '',
      issuedBy: doc.issuedBy || '', notes: doc.notes || '', fileUrl: doc.fileUrl || '' })
  }, [])
  const handleClose = useCallback(() => { setShowForm(false); setEditTarget(null); setForm(EMPTY) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editTarget) {
        await editDoc(editTarget.id, form); toast.success('Document updated!'); setEditTarget(null)
      } else {
        await addDoc(form); toast.success('Document saved!'); setShowForm(false)
      }
      setForm(EMPTY)
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try { await removeDoc(deleteTarget.id); toast.success('Removed'); setDeleteTarget(null) }
    catch { toast.error('Failed to delete') }
  }

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return null
    const days = differenceInDays(parseISO(expiryDate), new Date())
    if (days < 0)  return { label: 'Expired',       color: 'red' }
    if (days < 30) return { label: `${days}d left`, color: 'sand' }
    if (days < 90) return { label: `${days}d left`, color: 'ocean' }
    return { label: 'Valid', color: 'forest' }
  }

  const expiringSoon = docs.filter(d => {
    if (!d.expiryDate) return false
    const days = differenceInDays(parseISO(d.expiryDate), new Date())
    return days >= 0 && days < 30
  })

  if (!activeTrip) return (
    <div className="page-container">
      <EmptyState icon="📋" title="No active trip" description="Select a trip from the Dashboard to manage its documents." />
    </div>
  )

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Document Vault</h1>
          <p className="text-sm text-gray-400 mt-0.5">{activeTrip.name} · {docs.length} documents</p>
        </div>
        <Button onClick={openAdd}><Plus size={16}/> Add Document</Button>
      </div>

      {expiringSoon.length > 0 && (
        <div className="mb-6 p-4 bg-sand-50 border border-sand-200 rounded-2xl flex gap-3 animate-slide-up">
          <AlertCircle size={20} className="text-sand-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-sand-700">Documents expiring soon</p>
            <p className="text-xs text-sand-500 mt-0.5">{expiringSoon.map(d => d.title).join(', ')} — renew before your trip!</p>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      : docs.length === 0 ? (
        <EmptyState icon="📋" title="No documents saved"
          description="Store your passport, visa, tickets and other important documents here."
          action={<Button onClick={openAdd}><Plus size={16}/> Add First Document</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map(doc => {
            const expiry = getExpiryStatus(doc.expiryDate)
            return (
              <div key={doc.id} className="card hover:shadow-card-hover transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-sand-50 flex items-center justify-center text-2xl">
                      {DOC_ICONS[doc.type] || '📄'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{doc.title}</p>
                      <Badge color={DOC_COLORS[doc.type] || 'sand'}>{doc.type}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg hover:bg-sand-100 text-gray-300 hover:text-sand-500"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteTarget(doc)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400"><Trash2 size={13} /></button>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-500">
                  {doc.number && <div className="flex justify-between"><span>Number</span><span className="font-mono font-medium text-gray-700">{doc.number}</span></div>}
                  {doc.issuedBy && <div className="flex justify-between"><span>Issued by</span><span className="font-medium text-gray-700">{doc.issuedBy}</span></div>}
                  {doc.issueDate && <div className="flex justify-between"><span>Issue date</span><span className="font-medium text-gray-700">{formatDate(doc.issueDate)}</span></div>}
                  {doc.expiryDate && (
                    <div className="flex justify-between items-center">
                      <span>Expiry</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-700">{formatDate(doc.expiryDate)}</span>
                        {expiry && <Badge color={expiry.color}>{expiry.label}</Badge>}
                      </div>
                    </div>
                  )}
                </div>
                {doc.notes && <p className="mt-3 text-xs text-gray-400 bg-sand-50 rounded-lg p-2.5">{doc.notes}</p>}
                {doc.fileUrl && (
                  <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                    className="mt-3 flex items-center gap-1.5 text-xs text-ocean-600 hover:text-ocean-700 font-medium">
                    <ExternalLink size={12} /> View File
                  </a>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={showForm} onClose={handleClose} title="Add Document" size="lg">
        <DocumentForm form={form} onChange={handleChange} onSubmit={handleSubmit} onClose={handleClose} saving={saving} isEdit={false} />
      </Modal>
      <Modal isOpen={!!editTarget} onClose={handleClose} title="Edit Document" size="lg">
        <DocumentForm form={form} onChange={handleChange} onSubmit={handleSubmit} onClose={handleClose} saving={saving} isEdit={true} />
      </Modal>
      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Document" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} />
    </div>
  )
}

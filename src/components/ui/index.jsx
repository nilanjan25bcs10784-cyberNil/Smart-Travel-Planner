// src/components/ui/index.jsx
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({
  children, onClick, variant = 'primary', size = 'md',
  disabled = false, loading = false, className = '', type = 'button', ...props
}) => {
  const variants = {
    primary:   'bg-sand-500 hover:bg-sand-600 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-white hover:bg-sand-50 text-sand-700 border border-sand-200 shadow-sm',
    ghost:     'hover:bg-sand-100 text-sand-700',
    danger:    'bg-red-500 hover:bg-red-600 text-white shadow-sm',
    ocean:     'bg-ocean-500 hover:bg-ocean-600 text-white shadow-sm',
    forest:    'bg-forest-500 hover:bg-forest-600 text-white shadow-sm',
  }
  const sizes = {
    sm:   'px-3 py-1.5 text-xs rounded-lg',
    md:   'px-5 py-2.5 text-sm rounded-xl',
    lg:   'px-7 py-3 text-base rounded-xl',
    icon: 'p-2 rounded-xl',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-600">{label}</label>}
    <input
      className={`input-field ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

// ─── Textarea ─────────────────────────────────────────────────────────────────
export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-600">{label}</label>}
    <textarea
      rows={3}
      className={`input-field resize-none ${error ? 'border-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

// ─── Select ───────────────────────────────────────────────────────────────────
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-600">{label}</label>}
    <select
      className={`input-field ${error ? 'border-red-400' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
)

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal-content ${sizes[size]}`}>
        <div className="flex items-center justify-between p-6 border-b border-sand-100">
          <h2 className="font-display text-xl font-semibold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-sand-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-3', lg: 'w-12 h-12 border-4' }
  return (
    <div className={`${sizes[size]} border-sand-200 border-t-sand-500 rounded-full animate-spin ${className}`} />
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="font-display text-xl font-semibold text-gray-700 mb-2">{title}</h3>
    <p className="text-sm text-gray-400 max-w-xs mb-6">{description}</p>
    {action}
  </div>
)

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = 'sand', className = '' }) => {
  const colors = {
    sand:   'bg-sand-100 text-sand-700',
    ocean:  'bg-ocean-100 text-ocean-700',
    forest: 'bg-forest-100 text-forest-700',
    red:    'bg-red-100 text-red-600',
    dusk:   'bg-dusk-100 text-dusk-700',
  }
  return (
    <span className={`badge ${colors[color]} ${className}`}>{children}</span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export const ProgressBar = ({ value, max = 100, color = 'sand', className = '' }) => {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const colors = {
    sand:   'bg-sand-500',
    ocean:  'bg-ocean-500',
    forest: 'bg-forest-500',
    red:    'bg-red-500',
  }
  return (
    <div className={`w-full bg-sand-100 rounded-full h-2 ${className}`}>
      <div
        className={`${colors[color]} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
    <p className="text-sm text-gray-600 mb-6">{message}</p>
    <div className="flex gap-3 justify-end">
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
    </div>
  </Modal>
)

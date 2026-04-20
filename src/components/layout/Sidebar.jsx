// src/components/layout/Sidebar.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTripContext } from '../../context/TripContext'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Map, Wallet, Package,
  FileText, Sparkles, LogOut, ChevronLeft, Globe,
} from 'lucide-react'

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/itinerary',   icon: Map,             label: 'Itinerary' },
  { to: '/budget',      icon: Wallet,          label: 'Budget' },
  { to: '/packing',     icon: Package,         label: 'Packing' },
  { to: '/documents',   icon: FileText,        label: 'Documents' },
  { to: '/ai-planner',  icon: Sparkles,        label: 'AI Planner' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user, logout }   = useAuth()
  const { activeTrip, clearTrip } = useTripContext()
  const navigate           = useNavigate()

  const handleLogout = async () => {
    await logout()
    clearTrip()
    toast.success('Logged out!')
    navigate('/login')
  }

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-white border-r border-sand-100 flex flex-col transition-all duration-300 h-screen sticky top-0`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sand-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-xl">🌍</span>
            <span className="font-display text-sand-600 font-bold text-lg">Voyagr</span>
          </div>
        )}
        {collapsed && <Globe size={20} className="text-sand-500 mx-auto" />}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="p-1.5 rounded-lg hover:bg-sand-50 text-gray-400 ml-auto"
        >
          <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Active trip badge */}
      {!collapsed && activeTrip && (
        <div className="mx-3 mt-3 p-3 bg-sand-50 rounded-xl border border-sand-200">
          <p className="text-xs text-sand-500 font-medium uppercase tracking-wide mb-1">Active Trip</p>
          <p className="text-sm font-semibold text-sand-700 truncate">{activeTrip.name}</p>
          <p className="text-xs text-sand-400 truncate">{activeTrip.destination}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) =>
              isActive ? 'sidebar-link-active flex items-center gap-3' : 'sidebar-link-inactive flex items-center gap-3'
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-sand-100 p-3">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-sand-200 flex items-center justify-center text-sand-600 font-bold text-sm flex-shrink-0">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.displayName || 'Traveller'}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full sidebar-link-inactive flex items-center gap-3 text-red-400 hover:text-red-500 hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

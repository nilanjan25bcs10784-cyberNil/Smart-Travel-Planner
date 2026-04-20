// src/pages/LoginPage.jsx
import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, Globe } from 'lucide-react'
import { Button, Input } from '../components/ui'

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)

  const handleChange = useCallback((e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value })), [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.email, form.password)
      toast.success('Welcome back! ✈️')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message.replace('Firebase: ', '').replace(/ \(auth.*\)/, ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGLoading(true)
    try {
      await loginWithGoogle()
      toast.success('Welcome! ✈️')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Google sign-in failed')
    } finally {
      setGLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-pattern flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-sand-600 via-sand-500 to-sand-400 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">🌍</span>
            <span className="font-display text-white text-2xl font-bold">Voyagr</span>
          </div>
          <h1 className="font-display text-5xl text-white font-bold leading-tight mb-6">
            Plan your<br />
            <span className="italic">perfect</span> trip
          </h1>
          <p className="text-sand-100 text-lg leading-relaxed max-w-sm">
            AI-powered itineraries, smart budgets, and everything you need for an unforgettable journey.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { icon: '🗺️', label: 'Smart Itineraries' },
            { icon: '💰', label: 'Budget Tracker' },
            { icon: '🎒', label: 'Packing Lists' },
            { icon: '📋', label: 'Doc Vault' },
          ].map(f => (
            <div key={f.label} className="bg-white/15 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">{f.icon}</span>
              <span className="text-white text-sm font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🌍</span>
            <span className="font-display text-sand-600 text-xl font-bold">Voyagr</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-gray-800 mb-1">Welcome back</h2>
          <p className="text-gray-400 text-sm mb-8">Sign in to continue planning</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400 pointer-events-none" />
              <input
                name="email" type="email" placeholder="Email address" required
                value={form.email} onChange={handleChange}
                className="input-field pl-10"
              />
            </div>

            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400 pointer-events-none" />
              <input
                name="password" type={showPw ? 'text' : 'password'} placeholder="Password" required
                value={form.password} onChange={handleChange}
                className="input-field pl-10 pr-10"
              />
              <button type="button" onClick={() => setShowPw(p => !p)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sand-100" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-gray-400">or continue with</span></div>
          </div>

          <Button variant="secondary" size="lg" className="w-full" onClick={handleGoogle} loading={gLoading}>
            <Globe size={16} /> Google
          </Button>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-sand-600 font-medium hover:underline">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// src/pages/SignupPage.jsx
import { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Globe } from 'lucide-react'
import { Button } from '../components/ui'

export default function SignupPage() {
  const { signup, loginWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [gLoading, setGLoading] = useState(false)
  const [errors, setErrors]   = useState({})

  const handleChange = useCallback((e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value })), [])

  const validate = () => {
    const e = {}
    if (!form.name.trim())               e.name = 'Name is required'
    if (!form.email.includes('@'))       e.email = 'Valid email required'
    if (form.password.length < 6)        e.password = 'Min 6 characters'
    if (form.password !== form.confirm)  e.confirm = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await signup(form.email, form.password, form.name)
      toast.success('Account created! Welcome aboard 🌍')
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
    } catch { toast.error('Google sign-in failed') }
    finally { setGLoading(false) }
  }

  const fields = [
    { name: 'name',     type: 'text',     placeholder: 'Full name',       icon: User },
    { name: 'email',    type: 'email',    placeholder: 'Email address',   icon: Mail },
    { name: 'password', type: showPw ? 'text' : 'password', placeholder: 'Password (min 6 chars)', icon: Lock },
    { name: 'confirm',  type: showPw ? 'text' : 'password', placeholder: 'Confirm password', icon: Lock },
  ]

  return (
    <div className="min-h-screen bg-pattern flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-ocean-600 via-ocean-500 to-ocean-400 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <span className="text-3xl">🌍</span>
            <span className="font-display text-white text-2xl font-bold">Voyagr</span>
          </div>
          <h1 className="font-display text-5xl text-white font-bold leading-tight mb-6">
            Every great<br />
            trip starts<br />
            <span className="italic">here</span>
          </h1>
          <p className="text-ocean-100 text-lg leading-relaxed max-w-sm">
            Join thousands of travellers who plan smarter with AI-powered tools.
          </p>
        </div>
        <div className="relative z-10">
          <div className="flex -space-x-2 mb-3">
            {['🧑', '👩', '🧔', '👨‍🦱', '👩‍🦰'].map((e, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg border-2 border-white/40">{e}</div>
            ))}
          </div>
          <p className="text-white/80 text-sm">Join 10,000+ happy travellers</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <span className="text-2xl">🌍</span>
            <span className="font-display text-sand-600 text-xl font-bold">Voyagr</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-gray-800 mb-1">Create account</h2>
          <p className="text-gray-400 text-sm mb-8">Free forever. No credit card needed.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name, type, placeholder, icon: Icon }) => (
              <div key={name}>
                <div className="relative">
                  <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400 pointer-events-none" />
                  <input
                    name={name} type={type} placeholder={placeholder} required
                    value={form[name]} onChange={handleChange}
                    className={`input-field pl-10 ${errors[name] ? 'border-red-400' : ''}`}
                  />
                  {(name === 'password' || name === 'confirm') && (
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-600">
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  )}
                </div>
                {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
              </div>
            ))}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Create Account
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
            Already have an account?{' '}
            <Link to="/login" className="text-sand-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

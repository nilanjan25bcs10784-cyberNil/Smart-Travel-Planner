// src/pages/AIPlannerPage.jsx
import { useState, useCallback, memo } from 'react'
import { Sparkles, Wand2, MapPin, Calendar, Wallet, Lightbulb, Plus } from 'lucide-react'
import { useTripContext } from '../context/TripContext'
import { useItinerary } from '../hooks/useItinerary'
import { usePacking } from '../hooks/usePacking'
import { useBudget } from '../hooks/useBudget'
import { generateItinerary, generatePackingList, generateBudgetBreakdown, getTravelTips } from '../services/aiService'
import { Button, Spinner, EmptyState, Badge } from '../components/ui'
import { formatCurrency, tripDuration } from '../utils/helpers'
import toast from 'react-hot-toast'

const TABS = [
  { id: 'itinerary', label: 'Itinerary', icon: MapPin },
  { id: 'packing', label: 'Packing', icon: Calendar },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'tips', label: 'Travel Tips', icon: Lightbulb },
]

// Stable interest input outside parent to prevent focus loss
const InterestsInput = memo(({ value, onChange }) => (
  <div className="mb-4">
    <label className="text-sm font-medium text-gray-600 block mb-1.5">Your interests (optional)</label>
    <input
      value={value}
      onChange={onChange}
      placeholder="e.g. beaches, local food, history, adventure sports…"
      className="input-field"
      autoComplete="off"
    />
  </div>
))

export default function AIPlannerPage() {
  const { activeTrip } = useTripContext()
  const { addItem: addItin } = useItinerary(activeTrip?.id)
  const { addItem: addPacking } = usePacking(activeTrip?.id)
  const { addItem: addBudget } = useBudget(activeTrip?.id)

  const [activeTab, setActiveTab] = useState('itinerary')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [interests, setInterests] = useState('')
  const [importLoading, setImportLoading] = useState(false)

  const days = activeTrip ? tripDuration(activeTrip.startDate, activeTrip.endDate) : 0

  const handleInterestsChange = useCallback((e) => setInterests(e.target.value), [])

  const handleTabChange = useCallback((id) => { setActiveTab(id); setResult(null) }, [])

  const handleGenerate = async () => {
    if (!activeTrip) return toast.error('Select a trip first!')
    setLoading(true); setResult(null)
    try {
      let data
      if (activeTab === 'itinerary')
        data = await generateItinerary({ destination: activeTrip.destination, days, budget: activeTrip.budget, interests })
      else if (activeTab === 'packing')
        data = await generatePackingList({ destination: activeTrip.destination, days, tripType: activeTrip.tripType })
      else if (activeTab === 'budget')
        data = await generateBudgetBreakdown({ destination: activeTrip.destination, days, totalBudget: activeTrip.budget })
      else
        data = await getTravelTips({ destination: activeTrip.destination })
      setResult(data)
      toast.success('AI suggestions ready! ✨')
    } catch { toast.error('AI generation failed. Please try again.') }
    finally { setLoading(false) }
  }

  const importItinerary = async () => {
    setImportLoading(true)
    try {
      let count = 0
      for (const day of result) {
        for (const act of (day.activities || [])) {
          await addItin({
            day: day.day, time: act.time || '', activity: act.activity,
            location: act.location || '', type: 'Sightseeing', cost: act.cost || 0, notes: act.notes || ''
          })
          count++
        }
      }
      toast.success(`Imported ${count} activities to itinerary!`)
    } catch { toast.error('Import failed') }
    finally { setImportLoading(false) }
  }

  const importPacking = async () => {
    setImportLoading(true)
    try {
      let count = 0
      for (const p of result) {
        await addPacking({ item: p.item, category: p.category, essential: p.essential || false, quantity: 1 })
        count++
      }
      toast.success(`Added ${count} items to packing list!`)
    } catch { toast.error('Import failed') }
    finally { setImportLoading(false) }
  }

  const importBudget = async () => {
    setImportLoading(true)
    try {
      for (const b of result)
        await addBudget({ title: b.category, category: b.category, amount: b.estimatedAmount, notes: b.notes || '', type: 'planned' })
      toast.success('Budget breakdown imported!')
    } catch { toast.error('Import failed') }
    finally { setImportLoading(false) }
  }

  if (!activeTrip) return (
    <div className="page-container">
      <EmptyState icon="🤖" title="Select a trip first"
        description="Go to Dashboard, click on a trip card to make it active, then come back to use AI Planner." />
    </div>
  )

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dusk-400 to-dusk-600 flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <h1 className="section-title">AI Planner</h1>
        </div>
        <p className="text-gray-400 text-sm">
          Let AI generate smart suggestions for <strong className="text-gray-600">{activeTrip.name}</strong> → {activeTrip.destination}
        </p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => handleTabChange(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
              ${activeTab === id
                ? 'bg-dusk-500 text-white border-dusk-500 shadow-sm'
                : 'bg-white text-gray-500 border-sand-100 hover:border-dusk-300 hover:text-dusk-600'}`}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={15} className="text-sand-400" /><span><strong>{activeTrip.destination}</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={15} className="text-sand-400" /><span><strong>{days} days</strong></span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Wallet size={15} className="text-sand-400" />
            <span><strong>{activeTrip.budget ? formatCurrency(activeTrip.budget) : 'No budget set'}</strong></span>
          </div>
        </div>

        {activeTab === 'itinerary' && (
          <InterestsInput value={interests} onChange={handleInterestsChange} />
        )}

        <Button onClick={handleGenerate} loading={loading} className="w-full sm:w-auto" variant="ocean" size="lg">
          <Wand2 size={17} />
          {loading ? 'Generating with AI…' : `Generate ${TABS.find(t => t.id === activeTab)?.label}`}
        </Button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <Spinner size="lg" />
            <Sparkles size={18} className="absolute inset-0 m-auto text-dusk-400 animate-pulse-slow" />
          </div>
          <p className="text-gray-400 text-sm animate-pulse">AI is crafting your perfect plan…</p>
        </div>
      )}

      {result && !loading && (
        <div className="animate-slide-up">
          {activeTab === 'itinerary' && Array.isArray(result) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">AI-Generated Itinerary</h2>
                <Button onClick={importItinerary} loading={importLoading} variant="forest"><Plus size={15} /> Import to Itinerary</Button>
              </div>
              <div className="space-y-4">
                {result.map(day => (
                  <div key={day.day} className="card">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-dusk-100 text-dusk-600 flex items-center justify-center font-bold font-display">{day.day}</div>
                      <h3 className="font-semibold text-gray-800">{day.title}</h3>
                    </div>
                    <div className="space-y-3">
                      {(day.activities || []).map((act, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-sand-50 rounded-xl">
                          <div className="text-xs font-mono text-sand-500 w-12 flex-shrink-0 pt-0.5">{act.time}</div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-800">{act.activity}</p>
                            {act.location && <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5"><MapPin size={10} />{act.location}</p>}
                            {act.notes && <p className="text-xs text-gray-400 mt-1">{act.notes}</p>}
                          </div>
                          {act.cost > 0 && <span className="text-xs font-semibold text-forest-600 flex-shrink-0">{formatCurrency(act.cost)}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'packing' && Array.isArray(result) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">AI Packing Suggestions</h2>
                <Button onClick={importPacking} loading={importLoading} variant="forest"><Plus size={15} /> Import to Packing List</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(result.reduce((acc, p) => { (acc[p.category] = acc[p.category] || []).push(p); return acc }, {})).map(([cat, items]) => (
                  <div key={cat} className="card">
                    <h3 className="font-semibold text-gray-700 text-sm mb-3">{cat}</h3>
                    <div className="space-y-1.5">
                      {items.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{p.item}</span>
                          {p.essential && <Badge color="sand">Essential</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'budget' && Array.isArray(result) && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-xl font-semibold">AI Budget Breakdown</h2>
                <Button onClick={importBudget} loading={importLoading} variant="forest"><Plus size={15} /> Import to Budget</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.map((b, i) => (
                  <div key={i} className="card flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sand-50 flex items-center justify-center text-xl flex-shrink-0">💰</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{b.category}</p>
                      {b.notes && <p className="text-xs text-gray-400 mt-0.5 truncate">{b.notes}</p>}
                    </div>
                    <p className="font-display font-bold text-lg text-gray-800 flex-shrink-0">{formatCurrency(b.estimatedAmount)}</p>
                  </div>
                ))}
                <div className="card bg-sand-50 border-sand-200 flex items-center gap-4 col-span-full">
                  <div className="flex-1"><p className="font-semibold text-sand-700">Total Estimated</p></div>
                  <p className="font-display font-bold text-2xl text-sand-700">
                    {formatCurrency(result.reduce((s, b) => s + b.estimatedAmount, 0))}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && Array.isArray(result) && (
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">Travel Tips for {activeTrip.destination}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.map((t, i) => (
                  <div key={i} className="card flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-dusk-100 text-dusk-500 flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
                    <div>
                      <p className="text-sm text-gray-800">{t.tip}</p>
                      <Badge color="dusk" className="mt-2">{t.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

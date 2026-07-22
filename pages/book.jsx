import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

const TESTIMONIALS = [
  { name: 'Maria T.', rating: 5, text: 'High Rollers transformed our backyard. The team was professional, on time, and the results were incredible. Highly recommend!' },
  { name: 'James K.', rating: 5, text: 'Best pressure washing service I\'ve ever used. They handled our driveway, deck, and siding all in one visit. Fair price, amazing work.' },
  { name: 'Sarah L.', rating: 5, text: 'Booked online, got a quote same day, and the work was done the next week. Couldn\'t be easier. Our house looks brand new.' },
]

// ── Pricing constants ────────────────────────────────────────────────────────
const INTERIOR_PRICES = { '2door': 150, '4door': 175, 'suv': 200, 'minivan': 250 }
const EXTERIOR_BASE = 50
const WAX_ADDON = 50
const ELECTRICAL_ADDON = 25
const WATER_ADDON = 25

// Multi-vehicle discounts: 5% off 2nd vehicle, 10% off 3rd, 15% off 4th
function calcDetailingTotal(vehicles, electrical, water) {
  const DISCOUNT_TIERS = [0, 0.05, 0.10, 0.15] // 0-indexed: 1st=0%, 2nd=5%, 3rd=10%, 4th=15%
  let vehicleTotal = 0
  vehicles.forEach((v, idx) => {
    const base = v.package === 'interior'
      ? (INTERIOR_PRICES[v.type] || 200)
      : EXTERIOR_BASE + (v.wax ? WAX_ADDON : 0)
    const discount = DISCOUNT_TIERS[idx] || 0
    vehicleTotal += base * (1 - discount)
  })
  let total = vehicleTotal
  if (electrical === 'hr_brings') total += ELECTRICAL_ADDON
  if (water === 'hr_brings') total += WATER_ADDON
  return Math.round(total)
}

function calcVehiclePrice(v, idx) {
  const DISCOUNT_TIERS = [0, 0.05, 0.10, 0.15]
  let base
  if (v.package === 'interior') base = INTERIOR_PRICES[v.type] || 200
  else if (v.package === 'exterior') base = EXTERIOR_BASE + (v.wax ? WAX_ADDON : 0)
  else base = Math.round((INTERIOR_PRICES[v.type] || 200 + EXTERIOR_BASE) * 0.85)
  const discount = DISCOUNT_TIERS[idx] || 0
  return Math.round(base * (1 - discount))
}

const VEHICLE_LABELS = { '2door': '2-Door Small Car', '4door': '4-Door Sedan', 'suv': 'SUV', 'minivan': 'Minivan / Suburban' }
const VEHICLE_PRICE_LABELS = { '2door': '$150', '4door': '$175', 'suv': '$200', 'minivan': '$250' }

export default function Intake() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Service type ──────────────────────────────────────────────────────────
  const [serviceType, setServiceType] = useState('')
  // ── Auto-detailing state ─────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState([{ type: '4door', package: 'interior', wax: false }])
  const [electricalOption, setElectricalOption] = useState('customer') // 'customer' | 'hr_brings'
  const [waterOption, setWaterOption] = useState('customer')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  // ── General form state ───────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    address: '', city: '', state: '', zip: '',
    jobDescription: '', contactPreference: '',
  })
  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const fileInputRef = useRef(null)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setCurrentTestimonial(p => (p + 1) % TESTIMONIALS.length), 5000)
    return () => clearInterval(t)
  }, [])

  // Fetch available detailing slots when service type changes to auto-detailing
  useEffect(() => {
    if (serviceType === 'auto_detailing') {
      setLoadingSlots(true)
      fetch('/api/detailing-slots')
        .then(r => r.json())
        .then(d => { setAvailableSlots(d.slots || []); setLoadingSlots(false) })
        .catch(() => setLoadingSlots(false))
    }
  }, [serviceType])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = e => {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 5) { alert('Max 5 photos'); return }
    const valid = files.filter(f => ['jpg','jpeg','png','heic','webp'].includes(f.name.split('.').pop().toLowerCase()))
    setPhotos(prev => [...prev, ...valid])
    setPhotoPreviews(prev => [...prev, ...valid.map(f => URL.createObjectURL(f))])
  }
  const removePhoto = idx => {
    setPhotos(prev => prev.filter((_, i) => i !== idx))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleContactSelect = pref => setForm(prev => ({ ...prev, contactPreference: pref }))

  // ── Auto-detailing helpers ────────────────────────────────────────────────
  const addVehicle = () => {
    if (vehicles.length >= 4) return
    setVehicles(prev => [...prev, { type: '4door', package: 'interior', wax: false }])
  }
  const removeVehicle = idx => setVehicles(prev => prev.filter((_, i) => i !== idx))
  const updateVehicle = (idx, field, value) => {
    setVehicles(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v))
  }

  const previewTotal = calcDetailingTotal(vehicles, electricalOption, waterOption)

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError('')
    const payload = {
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      contactPreference: form.contactPreference,
    }

    if (serviceType === 'auto_detailing') {
      // Build job description from vehicles
      const vList = vehicles.map(v => {
        const pkg = v.package === 'interior' ? 'Interior' : `Exterior${v.wax ? '+Wax' : ''}`
        return `${VEHICLE_LABELS[v.type]} — ${pkg}`
      }).join('; ')
      payload.jobDescription = `Auto Detailing: ${vList}. Electrical: ${electricalOption}. Water: ${waterOption}.`
      payload.slot_id = selectedSlot
      payload.vehicles = vehicles
      payload.electrical_option = electricalOption
      payload.water_option = waterOption

      try {
        const res = await fetch('/api/detailing-book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Booking failed')
        }
      } catch (err) {
        console.error('[book] detailing error:', err)
        setSubmitError(err.message)
        return
      }
    } else {
      // General lead — use existing /api/leads
      payload.jobDescription = form.jobDescription
      try {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } catch (err) {
        console.error('[book] lead error:', err)
      }
    }

    setSubmitted(true)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const isStep1Valid = () => form.name.trim() && form.phone.trim() && form.email.trim() && form.email.includes('@')

  const isStep2Valid = () => {
    if (!serviceType) return false
    if (serviceType === 'auto_detailing') {
      return form.address.trim() && form.city.trim() && form.state.trim() && form.zip.trim() && selectedSlot
    }
    return form.address.trim() && form.city.trim() && form.state.trim() && form.zip.trim() && form.jobDescription.trim()
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    const isAD = serviceType === 'auto_detailing'
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">{isAD ? '🚗' : '✅'}</div>
          <h1 className="text-3xl font-extrabold text-navy mb-4" style={{ color: '#14143C' }}>
            {isAD ? 'Appointment Requested!' : 'Request Received!'}
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Thanks, {form.name.split(' ')[0]}! {isAD ? 'We\'ll confirm your auto detailing appointment within 1 hour.' : 'We\'ve got your request and will be in touch within 1 business hour.'}
          </p>
          <div className="bg-gray-50 rounded-xl p-6 text-left text-sm text-gray-700 space-y-2">
            <p className="font-semibold text-gray-500 mb-3">What happens next?</p>
            {isAD ? (
              <>
                <li>📅 We confirm your slot</li>
                <li>📞 We text you a confirmation</li>
                <li>🚗 Your vehicles get the full treatment</li>
                <li>💳 Payment collected on-site</li>
              </>
            ) : (
              <>
                <li>📋 We review your request</li>
                <li>📞 We reach out your way — {form.contactPreference === 'text' ? 'text' : form.contactPreference === 'call' ? 'phone call' : 'email'}</li>
                <li>💰 You get a detailed estimate</li>
              </>
            )}
          </div>
          <button
            onClick={() => { setSubmitted(false); setStep(1); setServiceType(''); setVehicles([{ type: '4door', package: 'interior', wax: false }]); setForm({ name:'', phone:'', email:'', address:'', city:'', state:'', zip:'', jobDescription:'', contactPreference:'' }); setPhotos([]); setPhotoPreviews([]); setSelectedSlot('') }}
            className="mt-6 text-sm text-pink-600 underline"
          >
            Submit another request
          </button>
        </div>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Head><title>Book Now — High Rollers</title><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>

      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-navy text-white py-4 px-4" style={{ backgroundColor: '#14143C' }}>
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div>
              <div className="text-xl font-extrabold tracking-tight">🎱 High Rollers</div>
              <div className="text-xs text-gray-300">Professional Services</div>
            </div>
            <div className="text-2xl">✨</div>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1,2,3].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold flex-shrink-0 ${step >= s ? 'text-white' : 'bg-gray-200 text-gray-400'}`}
                  style={step >= s ? { backgroundColor: '#14143C' } : {}}>{s}</div>
                {s < 3 && <div className={`flex-1 h-1 mx-2 rounded ${step > s ? '' : 'bg-gray-200'}`} style={step > s ? { backgroundColor: '#14143C' } : {}} /> }
              </div>
            ))}
          </div>

          {/* ── STEP 1: Contact info ───────────────────────────────────────── */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold text-navy mb-1" style={{ color: '#14143C' }}>Who are you?</h2>
              <p className="text-gray-500 text-sm mb-6">Step 1 of 3 — Your contact info</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400" style={{ color: '#1E1E1E' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cell Phone *</label>
                  <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="(555) 867-5309"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400" style={{ color: '#1E1E1E' }} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@example.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400" style={{ color: '#1E1E1E' }} />
                </div>
              </div>
              <button onClick={() => isStep1Valid() && setStep(2)} disabled={!isStep1Valid()}
                className={`mt-8 w-full py-4 rounded-xl text-base font-bold transition-all duration-150 ${isStep1Valid() ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                style={isStep1Valid() ? { backgroundColor: '#14143C' } : {}}>
                Next: Job Details →
              </button>
            </div>
          )}

          {/* ── STEP 2: Service + Address ────────────────────────────────── */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-extrabold text-navy mb-1" style={{ color: '#14143C' }}>What service do you need?</h2>
              <p className="text-gray-500 text-sm mb-6">Step 2 of 3 — Service type &amp; location</p>

              {/* Service Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type *</label>
                <select
                  value={serviceType}
                  onChange={e => { setServiceType(e.target.value); setSelectedSlot('') }}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                  style={{ color: '#1E1E1E' }}
                >
                  <option value="">— Select a service —</option>
                  <option value="auto_detailing">🚗 Auto Detailing (On-Site)</option>
                  <option value="painting">🎨 Painting</option>
                  <option value="cotton_candy">🍭 Cotton Candy Catering</option>
                  <option value="holiday_lights">🎄 Holiday Lights</option>
                  <option value="other">Other / Not Sure</option>
                </select>
              </div>

              {/* ── AUTO DETAILING FIELDS ──────────────────────────────────── */}
              {serviceType === 'auto_detailing' && (
                <div className="space-y-6 mb-6 p-4 rounded-2xl bg-purple-50 border-2 border-purple-100" style={{ borderColor: '#DC5A82' }}>

                  {/* Vehicles */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-gray-700">Vehicles ({vehicles.length}/4)</label>
                      <div className="flex gap-2">
                        {vehicles.length > 1 && (
                          <button onClick={() => removeVehicle(vehicles.length - 1)} className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-600 font-bold">− Remove</button>
                        )}
                        {vehicles.length < 4 && (
                          <button onClick={addVehicle} className="text-xs px-3 py-1 rounded-full bg-pink-100 text-pink-600 font-bold">+ Add Vehicle</button>
                        )}
                      </div>
                    </div>

                    {vehicles.map((v, idx) => (
                      <div key={idx} className="bg-white rounded-xl p-4 mb-3 border border-gray-200">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-2">Vehicle {idx + 1}</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <select value={v.type} onChange={e => updateVehicle(idx, 'type', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400 bg-white" style={{ color: '#1E1E1E' }}>
                            <option value="2door">2-Door — $150</option>
                            <option value="4door">4-Door — $175</option>
                            <option value="suv">SUV — $200</option>
                            <option value="minivan">Minivan/Suburban — $250</option>
                          </select>
                          <select value={v.package} onChange={e => updateVehicle(idx, 'package', e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-400 bg-white" style={{ color: '#1E1E1E' }}>
                            <option value="interior">Interior Package</option>
                            <option value="exterior">Exterior Wash</option>
                            <option value="combo">Interior + Exterior Combo (Save 15%)</option>
                          </select>
                        </div>
                        {v.package === 'exterior' && (
                          <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input type="checkbox" checked={v.wax} onChange={e => updateVehicle(idx, 'wax', e.target.checked)}
                              className="w-4 h-4 accent-pink-500" />
                            Add Wax (+$50)
                          </label>
                        )}
                        {v.package === 'combo' && (
                          <p className="text-xs text-green-600 font-medium pl-4">Interior + Exterior + Tire Shine included</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Electrical */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Electrical — Do you have an outlet we can use?</label>
                    <div className="flex gap-3">
                      <button onClick={() => setElectricalOption('customer')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${electricalOption === 'customer' ? 'border-pink-500 text-white' : 'border-gray-200 text-gray-600 bg-white'}`}
                        style={electricalOption === 'customer' ? { backgroundColor: '#14143C', borderColor: '#14143C' } : {}}>
                        🔌 Yes, I have one (Free)
                      </button>
                      <button onClick={() => setElectricalOption('hr_brings')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${electricalOption === 'hr_brings' ? 'border-pink-500 text-white' : 'border-gray-200 text-gray-600 bg-white'}`}
                        style={electricalOption === 'hr_brings' ? { backgroundColor: '#14143C', borderColor: '#14143C' } : {}}>
                        ⚡ ADD Brings (+$25)
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">We bring a 50-ft extension cord — you provide the outlet.</p>
                  </div>

                  {/* Water */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Water — Do you have a hose we can use?</label>
                    <div className="flex gap-3">
                      <button onClick={() => setWaterOption('customer')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${waterOption === 'customer' ? 'border-pink-500 text-white' : 'border-gray-200 text-gray-600 bg-white'}`}
                        style={waterOption === 'customer' ? { backgroundColor: '#14143C', borderColor: '#14143C' } : {}}>
                        🚿 Yes, I have one (Free)
                      </button>
                      <button onClick={() => setWaterOption('hr_brings')}
                        className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${waterOption === 'hr_brings' ? 'border-pink-500 text-white' : 'border-gray-200 text-gray-600 bg-white'}`}
                        style={waterOption === 'hr_brings' ? { backgroundColor: '#14143C', borderColor: '#14143C' } : {}}>
                        💧 ADD Brings (+$25)
                      </button>
                    </div>
                  </div>

                  {/* Date slot */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Date &amp; Time *</label>
                    {loadingSlots ? (
                      <p className="text-sm text-gray-400 py-2">Loading available dates...</p>
                    ) : availableSlots.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">No slots currently available — we\'ll contact you to schedule.</p>
                    ) : (
                      <select value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white" style={{ color: '#1E1E1E' }}>
                        <option value="">— Select a date &amp; time —</option>
                        {availableSlots.map(slot => {
                          const d = new Date(slot.slot_date + 'T00:00:00')
                          const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                          const timeLabel = slot.time_slot === 'morning' ? '🌅 Morning (8am–12pm)' : '☀️ Afternoon (1pm–5pm)'
                          return (
                            <option key={slot.id} value={slot.id}>
                              {label} — {timeLabel} ({slot.vehicles_remaining} spots left)
                            </option>
                          )
                        })}
                      </select>
                    )}
                  </div>

                  {/* Price preview */}
                  <div className="bg-white rounded-xl p-4 border-2 border-pink-200" style={{ borderColor: '#DC5A82' }}>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Estimated Total</p>
                    <div className="space-y-1 text-sm text-gray-700 mb-3">
                      {vehicles.map((v, idx) => {
                        const discPct = [0, 5, 10, 15][idx] || 0
                        const discLabel = discPct > 0 ? ` (${discPct}% off)` : ''
                        const price = calcVehiclePrice(v, idx)
                        let basePrice
                        if (v.package === 'interior') basePrice = INTERIOR_PRICES[v.type] || 200
                        else if (v.package === 'exterior') basePrice = EXTERIOR_BASE + (v.wax ? WAX_ADDON : 0)
                        else basePrice = Math.round((INTERIOR_PRICES[v.type] || 200 + EXTERIOR_BASE) * 0.85)
                        return (
                          <div key={idx} className="flex justify-between">
                            <span>V{idx+1}: {VEHICLE_LABELS[v.type]} — {v.package === 'interior' ? 'Interior' : v.package === 'exterior' ? 'Exterior' : 'Combo'}{v.package === 'exterior' && v.wax ? ' + Wax' : ''}{discLabel}</span>
                            <span className="font-semibold">
                              {discPct > 0 ? <s className="text-gray-400 mr-1">${basePrice}</s> : null}${price}
                            </span>
                          </div>
                        )
                      })}
                      {electricalOption === 'hr_brings' && <div className="flex justify-between"><span>Electrical add-on</span><span className="font-semibold">+$25</span></div>}
                      {waterOption === 'hr_brings' && <div className="flex justify-between"><span>Water add-on</span><span className="font-semibold">+$25</span></div>}
                    </div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                      <span className="font-extrabold text-navy" style={{ color: '#14143C' }}>Estimated Total</span>
                      <span className="font-extrabold text-2xl" style={{ color: '#14143C' }}>${previewTotal}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Final price confirmed on-site. Payment collected after service.</p>
                  </div>
                </div>
              )}

              {/* ── Address fields (all services) ──────────────────────────── */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Street Address *</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="123 Main St"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400" style={{ color: '#1E1E1E' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">City *</label>
                    <input name="city" value={form.city} onChange={handleChange} placeholder="Wheaton"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400" style={{ color: '#1E1E1E' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">State *</label>
                    <input name="state" value={form.state} onChange={handleChange} placeholder="IL" maxLength={2}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400" style={{ color: '#1E1E1E' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ZIP *</label>
                  <input name="zip" value={form.zip} onChange={handleChange} placeholder="60187" maxLength={10}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400" style={{ color: '#1E1E1E' }} />
                </div>

                {/* Job description (only for non-auto-detailing) */}
                {serviceType && serviceType !== 'auto_detailing' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Job Description *</label>
                    <textarea name="jobDescription" value={form.jobDescription} onChange={handleChange}
                      placeholder="Tell us about the work you need done — be as specific as you like" rows={4}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none" style={{ color: '#1E1E1E' }} />
                  </div>
                )}

                {/* Photo upload (non-auto-detailing) */}
                {serviceType && serviceType !== 'auto_detailing' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Photos (optional)</label>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-gray-300 rounded-xl py-4 text-gray-500 text-sm hover:border-pink-400 transition-colors">
                      📷 Add up to 5 photos — tap to upload
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/heic,image/webp" multiple onChange={handlePhotoChange} className="hidden" />
                    {photoPreviews.length > 0 && (
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {photoPreviews.map((src, idx) => (
                          <div key={idx} className="relative">
                            <img src={src} alt={`Photo ${idx+1}`} className="w-16 h-16 object-cover rounded-lg" />
                            <button onClick={() => removePhoto(idx)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{photos.length}/5 photos</p>
                  </div>
                )}
              </div>

              {submitError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  ⚠️ {submitError}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-xl text-base font-bold border-2 border-gray-200 text-gray-600">← Back</button>
                <button onClick={handleSubmit}
                  disabled={!isStep2Valid()}
                  className={`flex-1 py-4 rounded-xl text-base font-bold transition-all duration-150 ${isStep2Valid() ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  style={isStep2Valid() ? { backgroundColor: '#14143C' } : {}}>
                  Next: Confirm →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Contact preference ─────────────────────────────────── */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-extrabold text-navy mb-1" style={{ color: '#14143C' }}>How should we reach you?</h2>
              <p className="text-gray-500 text-sm mb-6">Step 3 of 3 — Choose your preference</p>
              <div className="space-y-3">
                {[
                  { key: 'web', icon: '🌐', title: 'Submit Online', desc: 'Get a quote link sent to your email — quick & easy' },
                  { key: 'text', icon: '💬', title: 'Text Me', desc: "We'll text you within 1 business hour" },
                  { key: 'call', icon: '📞', title: 'Call Me', desc: 'Our team will call to discuss your project' },
                ].map(opt => (
                  <button key={opt.key} onClick={() => handleContactSelect(opt.key)}
                    className={`w-full text-left rounded-xl p-4 border-2 transition-all duration-150 ${form.contactPreference === opt.key ? 'border-pink-500 shadow-md' : 'border-gray-200 hover:border-pink-300'}`}
                    style={form.contactPreference === opt.key ? { borderColor: '#DC5A82', backgroundColor: '#F9F5FF' } : {}}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div>
                        <div className="font-bold text-base" style={{ color: form.contactPreference === opt.key ? '#14143C' : '#1E1E1E' }}>{opt.title}</div>
                        <div className="text-sm text-gray-500">{opt.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-xl text-base font-bold border-2 border-gray-200 text-gray-600">← Back</button>
                <button onClick={handleSubmit}
                  disabled={!form.contactPreference}
                  className={`flex-1 py-4 rounded-xl text-base font-bold transition-all duration-150 ${form.contactPreference ? 'text-white shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  style={form.contactPreference ? { backgroundColor: '#22C55E' } : {}}>
                  Submit Request ✓
                </button>
              </div>
            </div>
          )}

          {/* Testimonials */}
          {step < 3 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400 uppercase tracking-widest mb-4">What customers say</p>
              <div className="bg-gray-50 rounded-2xl p-6 text-center">
                <div className="text-gold text-xl mb-2" style={{ color: '#FFC832' }}>{'★'.repeat(TESTIMONIALS[currentTestimonial].rating)}</div>
                <p className="text-gray-700 italic mb-3 text-sm leading-relaxed">"{TESTIMONIALS[currentTestimonial].text}"</p>
                <p className="text-navy font-bold text-sm" style={{ color: '#14143C' }}>— {TESTIMONIALS[currentTestimonial].name}</p>
              </div>
              <div className="flex justify-center gap-2 mt-3">
                {TESTIMONIALS.map((_, idx) => (
                  <button key={idx} onClick={() => setCurrentTestimonial(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === currentTestimonial ? 'bg-pink-500 w-4' : 'bg-gray-300'}`}
                    style={idx === currentTestimonial ? { backgroundColor: '#DC5A82' } : {}} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="text-center py-6 text-xs text-gray-400">
          <p>🎱 High Rollers — Serving Wheaton & surrounding areas</p>
          <p className="mt-1">highrollerscompany.com</p>
        </div>
      </div>
    </>
  )
}
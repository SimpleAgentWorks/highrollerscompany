import Head from 'next/head'
import { useState, useEffect, useCallback } from 'react'

const STATUS_COLORS = {
  new:       { bg: '#1e3a5f', text: '#60a5fa', label: 'New' },
  contacted: { bg: '#3b2a0f', text: '#f59e0b', label: 'Contacted' },
  confirmed: { bg: '#0f2d1a', text: '#34d399', label: 'Confirmed' },
  completed: { bg: '#1a1a2e', text: '#a78bfa', label: 'Completed' },
  cancelled: { bg: '#2d1515', text: '#f87171', label: 'Cancelled' },
}

const STATUSES = Object.keys(STATUS_COLORS)
const ADMIN_PIN = '369636'

function formatDate(isoString) {
  if (!isoString) return '—'
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  } catch { return isoString }
}

function formatEventDate(dateStr) {
  if (!dateStr) return '—'
  try {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    })
  } catch { return dateStr }
}

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.new
  return (
    <span style={{
      background: s.bg,
      color: s.text,
      padding: '3px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 600,
      letterSpacing: '0.03em',
      border: `1px solid ${s.text}44`,
    }}>
      {s.label}
    </span>
  )
}

export default function Dashboard() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState(null)

  // ── Auto-detailing slots ───────────────────────────────────────────────
  const [slots, setSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [slotPin, setSlotPin] = useState('')
  const [slotForm, setSlotForm] = useState({ slot_date: '', time_slot: 'morning', max_vehicles: 4, location_label: 'Customer Site' })
  const [slotMsg, setSlotMsg] = useState('')

  const fetchSlots = useCallback(async () => {
    setLoadingSlots(true)
    try {
      const res = await fetch('/api/detailing-slots')
      const data = await res.json()
      setSlots(data.slots || [])
    } catch (e) {
      console.error('Failed to load slots', e)
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  const addSlot = async () => {
    if (!slotPin || !slotForm.slot_date) { setSlotMsg('PIN and date are required'); return }
    setSlotMsg('Adding...')
    try {
      const res = await fetch('/api/detailing-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: slotPin, ...slotForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSlotMsg('Slot added!')
      setSlotForm({ slot_date: '', time_slot: 'morning', max_vehicles: 4, location_label: 'Customer Site' })
      fetchSlots()
    } catch (e) {
      setSlotMsg('Error: ' + e.message)
    }
  }

  const deleteSlot = async (id) => {
    if (!slotPin) { setSlotMsg('Enter PIN first'); return }
    if (!confirm('Remove this slot?')) return
    try {
      const res = await fetch(`/api/detailing-slots?id=${id}&pin=${encodeURIComponent(slotPin)}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setSlots(prev => prev.filter(s => s.id !== id))
      setSlotMsg('Slot removed.')
    } catch (e) {
      setSlotMsg('Error: ' + e.message)
    }
  }

  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setBookings(data.bookings || [])
      setError('')
    } catch (e) {
      setError('Failed to load leads: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
    // Auto-refresh every 30s
    const interval = setInterval(fetchLeads, 30000)
    return () => clearInterval(interval)
  }, [fetchLeads])

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))
    } catch (e) {
      alert('Could not update status: ' + e.message)
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter)

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = bookings.filter(b => b.status === s).length
    return acc
  }, {})

  return (
    <>
      <Head>
        <title>High Rollers CRM — Lead Dashboard</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#f0f0f0',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '0',
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1a0a2e 0%, #0f1a2e 100%)',
          borderBottom: '1px solid #2a2a3e',
          padding: '20px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, background: 'linear-gradient(90deg, #ff6eb4, #a78bfa, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🎱 High Rollers CRM
            </h1>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: '13px' }}>
              Lead Dashboard — {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={fetchLeads}
            style={{
              background: '#1e2d3e',
              color: '#60a5fa',
              border: '1px solid #2a4a6e',
              borderRadius: '8px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            ↻ Refresh
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '20px 32px',
          flexWrap: 'wrap',
        }}>
          {[{ key: 'all', label: 'All', count: bookings.length, color: '#a78bfa' },
            ...STATUSES.map(s => ({ key: s, label: STATUS_COLORS[s].label, count: counts[s], color: STATUS_COLORS[s].text }))
          ].map(({ key, label, count, color }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                background: filter === key ? '#1e1e2e' : '#111',
                border: `1px solid ${filter === key ? color : '#2a2a3a'}`,
                borderRadius: '10px',
                padding: '10px 18px',
                cursor: 'pointer',
                color: filter === key ? color : '#888',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              {label} <span style={{ marginLeft: '6px', opacity: 0.8 }}>{count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '0 32px 40px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>Loading leads…</div>
          )}
          {error && (
            <div style={{ background: '#2d1515', border: '1px solid #f87171', borderRadius: '8px', padding: '16px', color: '#f87171', marginBottom: '16px' }}>
              ⚠️ {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#555' }}>
              {filter === 'all' ? 'No bookings yet. Submit a test form!' : `No ${filter} bookings.`}
            </div>
          )}

          {!loading && filtered.map((b) => (
            <div
              key={b.id}
              style={{
                background: '#111',
                border: '1px solid #1e1e2e',
                borderRadius: '12px',
                padding: '20px 24px',
                marginBottom: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr auto',
                gap: '16px',
                alignItems: 'start',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#2a2a4e'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e2e'}
            >
              {/* Col 1: Name + contact */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{b.name}</div>
                <div style={{ color: '#60a5fa', fontSize: '13px', marginBottom: '2px' }}>📱 {b.phone}</div>
                {b.email && <div style={{ color: '#888', fontSize: '12px' }}>✉️ {b.email}</div>}
                <div style={{ color: '#555', fontSize: '11px', marginTop: '6px' }}>
                  Received {formatDate(b.timestamp)}
                </div>
              </div>

              {/* Col 2: Service + price */}
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#f0f0f0', marginBottom: '4px' }}>
                  {b.service}
                </div>
                <div style={{ color: '#888', fontSize: '13px', marginBottom: '2px' }}>
                  📅 {formatEventDate(b.eventDate)}
                </div>
                {b.guestCount && (
                  <div style={{ color: '#888', fontSize: '13px' }}>👥 {b.guestCount} guests</div>
                )}
                {b.location && (
                  <div style={{ color: '#888', fontSize: '12px', marginTop: '4px' }}>📍 {b.location}</div>
                )}
              </div>

              {/* Col 3: Notes */}
              <div>
                {b.notes ? (
                  <div style={{ color: '#aaa', fontSize: '13px', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{b.notes}"
                  </div>
                ) : (
                  <div style={{ color: '#444', fontSize: '13px' }}>No notes</div>
                )}
              </div>

              {/* Col 4: Status control */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <StatusBadge status={b.status} />
                <select
                  value={b.status}
                  disabled={updatingId === b.id}
                  onChange={e => updateStatus(b.id, e.target.value)}
                  style={{
                    background: '#1a1a2a',
                    color: '#ccc',
                    border: '1px solid #2a2a4a',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    opacity: updatingId === b.id ? 0.5 : 1,
                  }}
                >
                  {STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_COLORS[s].label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        {/* ── AUTO DETAILING SLOTS ─────────────────────────────────────── */}
        <div style={{
          marginTop: '48px',
          borderTop: '2px solid #2a2a3e',
          paddingTop: '32px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#f0f0f0' }}>🚗 Auto Detailing Slots</h2>
              <p style={{ margin: '4px 0 0', color: '#666', fontSize: '13px' }}>Manage available booking slots for on-site auto detailing</p>
            </div>
            <button onClick={fetchSlots} style={{
              background: '#1e2d3e', color: '#60a5fa', border: '1px solid #2a4a6e',
              borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
            }}>↻ Refresh</button>
          </div>

          {/* Add slot form */}
          <div style={{ background: '#111', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <p style={{ margin: '0 0 12px', color: '#888', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add New Slot</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 2fr auto', gap: '10px', alignItems: 'end', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '11px', marginBottom: '4px' }}>PIN</label>
                <input type="password" value={slotPin} onChange={e => setSlotPin(e.target.value)} placeholder="369636"
                  style={{ background: '#1a1a2a', border: '1px solid #2a4a6e', borderRadius: '6px', padding: '8px 12px', color: '#f0f0f0', fontSize: '13px', width: '90px' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '11px', marginBottom: '4px' }}>Date</label>
                <input type="date" value={slotForm.slot_date} onChange={e => setSlotForm(f => ({ ...f, slot_date: e.target.value }))}
                  style={{ background: '#1a1a2a', border: '1px solid #2a4a6e', borderRadius: '6px', padding: '8px 12px', color: '#f0f0f0', fontSize: '13px', width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '11px', marginBottom: '4px' }}>Time</label>
                <select value={slotForm.time_slot} onChange={e => setSlotForm(f => ({ ...f, time_slot: e.target.value }))}
                  style={{ background: '#1a1a2a', border: '1px solid #2a4a6e', borderRadius: '6px', padding: '8px 12px', color: '#f0f0f0', fontSize: '13px', width: '100%' }}>
                  <option value="morning">🌅 Morning</option>
                  <option value="afternoon">☀️ Afternoon</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#666', fontSize: '11px', marginBottom: '4px' }}>Vehicles / Label</label>
                <input type="number" min="1" max="8" value={slotForm.max_vehicles}
                  onChange={e => setSlotForm(f => ({ ...f, max_vehicles: parseInt(e.target.value) || 4 }))}
                  style={{ background: '#1a1a2a', border: '1px solid #2a4a6e', borderRadius: '6px', padding: '8px 12px', color: '#f0f0f0', fontSize: '13px', width: '60px' }} />
                <input type="text" value={slotForm.location_label}
                  onChange={e => setSlotForm(f => ({ ...f, location_label: e.target.value }))}
                  placeholder="Location label"
                  style={{ background: '#1a1a2a', border: '1px solid #2a4a6e', borderRadius: '6px', padding: '8px 12px', color: '#f0f0f0', fontSize: '13px', marginLeft: '8px', width: 'calc(100% - 76px)' }} />
              </div>
              <button onClick={addSlot}
                style={{ background: '#14143C', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 20px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                + Add Slot
              </button>
            </div>
            {slotMsg && <p style={{ margin: '8px 0 0', color: slotMsg.startsWith('Error') ? '#f87171' : '#34d399', fontSize: '13px' }}>{slotMsg}</p>}
          </div>

          {/* Slots list */}
          {loadingSlots ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Loading slots…</div>
          ) : slots.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#444', background: '#111', border: '1px solid #1e1e2e', borderRadius: '12px' }}>
              No auto detailing slots yet. Add one above to start accepting bookings.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
              {slots.map(slot => {
                const d = new Date(slot.slot_date + 'T00:00:00')
                const dateLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                const timeLabel = slot.time_slot === 'morning' ? '🌅 Morning' : '☀️ Afternoon'
                const isFull = slot.vehicles_remaining === 0
                return (
                  <div key={slot.id} style={{
                    background: '#111',
                    border: `1px solid ${isFull ? '#f8717133' : '#2a2a3e'}`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: '#f0f0f0' }}>{dateLabel}</div>
                        <div style={{ color: '#60a5fa', fontSize: '13px' }}>{timeLabel}</div>
                        <div style={{ color: '#555', fontSize: '12px', marginTop: '2px' }}>{slot.location_label}</div>
                      </div>
                      <button onClick={() => deleteSlot(slot.id)}
                        style={{ background: 'transparent', color: '#f87171', border: '1px solid #f8717144', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px' }}>
                        ✕ Remove
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                      <span style={{ fontSize: '12px', color: isFull ? '#f87171' : '#34d399', fontWeight: 600 }}>
                        {slot.vehicles_remaining} / {slot.max_vehicles} spots
                      </span>
                      <div style={{ flex: 1, background: '#1e1e2e', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${(slot.booked_vehicles / slot.max_vehicles) * 100}%`,
                          height: '100%',
                          background: isFull ? '#f87171' : '#34d399',
                          borderRadius: '4px',
                        }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #1a1a2a',
          padding: '16px 32px',
          color: '#444',
          fontSize: '12px',
          textAlign: 'center',
        }}>
          High Rollers CRM · Internal use only · Auto-refreshes every 30s · <a href="/" style={{ color: '#555' }}>← Back to site</a>
        </div>
      </div>
    </>
  )
}

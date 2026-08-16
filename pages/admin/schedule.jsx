// /admin/schedule — focused scheduling UI for Auto Detail Delivered
// - Week view (current week + prev/next)
// - AM/PM slots per day with availability + bookings
// - Quick add slot, block day, view bookings
// - Mobile-friendly (stacks on small screens)

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const ADMIN_PIN = '369636'
const TIME_SLOTS = [
  { value: 'morning', label: '🌅 Morning', emoji: '🌅' },
  { value: 'afternoon', label: '☀️ Afternoon', emoji: '☀️' },
]

function startOfWeek(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  // Make Monday the start of week
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function formatDayHeader(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })
}

function formatWeekRange(weekStart) {
  const end = new Date(weekStart)
  end.setDate(end.getDate() + 6)
  return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

function toISODate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function AdminSchedule() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [pin, setPin] = useState('')
  const [pinVerified, setPinVerified] = useState(false)
  const [msg, setMsg] = useState('')
  const [blockMode, setBlockMode] = useState(false) // when true, clicking a slot toggles availability

  // Build the 7 days of the current week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch slots for this week + a buffer (next 2 weeks)
      const from = toISODate(weekStart)
      const to = new Date(weekStart)
      to.setDate(to.getDate() + 13)
      const toISO = toISODate(to)

      const [slotsRes, bookingsRes] = await Promise.all([
        fetch(`/api/detailing-slots?from=${from}&to=${toISO}&include_unavailable=1`),
        fetch(`/api/detailing-bookings?from=${from}&to=${toISO}`),
      ])

      const slotsData = slotsRes.ok ? await slotsRes.json() : { slots: [] }
      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : { bookings: [] }

      setSlots(slotsData.slots || [])
      setBookings(bookingsData.bookings || [])
    } catch (err) {
      console.error('Failed to load schedule data', err)
      setMsg('Error loading schedule: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [weekStart])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Group slots by date + time_slot for fast lookup
  const slotMap = {}
  slots.forEach(s => {
    const key = `${s.slot_date}_${s.time_slot}`
    slotMap[key] = s
  })

  // Group bookings by slot_id
  const bookingsBySlot = {}
  bookings.forEach(b => {
    if (!bookingsBySlot[b.slot_id]) bookingsBySlot[b.slot_id] = []
    bookingsBySlot[b.slot_id].push(b)
  })

  const verifyPin = () => {
    if (pin === ADMIN_PIN) {
      setPinVerified(true)
      setMsg('PIN verified')
      setTimeout(() => setMsg(''), 2000)
    } else {
      setMsg('Wrong PIN')
    }
  }

  const addSlot = async (date, timeSlot) => {
    if (!pinVerified) {
      setMsg('Enter PIN first')
      return
    }
    setMsg(`Adding ${timeSlot} slot for ${date}...`)
    try {
      const res = await fetch('/api/detailing-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: ADMIN_PIN,
          slot_date: date,
          time_slot: timeSlot,
          max_vehicles: 4,
          location_label: 'Customer Site',
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setMsg('Slot added ✓')
        fetchAll()
      } else {
        setMsg(`Error: ${data.error || 'failed'}`)
      }
      setTimeout(() => setMsg(''), 2500)
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  const toggleAvailability = async (slot) => {
    if (!pinVerified) return
    try {
      const res = await fetch(`/api/detailing-slots/${slot.id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: ADMIN_PIN,
          is_available: !slot.is_available,
        }),
      })
      if (res.ok) {
        setMsg(slot.is_available ? 'Slot blocked' : 'Slot reopened')
        fetchAll()
      } else {
        const data = await res.json()
        setMsg(`Error: ${data.error || 'failed'}`)
      }
      setTimeout(() => setMsg(''), 2500)
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  const deleteSlot = async (slotId) => {
    if (!pinVerified) return
    if (!confirm('Delete this slot? Bookings will remain but slot will be removed.')) return
    try {
      const res = await fetch(`/api/detailing-slots?id=${slotId}&pin=${encodeURIComponent(ADMIN_PIN)}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setMsg('Slot deleted')
        fetchAll()
      } else {
        const data = await res.json()
        setMsg(`Error: ${data.error || 'failed'}`)
      }
      setTimeout(() => setMsg(''), 2500)
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  const navigateWeek = (direction) => {
    const newStart = new Date(weekStart)
    newStart.setDate(newStart.getDate() + direction * 7)
    setWeekStart(newStart)
  }

  const goToToday = () => {
    setWeekStart(startOfWeek(new Date()))
  }

  // Quick-add full week of standard slots (M-F morning+afternoon)
  const addStandardWeek = async () => {
    if (!pinVerified) return
    if (!confirm('Add standard slots (M–F, morning + afternoon) for this week?')) return
    setMsg('Adding week of slots...')
    let added = 0
    for (let i = 0; i < 7; i++) {
      const d = weekDays[i]
      const dow = d.getDay()
      const date = toISODate(d)
      // Mon-Fri only (1-5), skip weekends
      if (dow >= 1 && dow <= 5) {
        for (const ts of ['morning', 'afternoon']) {
          // Skip if slot already exists
          if (slotMap[`${date}_${ts}`]) continue
          try {
            const res = await fetch('/api/detailing-slots', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pin: ADMIN_PIN,
                slot_date: date,
                time_slot: ts,
                max_vehicles: 4,
                location_label: 'Customer Site',
              }),
            })
            if (res.ok) added++
          } catch (e) { /* ignore */ }
        }
      }
    }
    setMsg(`Added ${added} slots ✓`)
    fetchAll()
    setTimeout(() => setMsg(''), 3000)
  }

  // Block out an entire day
  const blockDay = async (date) => {
    if (!pinVerified) return
    try {
      const res = await fetch('/api/detailing-slots/block-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: ADMIN_PIN,
          slot_date: date,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setMsg(data.message || 'Day blocked')
        fetchAll()
      } else {
        const data = await res.json()
        setMsg(`Error: ${data.error || 'failed'}`)
      }
      setTimeout(() => setMsg(''), 2500)
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  const isToday = (d) => toISODate(d) === toISODate(new Date())
  const isPast = (d) => toISODate(d) < toISODate(new Date())

  return (
    <>
      <Head>
        <title>Schedule — Auto Detail Delivered Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#080808',
        color: '#f5f5f5',
        fontFamily: 'Inter, sans-serif',
        padding: '16px',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #2a2a3e',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#d4af37' }}>
              🚗 Schedule
            </h1>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: '13px' }}>
              Auto Detail Delivered
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {!pinVerified ? (
              <>
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && verifyPin()}
                  placeholder="PIN"
                  style={{
                    background: '#1a1a2a', border: '1px solid #2a4a6e',
                    borderRadius: '6px', padding: '8px 12px', color: '#f0f0f0',
                    fontSize: '14px', width: '90px',
                  }}
                />
                <button onClick={verifyPin} style={{
                  background: '#d4af37', color: '#000', border: 'none',
                  borderRadius: '6px', padding: '8px 16px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700,
                }}>Unlock</button>
              </>
            ) : (
              <span style={{
                background: '#0f2d1a', color: '#34d399', padding: '6px 12px',
                borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              }}>✓ Unlocked</span>
            )}
          </div>
        </div>

        {/* Week navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => navigateWeek(-1)} style={{
              background: '#1a1a2a', color: '#f0f0f0', border: '1px solid #2a4a6e',
              borderRadius: '6px', padding: '8px 14px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600,
            }}>← Prev</button>
            <button onClick={goToToday} style={{
              background: '#14143C', color: '#fff', border: 'none',
              borderRadius: '6px', padding: '8px 14px', cursor: 'pointer',
              fontSize: '13px', fontWeight: 700,
            }}>Today</button>
            <button onClick={() => navigateWeek(1)} style={{
              background: '#1a1a2a', color: '#f0f0f0', border: '1px solid #2a4a6e',
              borderRadius: '6px', padding: '8px 14px', cursor: 'pointer',
              fontSize: '14px', fontWeight: 600,
            }}>Next →</button>
          </div>

          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f0f0f0' }}>
            {formatWeekRange(weekStart)}
          </div>

          {pinVerified && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setBlockMode(!blockMode)}
                style={{
                  background: blockMode ? '#d4af37' : '#1a1a2a',
                  color: blockMode ? '#000' : '#f0f0f0',
                  border: blockMode ? 'none' : '1px solid #2a4a6e',
                  borderRadius: '6px', padding: '8px 14px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 700,
                }}
              >
                {blockMode ? '✓ Block Mode' : 'Block Mode'}
              </button>
              <button onClick={addStandardWeek} style={{
                background: '#0f4a2a', color: '#34d399', border: 'none',
                borderRadius: '6px', padding: '8px 14px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 700,
              }}>+ Standard Week</button>
            </div>
          )}
        </div>

        {msg && (
          <div style={{
            background: msg.startsWith('Error') ? '#3b1515' : '#0f2d1a',
            color: msg.startsWith('Error') ? '#f87171' : '#34d399',
            padding: '10px 16px', borderRadius: '8px', marginBottom: '16px',
            fontSize: '13px', fontWeight: 600,
          }}>{msg}</div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
            Loading schedule…
          </div>
        )}

        {/* Week grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(140px, 1fr))',
          gap: '10px',
        }}>
          {weekDays.map(day => {
            const date = toISODate(day)
            const dow = day.getDay()
            const isWeekend = dow === 0 || dow === 6
            const todayClass = isToday(day)

            return (
              <div
                key={date}
                style={{
                  background: todayClass ? '#14143C' : '#111',
                  border: todayClass ? '2px solid #d4af37' : '1px solid #2a2a3e',
                  borderRadius: '12px',
                  padding: '12px',
                  minHeight: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ marginBottom: '10px' }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: todayClass ? '#d4af37' : '#f0f0f0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>{formatDayHeader(day)}</div>
                  {pinVerified && !isPast(day) && (
                    <button
                      onClick={() => blockDay(date)}
                      title="Block out this entire day"
                      style={{
                        background: 'transparent', color: '#555', border: 'none',
                        fontSize: '10px', cursor: 'pointer', marginTop: '2px',
                        padding: 0, textDecoration: 'underline',
                      }}
                    >
                      block day
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {TIME_SLOTS.map(ts => {
                    const slot = slotMap[`${date}_${ts.value}`]
                    const slotBookings = slot ? (bookingsBySlot[slot.id] || []) : []
                    const past = isPast(day)
                    const full = slot && slot.vehicles_remaining === 0

                    return (
                      <div
                        key={ts.value}
                        style={{
                          background: slot ? (slot.is_available ? '#1a2e1a' : '#2d1515') : '#1a1a2a',
                          border: full ? '1px solid #f87171' : (slot ? '1px solid #34d39944' : '1px solid #2a2a3e'),
                          borderRadius: '8px',
                          padding: '8px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{
                          display: 'flex', justifyContent: 'space-between',
                          alignItems: 'center', marginBottom: '4px',
                        }}>
                          <span style={{ color: '#f0f0f0', fontWeight: 600 }}>{ts.emoji} {ts.value}</span>
                          {slot && (
                            <span style={{
                              fontSize: '10px',
                              color: full ? '#f87171' : '#34d399',
                              fontWeight: 700,
                            }}>
                              {slot.vehicles_remaining}/{slot.max_vehicles}
                            </span>
                          )}
                        </div>

                        {slot ? (
                          <>
                            {!slot.is_available && (
                              <div style={{ color: '#f87171', fontSize: '10px', fontWeight: 600 }}>
                                ⛔ BLOCKED
                              </div>
                            )}
                            {slotBookings.length > 0 && (
                              <div style={{ color: '#888', fontSize: '10px', marginTop: '4px' }}>
                                {slotBookings.length} booking{slotBookings.length > 1 ? 's' : ''}
                              </div>
                            )}
                            {pinVerified && (
                              <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                <button
                                  onClick={() => toggleAvailability(slot)}
                                  title={slot.is_available ? 'Block this slot' : 'Reopen this slot'}
                                  style={{
                                    background: 'transparent',
                                    color: slot.is_available ? '#f87171' : '#34d399',
                                    border: `1px solid ${slot.is_available ? '#f8717144' : '#34d39944'}`,
                                    borderRadius: '4px', padding: '2px 6px',
                                    cursor: 'pointer', fontSize: '10px', flex: 1,
                                  }}
                                >
                                  {slot.is_available ? 'Block' : 'Open'}
                                </button>
                                <button
                                  onClick={() => deleteSlot(slot.id)}
                                  title="Delete slot"
                                  style={{
                                    background: 'transparent', color: '#f87171',
                                    border: '1px solid #f8717144', borderRadius: '4px',
                                    padding: '2px 6px', cursor: 'pointer', fontSize: '10px',
                                  }}
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          !past && pinVerified && (
                            <button
                              onClick={() => addSlot(date, ts.value)}
                              disabled={blockMode}
                              style={{
                                width: '100%',
                                background: blockMode ? '#1a1a2a' : 'transparent',
                                color: blockMode ? '#555' : '#d4af37',
                                border: `1px dashed ${blockMode ? '#2a2a3e' : '#d4af3744'}`,
                                borderRadius: '4px', padding: '4px',
                                cursor: blockMode ? 'not-allowed' : 'pointer',
                                fontSize: '11px', fontWeight: 600,
                              }}
                            >
                              + Add
                            </button>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer summary */}
        <div style={{
          marginTop: '24px', padding: '16px',
          background: '#111', border: '1px solid #2a2a3e',
          borderRadius: '12px',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '12px',
          fontSize: '13px', color: '#888',
        }}>
          <span>
            This week: <strong style={{ color: '#f0f0f0' }}>{slots.filter(s => weekDays.some(d => toISODate(d) === s.slot_date)).length}</strong> slots ·
            <strong style={{ color: '#34d399' }}> {slots.filter(s => weekDays.some(d => toISODate(d) === s.slot_date) && s.is_available).length}</strong> open ·
            <strong style={{ color: '#f87171' }}> {slots.filter(s => weekDays.some(d => toISODate(d) === s.slot_date) && !s.is_available).length}</strong> blocked
          </span>
          <a
            href="/admin/bookings"
            style={{
              color: '#d4af37', textDecoration: 'none',
              fontWeight: 600, fontSize: '13px',
            }}
          >
            View all bookings →
          </a>
        </div>

        {/* Mobile responsive: stack columns on small screens */}
        <style>{`
          @media (max-width: 900px) {
            [data-schedule-grid] { grid-template-columns: 1fr !important; }
          }
        `}</style>
        <script dangerouslySetInnerHTML={{ __html: `
          if (typeof window !== 'undefined' && window.innerWidth < 900) {
            setTimeout(() => {
              const grid = document.querySelector('[style*="grid-template-columns: repeat(7"]');
              if (grid) grid.style.gridTemplateColumns = '1fr';
            }, 100);
          }
        ` }} />
      </div>
    </>
  )
}
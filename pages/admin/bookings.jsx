// /admin/bookings — view all detailing bookings with filters

import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

const STATUS_COLORS = {
  pending:   { bg: '#3b2a0f', text: '#f59e0b', label: 'Pending' },
  confirmed: { bg: '#0f2d1a', text: '#34d399', label: 'Confirmed' },
  completed: { bg: '#1a1a2e', text: '#a78bfa', label: 'Completed' },
  cancelled: { bg: '#2d1515', text: '#f87171', label: 'Cancelled' },
}

const ADMIN_PIN = '369636'

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending
  return (
    <span style={{
      background: s.bg, color: s.text, padding: '3px 10px',
      borderRadius: '12px', fontSize: '12px', fontWeight: 600,
      letterSpacing: '0.03em',
    }}>
      {s.label}
    </span>
  )
}

function formatDate(s) {
  if (!s) return '—'
  return new Date(s).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(t) {
  return t === 'morning' ? '🌅 Morning' : t === 'afternoon' ? '☀️ Afternoon' : t
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('upcoming') // upcoming | past | all
  const [pin, setPin] = useState('')
  const [pinVerified, setPinVerified] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [msg, setMsg] = useState('')

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/detailing-bookings')
      const data = res.ok ? await res.json() : { bookings: [] }
      setBookings(data.bookings || [])
    } catch (err) {
      console.error('Failed to fetch bookings', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const verifyPin = () => {
    if (pin === ADMIN_PIN) {
      setPinVerified(true)
      setMsg('PIN verified')
      setTimeout(() => setMsg(''), 2000)
    } else {
      setMsg('Wrong PIN')
    }
  }

  const updateStatus = async (bookingId, newStatus) => {
    if (!pinVerified) return
    try {
      const res = await fetch(`/api/detailing-bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: ADMIN_PIN, status: newStatus }),
      })
      if (res.ok) {
        setMsg(`Booking ${newStatus}`)
        fetchBookings()
      } else {
        const data = await res.json()
        setMsg(`Error: ${data.error || 'failed'}`)
      }
      setTimeout(() => setMsg(''), 2500)
    } catch (err) {
      setMsg('Error: ' + err.message)
    }
  }

  // Apply filters
  const today = new Date().toISOString().slice(0, 10)
  const filtered = bookings.filter(b => {
    if (filterStatus !== 'all' && b.status !== filterStatus) return false
    if (filterDate === 'upcoming' && b.slot_date < today) return false
    if (filterDate === 'past' && b.slot_date >= today) return false
    return true
  })

  // Stats
  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(b => b.slot_date >= today && b.status !== 'cancelled').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    revenue: bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.total_price || 0), 0),
  }

  return (
    <>
      <Head>
        <title>Bookings — Auto Detail Delivered Admin</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div style={{
        minHeight: '100vh', background: '#080808', color: '#f5f5f5',
        fontFamily: 'Inter, sans-serif', padding: '16px',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '12px',
          marginBottom: '20px', paddingBottom: '16px',
          borderBottom: '1px solid #2a2a3e',
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#d4af37' }}>
              📋 Bookings
            </h1>
            <p style={{ margin: '4px 0 0', color: '#888', fontSize: '13px' }}>
              Auto Detail Delivered
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a href="/admin/schedule" style={{
              color: '#d4af37', textDecoration: 'none',
              fontSize: '13px', fontWeight: 600,
            }}>← Schedule</a>
            {!pinVerified ? (
              <>
                <input
                  type="password" value={pin}
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

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px', marginBottom: '20px',
        }}>
          <div style={{ background: '#111', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Total</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f0f0f0', marginTop: '4px' }}>{stats.total}</div>
          </div>
          <div style={{ background: '#111', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Upcoming</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>{stats.upcoming}</div>
          </div>
          <div style={{ background: '#111', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Pending</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>{stats.pending}</div>
          </div>
          <div style={{ background: '#111', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Revenue</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
              ${(stats.revenue / 100).toFixed(0)}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'upcoming', 'past'].map(d => (
              <button key={d} onClick={() => setFilterDate(d)} style={{
                background: filterDate === d ? '#d4af37' : '#1a1a2a',
                color: filterDate === d ? '#000' : '#f0f0f0',
                border: 'none', borderRadius: '6px', padding: '6px 12px',
                cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                textTransform: 'capitalize',
              }}>{d}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                background: filterStatus === s ? '#14143C' : '#1a1a2a',
                color: '#f0f0f0', border: 'none', borderRadius: '6px',
                padding: '6px 12px', cursor: 'pointer',
                fontSize: '12px', fontWeight: 600,
                textTransform: 'capitalize',
              }}>{s}</button>
            ))}
          </div>
        </div>

        {msg && (
          <div style={{
            background: msg.startsWith('Error') ? '#3b1515' : '#0f2d1a',
            color: msg.startsWith('Error') ? '#f87171' : '#34d399',
            padding: '10px 16px', borderRadius: '8px', marginBottom: '16px',
            fontSize: '13px', fontWeight: 600,
          }}>{msg}</div>
        )}

        {/* Bookings list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Loading bookings…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#444', background: '#111', border: '1px solid #1e1e2e', borderRadius: '12px' }}>
            No bookings match these filters.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(booking => {
              const isExpanded = expandedId === booking.id
              const vehicleCount = Array.isArray(booking.vehicles) ? booking.vehicles.length : 0
              return (
                <div key={booking.id} style={{
                  background: '#111',
                  border: '1px solid #2a2a3e',
                  borderRadius: '12px',
                  padding: '14px 18px',
                }}>
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                    style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', cursor: 'pointer', flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontWeight: 700, fontSize: '15px', color: '#f0f0f0' }}>
                        {booking.customer_name}
                      </div>
                      <div style={{ color: '#888', fontSize: '13px', marginTop: '2px' }}>
                        {formatDate(booking.slot_date)} · {formatTime(booking.time_slot)} · {vehicleCount} vehicle{vehicleCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontWeight: 700, color: '#34d399', fontSize: '15px',
                      }}>
                        ${(booking.total_price / 100).toFixed(2)}
                      </span>
                      <StatusBadge status={booking.status} />
                      <span style={{ color: '#555', fontSize: '14px' }}>{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{
                      marginTop: '14px', paddingTop: '14px',
                      borderTop: '1px solid #2a2a3e',
                      fontSize: '13px', color: '#aaa',
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Phone</div>
                          <div style={{ color: '#f0f0f0', marginTop: '2px' }}>
                            <a href={`tel:${booking.customer_phone}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                              {booking.customer_phone}
                            </a>
                          </div>
                        </div>
                        {booking.customer_email && (
                          <div>
                            <div style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Email</div>
                            <div style={{ color: '#f0f0f0', marginTop: '2px' }}>
                              <a href={`mailto:${booking.customer_email}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>
                                {booking.customer_email}
                              </a>
                            </div>
                          </div>
                        )}
                        <div>
                          <div style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Address</div>
                          <div style={{ color: '#f0f0f0', marginTop: '2px' }}>
                            {booking.address || 'TBD'}{booking.city ? `, ${booking.city}` : ''}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>Add-ons</div>
                          <div style={{ color: '#f0f0f0', marginTop: '2px' }}>
                            Electrical: {booking.electrical_option === 'hr_brings' ? 'HR brings' : 'Customer'}
                            <br />
                            Water: {booking.water_option === 'hr_brings' ? 'HR brings' : 'Customer'}
                          </div>
                        </div>
                      </div>

                      {/* Vehicles detail */}
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Vehicles</div>
                        {Array.isArray(booking.vehicles) && booking.vehicles.map((v, i) => (
                          <div key={i} style={{ color: '#f0f0f0', fontSize: '13px', marginBottom: '2px' }}>
                            • {v.type} — {v.package}{v.wax ? ' + wax' : ''}
                          </div>
                        ))}
                      </div>

                      {/* Status actions */}
                      {pinVerified && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ color: '#666', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, alignSelf: 'center', marginRight: '4px' }}>Set status:</span>
                          {['pending', 'confirmed', 'completed', 'cancelled'].map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(booking.id, s)}
                              disabled={booking.status === s}
                              style={{
                                background: booking.status === s ? '#14143C' : '#1a1a2a',
                                color: STATUS_COLORS[s].text,
                                border: `1px solid ${STATUS_COLORS[s].text}44`,
                                borderRadius: '6px', padding: '4px 10px',
                                cursor: booking.status === s ? 'default' : 'pointer',
                                fontSize: '12px', fontWeight: 600,
                                opacity: booking.status === s ? 0.5 : 1,
                                textTransform: 'capitalize',
                              }}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
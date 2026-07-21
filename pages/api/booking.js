const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, phone, email, eventDate, guestCount, location, service, notes } = req.body

  if (!name || !phone || !eventDate || !service) {
    return res.status(400).json({ error: 'Missing required fields: name, phone, eventDate, service' })
  }

  const booking = {
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: String(email || '').trim(),
    event_date: String(eventDate).trim(),
    guest_count: String(guestCount || '').trim(),
    location: String(location || '').trim(),
    service: String(service).trim(),
    notes: String(notes || '').trim(),
    status: 'new',
    created_at: new Date().toISOString(),
  }

  let bookingId = Date.now()

  // ── 1. Save to Supabase ──
  try {
    const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(booking),
    })
    if (sbRes.ok) {
      const rows = await sbRes.json()
      if (rows && rows[0]) bookingId = rows[0].id
      console.log('Supabase saved:', bookingId)
    } else {
      const err = await sbRes.text()
      console.warn('Supabase error:', sbRes.status, err)
    }
  } catch (err) {
    console.error('Supabase save failed:', err.message)
  }

  return res.status(200).json({
    success: true,
    message: "Booking received! We'll text you shortly.",
    bookingId,
  })
}

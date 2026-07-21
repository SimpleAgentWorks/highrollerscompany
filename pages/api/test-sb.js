export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_KEY

  if (!url || !key) {
    return res.status(500).json({ error: 'Missing env vars', url: !!url, key: !!key })
  }

  try {
    const r = await fetch(`${url}/rest/v1/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ name: 'Vercel Test', phone: '555-0000', service: 'test', event_date: '2026-01-01', status: 'test' }),
    })
    const text = await r.text()
    return res.status(200).json({ supabase_status: r.status, supabase_body: text.substring(0, 300) })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

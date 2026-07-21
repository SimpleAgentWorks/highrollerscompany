// Lightweight visit tracker — logs promo page hits to Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export default async function handler(req, res) {
  // Allow cross-origin (called from browser)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).end()

  const { page, source, referrer } = req.body || {}

  try {
    await fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        page: page || '/promo',
        source: source || 'direct',
        referrer: referrer || '',
        visited_at: new Date().toISOString(),
      }),
    })
  } catch (e) {
    // Non-fatal — don't block the page
  }

  return res.status(200).json({ ok: true })
}

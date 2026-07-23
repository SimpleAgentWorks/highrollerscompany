// GET /api/leads-latest — proxy to local webhook leads endpoint
// Used by admin dashboard at /admin/leads

const LOCAL_LEADS_URL = 'https://agent01s-mac-mini.tailed5fd5.ts.net/leads';
const WEBHOOK_SECRET = process.env.LEAD_WEBHOOK_SECRET || 'hr-lead-2026-secret-7f8a9b';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const upstream = await fetch(LOCAL_LEADS_URL, {
      headers: { 'x-admin-token': WEBHOOK_SECRET },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    
    if (!upstream.ok) {
      const txt = await upstream.text();
      return res.status(upstream.status).json({ error: txt });
    }
    
    const data = await upstream.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({
      leads: [],
      count: 0,
      error: err.message,
      hint: 'Could not reach local leads webhook. Check that lead-webhook.js is running.',
    });
  }
}

<<<<<<< HEAD
// GET /api/leads-latest — proxy to local webhook leads endpoint
// Used by admin dashboard at /admin/leads

const LOCAL_LEADS_URL = 'https://agent01s-mac-mini.tailed5fd5.ts.net/leads';
const WEBHOOK_SECRET = process.env.LEAD_WEBHOOK_SECRET || 'hr-lead-2026-secret-7f8a9b';
=======
// GET /api/leads-latest — returns most recent leads from local JSON
// Used by OpenClaw heartbeat monitor

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const LOCAL_FILE = join(DATA_DIR, 'intake-leads.json');
>>>>>>> origin/main

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

<<<<<<< HEAD
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
=======
  if (!existsSync(LOCAL_FILE)) {
    return res.status(200).json({ leads: [], count: 0 });
  }

  try {
    const leads = JSON.parse(readFileSync(LOCAL_FILE, 'utf-8'));
    // Return newest first, limit to 20
    const latest = (leads || []).slice(0, 20).map(l => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      email: l.email,
      address: [l.address, l.city, l.state, l.zip].filter(Boolean).join(', '),
      job_description: l.job_description,
      contact_preference: l.contact_preference,
      created_at: l.created_at,
      status: l.status,
    }));
    return res.status(200).json({ leads: latest, count: latest.length });
  } catch (e) {
    return res.status(200).json({ leads: [], count: 0, error: e.message });
>>>>>>> origin/main
  }
}

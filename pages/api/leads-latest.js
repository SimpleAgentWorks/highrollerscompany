// GET /api/leads-latest — returns most recent leads from local JSON
// Used by OpenClaw heartbeat monitor

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const LOCAL_FILE = join(DATA_DIR, 'intake-leads.json');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
  }
}

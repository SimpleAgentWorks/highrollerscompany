// Leads API — handles new lead submissions from book.jsx and intake.jsx
// 
// Lead capture: writes to Google Apps Script Web App (permanent, free storage)
// Web App URL: set via GOOGLE_SCRIPT_WEBAPP_URL env var
// Fallback: logs lead to Vercel function logs (visible via `vercel logs`)
//
// SETUP: Create a Google Apps Script Web App (see scripts/high-rollers-leads-webapp.js)
// 1. Go to script.google.com → New project → paste that code
// 2. Run → setupSheet (creates the Google Sheet)
// 3. Deploy → New deployment → Web app → Anyone can access → Deploy
// 4. Copy the web app URL
// 5. Set GOOGLE_SCRIPT_WEBAPP_URL in Vercel project env vars

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_WEBAPP_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, address, city, state, zip, jobDescription, contactPreference } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'name and phone are required' });
  }

  const lead = {
    id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : null,
    address: address ? String(address).trim() : null,
    city: city ? String(city).trim() : null,
    state: state ? String(state).trim() : null,
    zip: zip ? String(zip).trim() : null,
    job_description: jobDescription ? String(jobDescription).trim() : null,
    contact_preference: contactPreference || null,
    status: 'new',
    created_at: new Date().toISOString(),
  };

  // ALWAYS log the full lead — visible via `vercel logs` even without Google Script
  console.log('[LEAD_CAPTURE]', JSON.stringify(lead));

  // Try to save to Google Apps Script Web App
  if (GOOGLE_SCRIPT_URL) {
    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
    } catch (e) {
      console.warn('[leads API] Google Script save failed:', e.message);
    }
  } else {
    console.warn('[leads API] GOOGLE_SCRIPT_WEBAPP_URL not set — lead logged only');
  }

  return res.status(200).json({ success: true, message: 'Lead received!', leadId: lead.id });
}

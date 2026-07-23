// Leads API — unified lead capture for all three businesses
// Handles: Painting (/book), Cotton Candy (/promo), Auto Detail (/auto-detail-delivered/book)
//
// On submission:
//  1. Logs to Vercel function logs ([LEAD_CAPTURE])
//  2. POSTs to local Mac webhook → triggers iMessage to John
//  3. Forwards to Google Apps Script (when configured) for permanent storage
//
// John gets a text within ~5 seconds of form submission — no monitor polling needed.

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_WEBAPP_URL;
const LOCAL_WEBHOOK_URL = process.env.LOCAL_WEBHOOK_URL || 'https://agent01s-mac-mini.tailed5fd5.ts.net/lead-notify';
const WEBHOOK_SECRET = process.env.LEAD_WEBHOOK_SECRET || 'hr-lead-2026-secret-7f8a9b';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    name, phone, email,
    address, city, state, zip,
    jobDescription, contactPreference,
    eventType, eventDate, venue, guestCount, specialRequests,
    vehicles, electrical, water,
  } = req.body;

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
    event_type: eventType || null,
    event_date: eventDate || null,
    venue: venue || null,
    guest_count: guestCount || null,
    special_requests: specialRequests ? String(specialRequests).trim() : null,
    vehicles: vehicles || null,
    electrical: electrical || null,
    water: water || null,
    source: detectSource(req.headers.referer || '', req.headers.origin || ''),
    status: 'new',
    created_at: new Date().toISOString(),
  };

  // 1. Always log full lead — visible via `vercel logs`
  console.log('[LEAD_CAPTURE]', JSON.stringify(lead));

  // 2. POST to local Mac webhook → iMessage to John
  // Await with short timeout - serverless functions can complete async work before returning
  try {
    await notifyJohn(lead);
  } catch (err) {
    console.warn('[leads API] Webhook call failed for', lead.id, '|', err.name, '|', err.message, '|', err.cause?.code || '');
  }

  // 3. Forward to Google Apps Script for permanent sheet storage (if configured)
  if (GOOGLE_SCRIPT_URL) {
    fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    }).catch(err => {
      console.warn('[leads API] Google Script save failed:', err.message);
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Lead received!',
    leadId: lead.id,
  });
}

function detectSource(referer, origin) {
  if (referer.includes('auto-detail-delivered') || referer.includes('autodetaildelivered') || origin.includes('autodetaildelivered')) {
    return 'auto-detail';
  }
  if (referer.includes('/promo')) {
    return 'cotton-candy';
  }
  if (referer.includes('/book')) {
    return 'painting';
  }
  return 'unknown';
}

async function notifyJohn(lead) {
  try {
    console.log(`[leads API] Calling webhook: ${LOCAL_WEBHOOK_URL} for ${lead.id}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(LOCAL_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': WEBHOOK_SECRET,
      },
      body: JSON.stringify(lead),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    console.log(`[leads API] Webhook response status: ${res.status} for ${lead.id}`);
    const result = await res.json().catch(() => ({}));
    if (result.success) {
      console.log(`[leads API] ✅ iMessage notification sent for ${lead.id}`);
    } else {
      console.warn(`[leads API] ⚠️ Webhook returned non-success for ${lead.id}:`, JSON.stringify(result));
    }
  } catch (err) {
    console.warn(`[leads API] ⚠️ Webhook FAILED for ${lead.id} | name=${err.name} | msg=${err.message} | code=${err.cause?.code} | stack=${err.stack?.substring(0, 300)}`);
    throw err;
  }
}

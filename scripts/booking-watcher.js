#!/usr/bin/env node
/**
 * High Rollers Booking Watcher — Real-Time Lead Alert System
 *
 * Polls Supabase jobs table every 5 seconds.
 * On new lead: sends iMessage to John + posts to Discord #high-rollers.
 *
 * Env vars required:
 *   SUPABASE_URL          — e.g. https://your-project.supabase.co
 *   SUPABASE_SERVICE_KEY  — service role key (not anon key)
 *   SEEN_FILE             — path to deduplication file (default: data/seen-leads.json)
 *   JOHN_PHONE            — iMessage target (default: +16304560567)
 *   DISCORD_CHANNEL_ID    — Discord channel ID for alerts (default: 1485703222009266239)
 *   POLL_INTERVAL_MS      — poll frequency in ms (default: 5000)
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')

// ── Configuration ────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY

const DATA_DIR = path.join(__dirname, '../data')
const SEEN_FILE = process.env.SEEN_FILE || path.join(DATA_DIR, 'seen-leads.json')
const JOHN_PHONE = process.env.JOHN_PHONE || '+16304560567'
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1485703222009266239'
const POLL_INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS || '5000', 10)

// CRM (local) — optional, for lead dashboard
const CRM_PORT = 3000
const CRM_TOKEN = 'high-rollers-88445d3720d5e40242fede6e8ad5b9b8'

// ── Init ──────────────────────────────────────────────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

function loadSeen() {
  try {
    return new Set(JSON.parse(fs.readFileSync(SEEN_FILE, 'utf8')))
  } catch {
    return new Set()
  }
}

function saveSeen(seen) {
  fs.writeFileSync(SEEN_FILE, JSON.stringify([...seen], null, 2))
}

// ── Supabase fetch ────────────────────────────────────────────────────────────
function fetchSupabase(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.warn('[Supabase] URL or key not set — skipping')
      resolve([])
      return
    }
    const url = new URL(`${SUPABASE_URL}/rest/v1/${endpoint}`)
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      }
    }
    const req = https.request(options, res => {
      let d = ''
      res.on('data', c => d += c)
      res.on('end', () => {
        try { resolve(JSON.parse(d)) } catch { resolve([]) }
      })
    })
    req.on('error', reject)
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body))
    req.end()
  })
}

// ── Discord notification ──────────────────────────────────────────────────────
function sendDiscord(lead) {
  const msg = [
    `🎱 **New Lead — highrollerscompany.com/book**`,
    ``,
    `**Name:** ${lead.name}`,
    `**Phone:** ${lead.phone}`,
    `**Email:** ${lead.email || '_none_'}`,
    `**Address:** ${[lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(', ') || '_not provided_'}`,
    `**Service:** ${lead.job_description || '_not provided_'}`,
    `**Contact Pref:** ${lead.contact_preference || '_not specified_'}`,
  ].join('\n')

  const tmpFile = `/tmp/hr-discord-${Date.now()}.txt`
  fs.writeFileSync(tmpFile, msg)
  try {
    execSync(
      `/opt/homebrew/bin/openclaw message send --channel discord --target "${DISCORD_CHANNEL_ID}" --message "$(cat ${tmpFile})"`,
      { timeout: 20000, shell: '/bin/bash' }
    )
    fs.unlinkSync(tmpFile)
    console.log('[Discord] ✅ Posted to #high-rollers')
    return true
  } catch (err) {
    console.warn('[Discord] ❌', err.message.substring(0, 120))
    try { fs.unlinkSync(tmpFile) } catch {}
    return false
  }
}

// ── iMessage notification ─────────────────────────────────────────────────────
function sendIMessage(lead) {
  const lines = [
    '🎱 NEW LEAD — highrollerscompany.com/book',
    '',
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email || '(none)'}`,
    `Address: ${[lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(', ') || '(not provided)'}`,
    `Service: ${lead.job_description || '(not provided)'}`,
    `Contact: ${lead.contact_preference || '(not specified)'}`,
    '',
    'Call or text them back!',
  ]
  const msg = lines.join('\n')

  const tmpFile = `/tmp/hr-lead-${Date.now()}.txt`
  fs.writeFileSync(tmpFile, msg)
  try {
    execSync(
      `/opt/homebrew/bin/imsg send --to "${JOHN_PHONE}" --text "$(cat ${tmpFile})"`,
      { timeout: 15000, shell: '/bin/bash' }
    )
    fs.unlinkSync(tmpFile)
    console.log('[iMessage] ✅ Sent to', JOHN_PHONE)
    return true
  } catch (err) {
    console.warn('[iMessage] ❌', err.message.substring(0, 120))
    try { fs.unlinkSync(tmpFile) } catch {}
    return false
  }
}

// ── CRM push (optional) ────────────────────────────────────────────────────────
function postToCRM(lead) {
  return new Promise(resolve => {
    const l = {
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone,
      company: '',
      source: 'Website Form',
      status: 'new',
      value: 150,
      notes: [
        `Address: ${[lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(', ')}`,
        `Service: ${lead.job_description || '?'}`,
        `Contact Pref: ${lead.contact_preference || '?'}`,
      ].filter(Boolean).join('\n'),
    }
    const data = JSON.stringify(l)
    const req = http.request({
      hostname: '127.0.0.1',
      port: CRM_PORT,
      path: `/api/crm/leads?token=${CRM_TOKEN}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) },
    }, res => {
      let d = ''; res.on('data', c => d += c)
      res.on('end', () => resolve({ status: res.statusCode }))
    })
    req.on('error', e => { console.warn('[CRM] Error:', e.message); resolve({ status: 0 }) })
    req.write(data); req.end()
  })
}

// ── Main poll loop ────────────────────────────────────────────────────────────
async function checkForNewLeads() {
  const seen = loadSeen()

  try {
    const jobs = await fetchSupabase('jobs?order=created_at.desc&limit=20')
    if (!Array.isArray(jobs)) {
      console.warn('[Watcher] Unexpected Supabase response type:', typeof jobs)
      return
    }

    let newCount = 0
    for (const job of jobs) {
      const id = String(job.id)
      if (seen.has(id)) continue

      console.log(`[Watcher] 🆕 New lead: ${job.name} — ${job.job_description || 'job'} [${id}]`)
      newCount++

      // Fire all channels
      const imsgOk = sendIMessage(job)
      const discordOk = sendDiscord(job)
      const crmRes = await postToCRM(job)

      console.log(`[Watcher] iMessage: ${imsgOk ? '✅' : '❌'}  |  Discord: ${discordOk ? '✅' : '❌'}  |  CRM: ${crmRes?.status === 201 || crmRes?.status === 200 ? '✅' : '⚠️ ' + (crmRes?.status || '?')}`)

      seen.add(id)
    }

    if (newCount > 0) {
      saveSeen(seen)
      console.log(`[Watcher] 📬 ${newCount} new lead(s) processed`)
    }

  } catch (err) {
    console.warn('[Watcher] Poll error:', err.message)
  }
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
console.log('🎱 High Rollers Lead Alert Watcher v3')
console.log('─'.repeat(50))
console.log(`  Source:       Supabase jobs table`)
console.log(`  Poll:         every ${POLL_INTERVAL_MS / 1000}s`)
console.log(`  iMessage →   ${JOHN_PHONE}`)
console.log(`  Discord →     #high-rollers (${DISCORD_CHANNEL_ID})`)
console.log(`  Dedupe file: ${SEEN_FILE}`)
console.log('─'.repeat(50))
console.log('')

// Seed-check: verify Supabase connectivity
;(async () => {
  const jobs = await fetchSupabase('jobs?limit=1')
  console.log(`[Watcher] Supabase: ${Array.isArray(jobs) ? '✅ connected' : '❌ check env vars'}`)
})()

checkForNewLeads()
setInterval(checkForNewLeads, POLL_INTERVAL_MS)

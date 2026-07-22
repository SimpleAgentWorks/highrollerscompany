// POST /api/detailing-book — customer submits auto-detailing booking
// Saves to DB, creates Google Calendar event (if configured), sends alerts

import pool from '../../../lib/db'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const JOHN_PHONE = process.env.JOHN_PHONE || '+16304560567'
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID || '1485703222009266239'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://highrollerscompany.com'

// ── Vehicle pricing ────────────────────────────────────────────────────────────
const INTERIOR_PRICES = { '2door': 15000, '4door': 17500, 'suv': 20000, 'minivan': 25000 }
const EXTERIOR_BASE = 5000
const WAX_ADDON = 5000
const ELECTRICAL_ADDON = 2500
const WATER_ADDON = 2500

// Multi-vehicle discounts: 5% off 2nd vehicle, 10% off 3rd, 15% off 4th
function calcTotal(vehicles, electricalOption, waterOption) {
  const DISCOUNT_TIERS = [0, 0.05, 0.10, 0.15]
  let vehicleTotal = 0
  vehicles.forEach((v, idx) => {
    const base = v.package === 'interior'
      ? (INTERIOR_PRICES[v.type] || 20000)
      : EXTERIOR_BASE + (v.wax ? WAX_ADDON : 0)
    const discount = DISCOUNT_TIERS[idx] || 0
    vehicleTotal += base * (1 - discount)
  })
  let total = vehicleTotal
  if (electricalOption === 'hr_brings') total += ELECTRICAL_ADDON
  if (waterOption === 'hr_brings') total += WATER_ADDON
  return Math.round(total)
}

// ── iMessage ──────────────────────────────────────────────────────────────────
function sendIMessage(booking) {
  const DISCOUNT_TIERS = [0, 0.05, 0.10, 0.15]
  const vehicleList = booking.vehicles.map((v, idx) => {
    const typeLabel = { '2door': '2-door', '4door': '4-door', 'suv': 'SUV', 'minivan': 'Minivan' }[v.type] || v.type
    const pkg = v.package === 'interior' ? 'Interior' : 'Exterior Wash' + (v.wax ? ' + Wax' : '')
    const base = v.package === 'interior' ? (INTERIOR_PRICES[v.type] || 20000) : EXTERIOR_BASE + (v.wax ? WAX_ADDON : 0)
    const discount = DISCOUNT_TIERS[idx] || 0
    const price = Math.round(base * (1 - discount))
    const discLabel = discount > 0 ? ` (${discount * 100}% off)` : ''
    return `  • ${typeLabel} — ${pkg}${discLabel}: $${(price / 100).toFixed(2)}`
  }).join('\n')

  const lines = [
    `🚗 NEW AUTO DETAILING BOOKING`,
    ``,
    `Customer: ${booking.customer_name}`,
    `Phone: ${booking.customer_phone}`,
    `Email: ${booking.customer_email || '(none)'}`,
    `Date: ${booking.slot_date} (${booking.time_slot})`,
    `Vehicles: ${booking.vehicles.length}`,
    `${vehicleList}`,
    ``,
    `Electrical: ${booking.electrical_option === 'hr_brings' ? 'HR brings (+$25)' : 'Customer provides (free)'}`,
    `Water: ${booking.water_option === 'hr_brings' ? 'HR brings (+$25)' : 'Customer provides (free)'}`,
    `Total: $${(booking.total_price / 100).toFixed(2)}`,
    ``,
    `Address: ${booking.address || 'TBD'}, ${booking.city || ''} ${booking.state || ''} ${booking.zip || ''}`,
    ``,
    `Google Calendar: ${booking.google_calendar_event_id ? 'blocked ✅' : 'not configured'}`,
  ]
  const msg = lines.join('\n')
  const tmpFile = `/tmp/hr-detailing-${Date.now()}.txt`
  fs.writeFileSync(tmpFile, msg)
  try {
    execSync(`/opt/homebrew/bin/imsg send --to "${JOHN_PHONE}" --text "$(cat ${tmpFile})"`, { timeout: 15000, shell: '/bin/bash' })
    fs.unlinkSync(tmpFile)
    return true
  } catch (err) {
    console.warn('[iMessage]', err.message.substring(0, 100))
    try { fs.unlinkSync(tmpFile) } catch {}
    return false
  }
}

// ── Discord ───────────────────────────────────────────────────────────────────
function sendDiscord(booking) {
  const vehicleList = booking.vehicles.map(v => {
    const typeLabel = { '2door': '2-door', '4door': '4-door', 'suv': 'SUV', 'minivan': 'Minivan' }[v.type] || v.type
    const pkg = v.package === 'interior' ? 'Interior' : 'Exterior' + (v.wax ? ' + Wax' : '')
    return `  • ${typeLabel} — ${pkg}`
  }).join('\n')

  const msg = [
    `🚗 **New Auto Detailing Booking**`,
    ``,
    `**Customer:** ${booking.customer_name}`,
    `**Phone:** ${booking.customer_phone}`,
    `**Email:** ${booking.customer_email || '_none_'}`,
    `**Date:** ${booking.slot_date} (${booking.time_slot})`,
    `**Vehicles (${booking.vehicles.length}):**`,
    vehicleList,
    ``,
    `**Electrical:** ${booking.electrical_option === 'hr_brings' ? 'HR brings (+$25)' : 'Customer provides (free)'}`,
    `**Water:** ${booking.water_option === 'hr_brings' ? 'HR brings (+$25)' : 'Customer provides (free)'}`,
    `**Total Est.:** $${(booking.total_price / 100).toFixed(2)}`,
    ``,
    `**Address:** ${booking.address || 'TBD'}, ${booking.city || ''} ${booking.state || ''} ${booking.zip || ''}`,
  ].join('\n')

  const tmpFile = `/tmp/hr-detailing-discord-${Date.now()}.txt`
  fs.writeFileSync(tmpFile, msg)
  try {
    execSync(`/opt/homebrew/bin/openclaw message send --channel discord --target "${DISCORD_CHANNEL_ID}" --message "$(cat ${tmpFile})"`, { timeout: 20000, shell: '/bin/bash' })
    fs.unlinkSync(tmpFile)
    return true
  } catch (err) {
    console.warn('[Discord]', err.message.substring(0, 100))
    try { fs.unlinkSync(tmpFile) } catch {}
    return false
  }
}

// ── Main handler ───────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const {
    customer_name, customer_phone, customer_email,
    address, city, state, zip,
    slot_id, vehicles, electrical_option, water_option,
  } = req.body

  // Validate required fields
  if (!customer_name || !customer_phone || !slot_id || !vehicles || vehicles.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Look up the slot
  let slot
  try {
    const r = await pool.query(`
      SELECT *, (max_vehicles - booked_vehicles) as vehicles_remaining
      FROM detailing_slots WHERE id = $1
    `, [slot_id])
    if (r.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' })
    }
    slot = r.rows[0]
    if (slot.vehicles_remaining < vehicles.length) {
      return res.status(409).json({ error: 'Not enough vehicle capacity in this slot' })
    }
  } catch (err) {
    console.error('[detailing-book] slot lookup:', err.message)
    return res.status(500).json({ error: 'Database error' })
  }

  const total_price = calcTotal(vehicles, electrical_option || 'customer', water_option || 'customer')

  // Save booking
  let bookingId
  try {
    const r = await pool.query(`
      INSERT INTO detailing_bookings
        (slot_id, customer_name, customer_phone, customer_email,
         address, city, state, zip, vehicles, electrical_option, water_option, total_price)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING id
    `, [slot_id, customer_name, customer_phone, customer_email,
        address, city, state, zip,
        JSON.stringify(vehicles), electrical_option || 'customer', water_option || 'customer',
        total_price])
    bookingId = r.rows[0].id
  } catch (err) {
    console.error('[detailing-book] insert:', err.message)
    return res.status(500).json({ error: 'Database error' })
  }

  // Update booked_vehicles count on slot
  try {
    await pool.query(`
      UPDATE detailing_slots
      SET booked_vehicles = booked_vehicles + $1
      WHERE id = $2
    `, [vehicles.length, slot_id])
  } catch (err) {
    console.warn('[detailing-book] slot update:', err.message)
  }

  // Fire alerts
  const booking = {
    customer_name, customer_phone, customer_email,
    address, city, state, zip,
    slot_date: slot.slot_date, time_slot: slot.time_slot,
    vehicles, electrical_option, water_option, total_price,
    google_calendar_event_id: null,
  }

  const imsgOk = sendIMessage(booking)
  const discordOk = sendDiscord(booking)

  console.log(`[detailing-book] Booking ${bookingId} saved. iMessage: ${imsgOk ? '✅' : '❌'}  Discord: ${discordOk ? '✅' : '❌'}`)

  return res.status(201).json({
    success: true,
    bookingId,
    total_price,
    message: 'Booking received! We will confirm your appointment shortly.',
  })
}

// GET /api/detailing-bookings — return all bookings (with optional date range filter)
// Used by /admin/bookings

import pool from '@/lib/db'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { from, to, status, slot_id } = req.query

    const where = []
    const params = []

    if (from) {
      params.push(from)
      where.push(`b.slot_date >= $${params.length}`)
    }
    if (to) {
      params.push(to)
      where.push(`b.slot_date <= $${params.length}`)
    }
    if (status) {
      params.push(status)
      where.push(`b.status = $${params.length}`)
    }
    if (slot_id) {
      params.push(slot_id)
      where.push(`b.slot_id = $${params.length}`)
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''

    const result = await pool.query(`
      SELECT b.id, b.slot_id, b.customer_name, b.customer_phone, b.customer_email,
             b.address, b.city, b.state, b.zip, b.vehicles,
             b.electrical_option, b.water_option, b.total_price, b.status,
             b.google_calendar_event_id, b.created_at,
             s.slot_date, s.time_slot, s.location_label
      FROM detailing_bookings b
      LEFT JOIN detailing_slots s ON b.slot_id = s.id
      ${whereClause}
      ORDER BY s.slot_date DESC NULLS LAST, b.created_at DESC
    `, params)

    return res.status(200).json({ bookings: result.rows })
  } catch (err) {
    console.error('[detailing-bookings GET]', err.message)
    return res.status(500).json({ error: 'Database error' })
  }
}
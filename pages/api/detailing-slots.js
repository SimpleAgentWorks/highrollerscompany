// GET /api/detailing-slots — return available slots
// POST /api/detailing-slots — admin creates slot (needs PIN)
// DELETE /api/detailing-slots?id=xxx — admin deletes slot (needs PIN)

import pool from '../../../lib/db'

const ADMIN_PIN = process.env.DASHBOARD_PIN || '369636'

export default async function handler(req, res) {
  // ── GET: return available slots ────────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT id, slot_date, time_slot, max_vehicles, booked_vehicles,
               location_label, is_available,
               (max_vehicles - booked_vehicles) as vehicles_remaining
        FROM detailing_slots
        WHERE slot_date >= CURRENT_DATE
          AND is_available = TRUE
          AND (max_vehicles - booked_vehicles) > 0
        ORDER BY slot_date ASC,
          CASE time_slot WHEN 'morning' THEN 1 WHEN 'afternoon' THEN 2 END
      `)
      return res.status(200).json({ slots: result.rows })
    } catch (err) {
      console.error('[detailing-slots GET]', err.message)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  // ── POST: create slot (admin PIN required) ────────────────────────────────
  if (req.method === 'POST') {
    const { pin, slot_date, time_slot, max_vehicles, location_label } = req.body

    if (pin !== ADMIN_PIN) {
      return res.status(403).json({ error: 'Invalid admin PIN' })
    }
    if (!slot_date || !time_slot) {
      return res.status(400).json({ error: 'slot_date and time_slot are required' })
    }
    if (!['morning', 'afternoon'].includes(time_slot)) {
      return res.status(400).json({ error: 'time_slot must be "morning" or "afternoon"' })
    }

    try {
      const result = await pool.query(`
        INSERT INTO detailing_slots (slot_date, time_slot, max_vehicles, location_label)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [slot_date, time_slot, max_vehicles || 4, location_label || 'Customer Site'])
      return res.status(201).json({ success: true, slot: result.rows[0] })
    } catch (err) {
      console.error('[detailing-slots POST]', err.message)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  // ── DELETE: remove slot (admin PIN required) ────────────────────────────────
  if (req.method === 'DELETE') {
    const { pin, id } = req.query

    if (pin !== ADMIN_PIN) {
      return res.status(403).json({ error: 'Invalid admin PIN' })
    }
    if (!id) {
      return res.status(400).json({ error: 'id is required' })
    }

    try {
      await pool.query('DELETE FROM detailing_slots WHERE id = $1', [id])
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('[detailing-slots DELETE]', err.message)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

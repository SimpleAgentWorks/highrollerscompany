// PATCH /api/detailing-slots/[id]/availability — toggle slot availability
// Used by /admin/schedule to quickly block/unblock individual slots

import pool from '@/lib/db'

const ADMIN_PIN = process.env.DASHBOARD_PIN || '369636'

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pin, is_available } = req.body
  const { id } = req.query

  if (pin !== ADMIN_PIN) {
    return res.status(403).json({ error: 'Invalid admin PIN' })
  }
  if (!id) {
    return res.status(400).json({ error: 'id is required' })
  }

  try {
    const result = await pool.query(
      'UPDATE detailing_slots SET is_available = $1 WHERE id = $2 RETURNING *',
      [is_available, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Slot not found' })
    }
    return res.status(200).json({ success: true, slot: result.rows[0] })
  } catch (err) {
    console.error('[slot availability PATCH]', err.message)
    return res.status(500).json({ error: 'Database error' })
  }
}
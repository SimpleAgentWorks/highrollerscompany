// PATCH /api/detailing-bookings/[id]/status — update booking status
// Used by /admin/bookings to mark bookings confirmed/completed/cancelled

import pool from '@/lib/db'

const ADMIN_PIN = process.env.DASHBOARD_PIN || '369636'

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pin, status } = req.body
  const { id } = req.query

  if (pin !== ADMIN_PIN) {
    return res.status(403).json({ error: 'Invalid admin PIN' })
  }
  if (!id) {
    return res.status(400).json({ error: 'id is required' })
  }
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${VALID_STATUSES.join(', ')}`,
    })
  }

  try {
    const result = await pool.query(
      'UPDATE detailing_bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    return res.status(200).json({ success: true, booking: result.rows[0] })
  } catch (err) {
    console.error('[booking status PATCH]', err.message)
    return res.status(500).json({ error: 'Database error' })
  }
}
// POST /api/detailing-slots/block-day — block out an entire day
// Marks all slots on the given date as unavailable

import pool from '@/lib/db'

const ADMIN_PIN = process.env.DASHBOARD_PIN || '369636'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pin, slot_date } = req.body

  if (pin !== ADMIN_PIN) {
    return res.status(403).json({ error: 'Invalid admin PIN' })
  }
  if (!slot_date) {
    return res.status(400).json({ error: 'slot_date is required' })
  }

  try {
    // Block existing slots
    const updateResult = await pool.query(
      'UPDATE detailing_slots SET is_available = FALSE WHERE slot_date = $1 RETURNING id',
      [slot_date]
    )

    const blockedCount = updateResult.rows.length

    return res.status(200).json({
      success: true,
      message: blockedCount > 0
        ? `Blocked ${blockedCount} slot${blockedCount !== 1 ? 's' : ''} on ${slot_date}`
        : `No existing slots to block on ${slot_date} (any future bookings will be blocked at booking time)`,
      blocked_count: blockedCount,
    })
  } catch (err) {
    console.error('[block-day POST]', err.message)
    return res.status(500).json({ error: 'Database error' })
  }
}
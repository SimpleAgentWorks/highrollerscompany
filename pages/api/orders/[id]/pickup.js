import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const pin = req.headers['x-staff-pin'];
  if (pin !== process.env.STAFF_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing order id' });
  }

  try {
    const result = await pool.query(
      `UPDATE orders SET status = 'picked_up', picked_up_at = NOW()
       WHERE id = $1 OR stripe_session_id = $1
       RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.status(200).json({ success: true, order: result.rows[0] });
  } catch (err) {
    console.error('Failed to mark order picked up:', err);
    res.status(500).json({ error: 'Database error' });
  }
}

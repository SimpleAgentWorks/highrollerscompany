<<<<<<< HEAD
import pool from '@/lib/db';
=======
import pool from '../../../lib/db';
>>>>>>> origin/main

export default async function handler(req, res) {
  const { pin, status, dateFrom, dateTo } = req.query;

  if (pin !== process.env.STAFF_PIN && pin !== process.env.DASHBOARD_PIN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    let paramIdx = 1;

    if (status === 'paid') {
      query += ` AND status = $${paramIdx++}`;
      params.push('paid');
    } else if (status === 'unpicked') {
      query += ` AND status = 'paid'`;
    } else if (status === 'picked_up') {
      query += ` AND status = 'picked_up'`;
    }

    if (dateFrom) {
      query += ` AND created_at >= $${paramIdx++}`;
      params.push(new Date(dateFrom + 'T00:00:00'));
    }
    if (dateTo) {
      query += ` AND created_at <= $${paramIdx++}`;
      params.push(new Date(dateTo + 'T23:59:59'));
    }

    query += ' ORDER BY created_at DESC LIMIT 200';

    const result = await pool.query(query, params);
    res.status(200).json({ orders: result.rows });
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    res.status(500).json({ error: 'Database error' });
  }
}

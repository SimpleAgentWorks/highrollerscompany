<<<<<<< HEAD
import pool from '@/lib/db';
=======
import pool from '../../../lib/db';
>>>>>>> origin/main

// In-memory settings cache (30-second TTL) to avoid DB round-trips on every public request
let settingsCache = null;
let settingsCacheTime = 0;
const CACHE_TTL_MS = 30_000;

export default async function handler(req, res) {
  const pin = req.query.pin || req.headers['x-staff-pin'];

  if (req.method === 'GET') {
    const now = Date.now();
    if (settingsCache && now - settingsCacheTime < CACHE_TTL_MS) {
      return res.status(200).json({ settings: settingsCache, cached: true });
    }

    try {
      const result = await pool.query('SELECT * FROM settings WHERE id = 1 LIMIT 1');
      const settings = result.rows[0] || {
        product_name: 'Cotton Candy',
        product_description: 'Freshly spun cotton candy — $10 each',
        product_image_url: null,
        price_cents: 1000,
      };
      settingsCache = settings;
      settingsCacheTime = now;
      return res.status(200).json({ settings, cached: false });
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  if (req.method === 'PUT') {
    if (pin !== process.env.STAFF_PIN && pin !== process.env.DASHBOARD_PIN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { product_name, product_description, product_image_url, price_cents } = req.body;

    if (price_cents !== undefined && (isNaN(price_cents) || price_cents < 50)) {
      return res.status(400).json({ error: 'Price must be at least $0.50' });
    }

    try {
      const result = await pool.query(
        `UPDATE settings SET
          product_name = COALESCE($1, product_name),
          product_description = COALESCE($2, product_description),
          product_image_url = COALESCE($3, product_image_url),
          price_cents = COALESCE($4, price_cents),
          updated_at = NOW()
         WHERE id = 1
         RETURNING *`,
        [product_name, product_description, product_image_url, price_cents]
      );

      // Bust the cache so GET reflects the change immediately
      settingsCache = null;
      settingsCacheTime = 0;

      res.status(200).json({ success: true, settings: result.rows[0] });
    } catch (err) {
      console.error('Failed to update settings:', err);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

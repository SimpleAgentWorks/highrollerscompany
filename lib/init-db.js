import pool from './db';

export async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        stripe_session_id VARCHAR(255) UNIQUE,
        quantity INTEGER NOT NULL DEFAULT 1,
        amount_cents INTEGER NOT NULL,
        tip_cents INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(50) NOT NULL DEFAULT 'paid',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        picked_up_at TIMESTAMP
      );
    `);

    // Product settings table — one row, staff-editable
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        product_name VARCHAR(255) NOT NULL DEFAULT 'Cotton Candy',
        product_description TEXT DEFAULT 'Freshly spun cotton candy',
        product_image_url TEXT,
        price_cents INTEGER NOT NULL DEFAULT 1000,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Seed default settings if empty
    await client.query(`
      INSERT INTO settings (id, product_name, product_description, price_cents)
      VALUES (1, 'Cotton Candy', 'Freshly spun cotton candy — $10 each', 1000)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log('Database tables ready');
  } finally {
    client.release();
  }
}

export default initDB;

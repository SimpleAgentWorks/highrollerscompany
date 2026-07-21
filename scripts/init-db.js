// Run once to create all required tables
// Usage: node scripts/init-db.js
import pool from '../lib/db.js';

async function init() {
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
    console.log('✅ orders table ready');

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
    console.log('✅ settings table ready');

    await client.query(`
      INSERT INTO settings (id, product_name, product_description, price_cents)
      VALUES (1, 'Cotton Candy', 'Freshly spun cotton candy — $10 each', 1000)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ default settings seeded');
    console.log('\n🎉 Database is ready!');
    console.log('   PINs: STAFF=3696, DASHBOARD=369636');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

init();

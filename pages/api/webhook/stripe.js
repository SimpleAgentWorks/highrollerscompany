import Stripe from 'stripe';
<<<<<<< HEAD
import pool from '@/lib/db';
=======
import pool from '../../../lib/db';
>>>>>>> origin/main

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  // req.body is a Buffer when bodyParser is false
  const rawBody = req.body;

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const quantity = parseInt(session.metadata?.quantity || '1', 10);
    const amountTotal = session.amount_total || 0;

    try {
      await pool.query(
        `INSERT INTO orders (id, stripe_session_id, quantity, amount_cents, status, created_at)
         VALUES ($1, $2, $3, $4, 'paid', NOW())
         ON CONFLICT (stripe_session_id) DO NOTHING`,
        [session.id, session.id, quantity, amountTotal]
      );
      console.log(`Order recorded for session: ${session.id}`);
    } catch (err) {
      console.error('Failed to save order:', err);
      return res.status(500).json({ error: 'Database error' });
    }
  }

  res.status(200).json({ received: true });
}

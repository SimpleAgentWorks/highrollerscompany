import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { quantity, price_cents, product_name } = req.body;

  if (!quantity || quantity < 1 || quantity > 10) {
    return res.status(400).json({ error: 'Invalid quantity' });
  }

  const unit_amount = price_cents || 1000;
  const name = product_name || 'Cotton Candy';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name,
              description: `${quantity} × ${name} @ $${(unit_amount / 100).toFixed(2)} each`,
            },
            unit_amount,
          },
          quantity,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pay/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pay?canceled=true`,
      metadata: {
        quantity: String(quantity),
        price_cents: String(unit_amount),
        product_name: name,
      },
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    res.status(500).json({ error: err.message });
  }
}

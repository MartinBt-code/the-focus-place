const Stripe = require('stripe');

const EARLY_BIRD_CENTS = 8900;
const REGULAR_CENTS = 9900;
const EARLY_BIRD_DEADLINE = new Date('2026-09-01T00:00:00+02:00');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Platobná brána nie je nastavená.' });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const unitAmount = new Date() < EARLY_BIRD_DEADLINE ? EARLY_BIRD_CENTS : REGULAR_CENTS;
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      phone_number_collection: { enabled: true },
      custom_fields: [
        {
          key: 'meno',
          label: { type: 'custom', custom: 'Meno a priezvisko' },
          type: 'text',
        },
        {
          key: 'zameranie',
          label: { type: 'custom', custom: 'Pracovné zameranie' },
          type: 'dropdown',
          dropdown: {
            options: [
              { label: 'Basketbal', value: 'basketbal' },
              { label: 'Kondičné trénerstvo', value: 'kondicne_trenerstvo' },
              { label: 'Fyzio', value: 'fyzio' },
              { label: 'Kondičný tréning - futbal', value: 'kondicny_trening_futbal' },
              { label: 'Iné', value: 'ine' },
            ],
          },
        },
      ],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: unitAmount,
            product_data: {
              name: 'Workshop: Vizuálny a kognitívny tréning',
              description: '3. 10. 2026 · Košice',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/workshop/uspech.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/workshop/zrusene.html`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Nepodarilo sa vytvoriť platbu.' });
  }
};

const Stripe = require('stripe');

const PRODUCTS = {
  'kondicny-trening': {
    priceCents: 100,
    sk: {
      name: 'Kondičný tréning (test)',
      description: 'Testovacia objednávka na overenie platobného procesu.',
    },
  },
};

const TRANSLATIONS = {
  sk: {
    locale: 'sk',
    fieldMeno: 'Meno a priezvisko',
    notConfigured: 'Platobná brána nie je nastavená.',
    notFound: 'Produkt nebol nájdený.',
    genericError: 'Nepodarilo sa vytvoriť platbu.',
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let lang = 'sk';
  let productId = '';
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    if (body.lang && TRANSLATIONS[body.lang]) lang = body.lang;
    productId = body.productId || '';
  } catch (e) {}

  const t = TRANSLATIONS[lang];
  const product = PRODUCTS[productId];

  if (!product || !product[lang]) {
    return res.status(400).json({ error: t.notFound });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: t.notConfigured });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const langPrefix = lang === 'sk' ? '' : `${lang}/`;
    const info = product[lang];

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      locale: t.locale,
      phone_number_collection: { enabled: true },
      billing_address_collection: 'required',
      tax_id_collection: { enabled: true },
      custom_fields: [
        {
          key: 'meno',
          label: { type: 'custom', custom: t.fieldMeno },
          type: 'text',
        },
      ],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: product.priceCents,
            product_data: {
              name: info.name,
              description: info.description,
            },
          },
          quantity: 1,
        },
      ],
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: info.name,
        },
      },
      success_url: `${origin}/${langPrefix}objednavka/uspech.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${langPrefix}objednavka/zrusene.html`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: t.genericError });
  }
};

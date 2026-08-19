const Stripe = require('stripe');

const EARLY_BIRD_CENTS = 8900;
const REGULAR_CENTS = 9900;
const EARLY_BIRD_DEADLINE = new Date('2026-09-01T00:00:00+02:00');

const TRANSLATIONS = {
  sk: {
    locale: 'sk',
    productName: 'Workshop: Vizuálny a kognitívny tréning',
    productDescription: '3. 10. 2026 · Košice',
    invoiceDescription: 'Workshop: Vizuálny a kognitívny tréning — 3. 10. 2026, Košice',
    fieldMeno: 'Meno a priezvisko',
    fieldZameranie: 'Zameranie (napr. kondičný tréner, fyzio)',
    notConfigured: 'Platobná brána nie je nastavená.',
    genericError: 'Nepodarilo sa vytvoriť platbu.',
  },
  en: {
    locale: 'en',
    productName: 'Workshop: Visual and Cognitive Training',
    productDescription: 'Oct 3, 2026 · Košice',
    invoiceDescription: 'Workshop: Visual and Cognitive Training — Oct 3, 2026, Košice',
    fieldMeno: 'Full name',
    fieldZameranie: 'Field (e.g. strength coach, physio)',
    notConfigured: 'The payment gateway is not configured.',
    genericError: 'Could not create the payment.',
  },
  de: {
    locale: 'de',
    productName: 'Workshop: Visuelles und kognitives Training',
    productDescription: '3.10.2026 · Košice',
    invoiceDescription: 'Workshop: Visuelles und kognitives Training — 3.10.2026, Košice',
    fieldMeno: 'Vollständiger Name',
    fieldZameranie: 'Tätigkeitsbereich (z.B. Trainer, Physio)',
    notConfigured: 'Das Zahlungssystem ist nicht konfiguriert.',
    genericError: 'Die Zahlung konnte nicht erstellt werden.',
  },
  hu: {
    locale: 'hu',
    productName: 'Workshop: Vizuális és kognitív tréning',
    productDescription: '2026.10.03. · Kassa',
    invoiceDescription: 'Workshop: Vizuális és kognitív tréning — 2026.10.03., Kassa',
    fieldMeno: 'Teljes név',
    fieldZameranie: 'Szakterület (pl. erőnléti edző, gyógytornász)',
    notConfigured: 'A fizetési rendszer nincs beállítva.',
    genericError: 'Nem sikerült létrehozni a fizetést.',
  },
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let lang = 'sk';
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    if (body.lang && TRANSLATIONS[body.lang]) lang = body.lang;
  } catch (e) {}

  const t = TRANSLATIONS[lang];

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: t.notConfigured });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const unitAmount = new Date() < EARLY_BIRD_DEADLINE ? EARLY_BIRD_CENTS : REGULAR_CENTS;
    const origin = req.headers.origin || `https://${req.headers.host}`;
    const langPrefix = lang === 'sk' ? '' : `${lang}/`;

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
        {
          key: 'zameranie',
          label: { type: 'custom', custom: t.fieldZameranie },
          type: 'text',
          text: { maximum_length: 100 },
        },
      ],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: unitAmount,
            product_data: {
              name: t.productName,
              description: t.productDescription,
            },
          },
          quantity: 1,
        },
      ],
      invoice_creation: {
        enabled: true,
        invoice_data: {
          description: t.invoiceDescription,
        },
      },
      success_url: `${origin}/${langPrefix}workshop/uspech.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${langPrefix}workshop/zrusene.html`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: t.genericError });
  }
};

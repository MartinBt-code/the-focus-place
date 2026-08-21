const Stripe = require('stripe');

const EMAIL = {
  sk: {
    subject: 'Potvrdenie prihlásenia — Workshop: Vizuálny a kognitívny tréning',
    greeting: (name) => `Ahoj${name ? ' ' + name : ''},`,
    body: [
      'ďakujeme za prihlásenie na náš workshop <strong>Vizuálny a kognitívny tréning</strong> (3. 10. 2026, Košice).',
      'Budeme sa tešiť na vašu účasť. Všetky potrebné informácie (presný program, miesto stretnutia a ďalšie pokyny) budeme priebežne aktualizovať a zašleme pred konaním workshopu.',
    ],
    signoff: 'S pozdravom,<br>the Focus Place',
  },
  en: {
    subject: 'Registration confirmed — Workshop: Visual and Cognitive Training',
    greeting: (name) => `Hi${name ? ' ' + name : ''},`,
    body: [
      'thank you for registering for our <strong>Visual and Cognitive Training</strong> workshop (Oct 3, 2026, Košice).',
      "We're looking forward to having you there. All the details you'll need (exact schedule, meeting point, and further instructions) will be updated and sent to you before the workshop.",
    ],
    signoff: 'Best regards,<br>the Focus Place',
  },
  de: {
    subject: 'Anmeldung bestätigt — Workshop: Visuelles und kognitives Training',
    greeting: (name) => `Hallo${name ? ' ' + name : ''},`,
    body: [
      'vielen Dank für deine Anmeldung zu unserem Workshop <strong>Visuelles und kognitives Training</strong> (3.10.2026, Košice).',
      'Wir freuen uns auf deine Teilnahme. Alle notwendigen Informationen (genauer Ablauf, Treffpunkt und weitere Hinweise) werden laufend aktualisiert und dir vor dem Workshop zugeschickt.',
    ],
    signoff: 'Viele Grüße,<br>the Focus Place',
  },
  hu: {
    subject: 'Jelentkezés visszaigazolva — Workshop: Vizuális és kognitív tréning',
    greeting: (name) => `Szia${name ? ' ' + name : ''},`,
    body: [
      'köszönjük, hogy jelentkeztél <strong>Vizuális és kognitív tréning</strong> workshopunkra (2026.10.03., Kassa).',
      'Már várjuk a részvételedet. Minden szükséges információt (pontos program, találkozási pont és további tudnivalók) folyamatosan frissítünk, és a workshop előtt elküldjük.',
    ],
    signoff: 'Üdvözlettel,<br>the Focus Place',
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

function renderEmailHtml(t, name) {
  const paragraphs = t.body.map((p) => `<p style="margin:0 0 16px; color:#333; font-size:15px; line-height:1.6;">${p}</p>`).join('');
  return `
  <div style="background:#11181D; padding:32px 0;">
    <div style="max-width:480px; margin:0 auto; background:#F2F0EB; border-radius:6px; padding:36px;">
      <p style="margin:0 0 20px; color:#111; font-size:16px; font-weight:600;">${t.greeting(name)}</p>
      ${paragraphs}
      <p style="margin:24px 0 0; color:#333; font-size:15px; line-height:1.6;">${t.signoff}</p>
    </div>
  </div>`;
}

async function sendThankYouEmail(email, name, lang) {
  const t = EMAIL[lang] || EMAIL.sk;
  const from = process.env.RESEND_FROM || 'the Focus Place <onboarding@resend.dev>';
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: t.subject,
      html: renderEmailHtml(t, name),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('Resend error:', res.status, text);
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook not configured');
    return res.status(500).end();
  }

  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  let event;
  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const email = session.customer_details && session.customer_details.email;
    const lang = (session.metadata && session.metadata.lang) || 'sk';
    const nameField = (session.custom_fields || []).find((f) => f.key === 'meno');
    const name = (nameField && nameField.text && nameField.text.value) || '';

    if (email && process.env.RESEND_API_KEY) {
      try {
        await sendThankYouEmail(email, name, lang);
      } catch (err) {
        console.error('Failed to send thank-you email:', err);
      }
    }
  }

  res.status(200).json({ received: true });
};

module.exports.config = {
  api: {
    bodyParser: false,
  },
};

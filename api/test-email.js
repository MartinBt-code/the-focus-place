module.exports = async (req, res) => {
  const email = (req.query && req.query.email) || '11bielko11@gmail.com';
  const lang = (req.query && req.query.lang) || 'sk';
  const name = 'Martin';

  const t = {
    sk: {
      subject: 'Potvrdenie prihlásenia — Workshop: Vizuálny a kognitívny tréning',
      greeting: `Ahoj ${name},`,
      body: [
        'ďakujeme za prihlásenie na náš workshop <strong>Vizuálny a kognitívny tréning</strong> (3. 10. 2026, Košice).',
        'Budeme sa tešiť na vašu účasť. Všetky potrebné informácie (presný program, miesto stretnutia a ďalšie pokyny) budeme priebežne aktualizovať a zašleme pred konaním workshopu.',
      ],
      signoff: 'S pozdravom,<br>the Focus Place',
    },
  }[lang];

  const paragraphs = t.body.map((p) => `<p style="margin:0 0 16px; color:#333; font-size:15px; line-height:1.6;">${p}</p>`).join('');
  const html = `
  <div style="background:#11181D; padding:32px 0;">
    <div style="max-width:480px; margin:0 auto; background:#F2F0EB; border-radius:6px; padding:36px;">
      <p style="margin:0 0 20px; color:#111; font-size:16px; font-weight:600;">${t.greeting}</p>
      ${paragraphs}
      <p style="margin:24px 0 0; color:#333; font-size:15px; line-height:1.6;">${t.signoff}</p>
    </div>
  </div>`;

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY not configured' });
  }

  const from = process.env.RESEND_FROM || 'the Focus Place <onboarding@resend.dev>';
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [email], subject: t.subject, html }),
  });
  const data = await r.json().catch(() => ({}));
  res.status(r.status).json({ ok: r.ok, from, to: email, resend: data });
};

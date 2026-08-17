// Vercel serverless function — POST /api/contact
//
// A submission is delivered to two independent sinks:
//   1. Growth OS CRM  (only when CRM_WEBHOOK_URL is configured)
//   2. info@youmaketv.ai via Resend (only when RESEND_API_KEY is configured)
//
// The visitor sees "sent" if EITHER sink accepted the lead, so a missing/expired
// Resend key can no longer swallow leads with a 503, and a CRM outage can never
// break the form when email is working. Only a total failure surfaces an error.
//
// Setup: add CRM_WEBHOOK_URL (the Growth OS lead hook, which embeds a secret
// token — never hardcode it here) and, for the email copy, RESEND_API_KEY to the
// Vercel env vars, then verify youmaketv.ai in Resend (DNS TXT + MX records).

const TO_EMAIL = 'info@youmaketv.ai';
const FROM_EMAIL = 'YouMakeTV <noreply@youmaketv.ai>';

// Growth OS CRM lead webhook. The URL carries a secret token, so it lives in the
// env only — there is deliberately no fallback value in this source file.
const CRM_TIMEOUT_MS = 5000;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Drop keys whose value is empty / null / undefined (and empty nested objects).
function compact(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) continue;
    if (typeof v === 'string' && v.trim() === '') continue;
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) continue;
    out[k] = v;
  }
  return out;
}

function splitName(full) {
  const parts = String(full ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
}

// Allowed origins for the contact form. Any deploy preview / production domain
// that should be able to POST here must be listed. '*' is intentionally avoided
// so this email-sending endpoint can't be invoked from arbitrary sites.
const ALLOWED_ORIGINS = new Set([
  'https://youmaketv.ai',
  'https://www.youmaketv.ai',
  'http://localhost:5173',
  'http://localhost:4173',
]);

// ── Sink 1: Growth OS CRM ────────────────────────────────────────────────────
// Never throws. Returns true only when the CRM confirmed receipt.
async function forwardToCrm(payload) {
  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn('CRM_WEBHOOK_URL is not set — skipping the CRM copy of this lead.');
    return false;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CRM_TIMEOUT_MS);
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('CRM webhook error:', response.status, errText.slice(0, 500));
      return false;
    }
    return true;
  } catch (err) {
    console.error('CRM webhook exception:', err?.name === 'AbortError' ? 'timeout' : err);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

// ── Sink 2: email via Resend ─────────────────────────────────────────────────
// Never throws. Returns false when the key is missing or Resend rejects.
async function sendEmail({ name, email, phone, company, subject, message, meta }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set — skipping the email copy of this lead.');
    return false;
  }

  const row = (label, value) => `
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;width:120px">${escHtml(label)}</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${value}</td>
        </tr>`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a">
      <div style="border-left:4px solid #6d28d9;padding-left:16px;margin-bottom:24px">
        <h1 style="margin:0;font-size:20px;font-weight:700">New Contact Form Submission</h1>
        <p style="margin:4px 0 0;color:#64748b;font-size:14px">YouMakeTV.ai</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
        ${row('Name', escHtml(name))}
        ${row('Email', `<a href="mailto:${escHtml(email)}" style="color:#6d28d9;text-decoration:none">${escHtml(email)}</a>`)}
        ${phone ? row('Phone', `<a href="tel:${escHtml(phone)}" style="color:#6d28d9;text-decoration:none">${escHtml(phone)}</a>`) : ''}
        ${company ? row('Company', escHtml(company)) : ''}
        ${row('Subject', escHtml(subject))}
        ${meta.page ? row('Page', escHtml(meta.page)) : ''}
      </table>

      <div style="background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e2e8f0;margin-bottom:24px">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em">Message</p>
        <p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#0f172a">${escHtml(message)}</p>
      </div>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="color:#94a3b8;font-size:11px;margin:0">
        Reply-To is set to <strong>${escHtml(email)}</strong> — you can reply directly to this email to respond to the sender.
      </p>
      <p style="color:#94a3b8;font-size:11px;margin:4px 0 0">Sent via YouMakeTV.ai contact form</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        reply_to: email,
        subject: `[YouMakeTV] ${subject} — from ${name}`,
        html,
        text:
          `Name: ${name}\nEmail: ${email}\n` +
          (phone ? `Phone: ${phone}\n` : '') +
          (company ? `Company: ${company}\n` : '') +
          `Subject: ${subject}\n\n${message}`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error('Resend API error:', response.status, errText.slice(0, 500));
      return false;
    }
    return true;
  } catch (err) {
    console.error('Resend exception:', err);
    return false;
  }
}

export default async function handler(req, res) {
  // Lock CORS to known origins — this endpoint spends money (Resend) per call.
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, company, subject, message, page, referrer, utm, _gotcha } = req.body ?? {};

  // Honeypot: bots fill this hidden field; humans don't see it
  if (_gotcha) {
    // Silently accept — don't reveal spam detection to bots
    return res.status(200).json({ ok: true });
  }

  // Input validation
  const trimName    = String(name    ?? '').trim();
  const trimEmail   = String(email   ?? '').trim();
  const trimPhone   = String(phone   ?? '').trim();
  const trimCompany = String(company ?? '').trim();
  const trimSubject = String(subject ?? 'General').trim() || 'General';
  const trimMessage = String(message ?? '').trim();

  if (!trimName || !trimEmail || !trimMessage) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (trimMessage.length > 10000) {
    return res.status(400).json({ error: 'Message is too long (max 10,000 characters).' });
  }
  // Cap the short fields too — they land in the email subject/headers.
  if (trimName.length > 200 || trimEmail.length > 320 || trimSubject.length > 200) {
    return res.status(400).json({ error: 'One or more fields exceed the allowed length.' });
  }
  if (trimPhone.length > 40 || trimCompany.length > 200) {
    return res.status(400).json({ error: 'One or more fields exceed the allowed length.' });
  }

  // Page context, sanitised — never trust the client blindly.
  const meta = {
    page: String(page ?? req.headers.referer ?? '').trim().slice(0, 500),
    referrer: String(referrer ?? '').trim().slice(0, 500),
  };
  const cleanUtm = {};
  if (utm && typeof utm === 'object') {
    for (const key of UTM_KEYS) {
      const value = String(utm[key] ?? '').trim().slice(0, 200);
      if (value) cleanUtm[key] = value;
    }
  }

  const { firstName, lastName } = splitName(trimName);

  // Both sinks run in parallel; neither can reject the request on its own.
  const [crmOk, emailOk] = await Promise.all([
    forwardToCrm(
      compact({
        name: trimName,
        firstName,
        lastName,
        email: trimEmail,
        phone: trimPhone,
        company: trimCompany,
        source: 'youmaketv-contact',
        sourceDetail: trimSubject,
        page: meta.page,
        referrer: meta.referrer,
        utm: cleanUtm,
        fields: compact({ subject: trimSubject, message: trimMessage }),
      })
    ),
    sendEmail({
      name: trimName,
      email: trimEmail,
      phone: trimPhone,
      company: trimCompany,
      subject: trimSubject,
      message: trimMessage,
      meta,
    }),
  ]);

  if (crmOk || emailOk) {
    return res.status(200).json({ ok: true });
  }

  console.error('Contact submission failed on every sink (CRM + email).');
  return res.status(502).json({
    error: 'We could not deliver your message right now. Please email info@youmaketv.ai directly.',
  });
}

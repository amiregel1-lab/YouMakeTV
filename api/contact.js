// Vercel serverless function — POST /api/contact
// Sends form submissions to info@youmaketv.ai via Resend.
// Setup: add RESEND_API_KEY to Vercel environment variables.
// Domain: verify youmaketv.ai in Resend dashboard (DNS TXT + MX records).

const TO_EMAIL = 'info@youmaketv.ai';
const FROM_EMAIL = 'YouMakeTV <noreply@youmaketv.ai>';

function escHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  // CORS headers so the SPA can call this from any origin during dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, subject, message, _gotcha } = req.body ?? {};

  // Honeypot: bots fill this hidden field; humans don't see it
  if (_gotcha) {
    // Silently accept — don't reveal spam detection to bots
    return res.status(200).json({ ok: true });
  }

  // Input validation
  const trimName    = String(name    ?? '').trim();
  const trimEmail   = String(email   ?? '').trim();
  const trimSubject = String(subject ?? 'General').trim();
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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Graceful degradation: tell user to email directly
    console.error('RESEND_API_KEY is not set');
    return res.status(503).json({
      error: 'Email service is not configured. Please email info@youmaketv.ai directly.',
    });
  }

  const subjectLine = `[YouMakeTV] ${trimSubject} — from ${trimName}`;

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a">
      <div style="border-left:4px solid #6d28d9;padding-left:16px;margin-bottom:24px">
        <h1 style="margin:0;font-size:20px;font-weight:700">New Contact Form Submission</h1>
        <p style="margin:4px 0 0;color:#64748b;font-size:14px">YouMakeTV.ai</p>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px">
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;width:120px">Name</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${escHtml(trimName)}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#475569;background:#f8fafc;border:1px solid #e2e8f0">Email</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0"><a href="mailto:${escHtml(trimEmail)}" style="color:#6d28d9;text-decoration:none">${escHtml(trimEmail)}</a></td>
        </tr>
        <tr>
          <td style="padding:10px 12px;font-weight:600;color:#475569;background:#f8fafc;border:1px solid #e2e8f0">Subject</td>
          <td style="padding:10px 12px;border:1px solid #e2e8f0">${escHtml(trimSubject)}</td>
        </tr>
      </table>

      <div style="background:#f8fafc;border-radius:8px;padding:16px;border:1px solid #e2e8f0;margin-bottom:24px">
        <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em">Message</p>
        <p style="margin:0;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#0f172a">${escHtml(trimMessage)}</p>
      </div>

      <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0"/>
      <p style="color:#94a3b8;font-size:11px;margin:0">
        Reply-To is set to <strong>${escHtml(trimEmail)}</strong> — you can reply directly to this email to respond to the sender.
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
        reply_to: trimEmail,
        subject: subjectLine,
        html,
        text: `Name: ${trimName}\nEmail: ${trimEmail}\nSubject: ${trimSubject}\n\n${trimMessage}`,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Resend API error:', response.status, errText);
      return res.status(502).json({
        error: 'Failed to deliver your message. Please try again or email info@youmaketv.ai directly.',
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact handler exception:', err);
    return res.status(500).json({ error: 'Server error. Please try again later.' });
  }
}

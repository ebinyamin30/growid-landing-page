const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   'mail.growid.ai',
  port:    465,
  secure:  true,
  auth: {
    user: 'landing@growid.ai',
    pass: 'R3n4nEl4dGr0w!'
  },
  tls: {
    rejectUnauthorized: false
  }
});

module.exports = async function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { firstName, lastName, email, service, message } = req.body;

  if (!firstName || !lastName || !email) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }

  const htmlBody = `
    <div dir="rtl" style="font-family:Arial,sans-serif;font-size:15px;line-height:1.8;color:#222;">
      <h2 style="color:#7B5CF5;margin-bottom:20px;">פנייה חדשה מדף הנחיתה</h2>
      <table style="border-collapse:collapse;width:100%;max-width:500px;">
        <tr>
          <td style="padding:8px 12px;font-weight:bold;background:#f5f5f5;border:1px solid #ddd;width:140px;">שם פרטי</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${firstName}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:bold;background:#f5f5f5;border:1px solid #ddd;">שם משפחה</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${lastName}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:bold;background:#f5f5f5;border:1px solid #ddd;">אימייל</td>
          <td style="padding:8px 12px;border:1px solid #ddd;"><a href="mailto:${email}">${email}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 12px;font-weight:bold;background:#f5f5f5;border:1px solid #ddd;">תחום עניין</td>
          <td style="padding:8px 12px;border:1px solid #ddd;">${service || 'לא צוין'}</td>
        </tr>
      </table>
      ${message ? `
        <div style="margin-top:20px;">
          <strong>הודעה:</strong>
          <p style="background:#f9f9f9;padding:14px;border-right:3px solid #7B5CF5;margin-top:8px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>` : ''}
      <p style="margin-top:24px;font-size:12px;color:#888;">נשלח מדף הנחיתה של Growid.AI</p>
    </div>
  `;

  const textBody = [
    `שם פרטי:    ${firstName}`,
    `שם משפחה:   ${lastName}`,
    `אימייל:      ${email}`,
    `תחום עניין: ${service || 'לא צוין'}`,
    '',
    'הודעה:',
    message || '—'
  ].join('\n');

  try {
    await transporter.sendMail({
      from:    '"Growid Landing" <landing@growid.ai>',
      to:      'growidagency@gmail.com',
      replyTo: email,
      subject: 'Growid - Contact from landing page',
      text:    textBody,
      html:    htmlBody
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('Mail error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
};

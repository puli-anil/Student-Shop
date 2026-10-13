const tls = require('tls');
const crypto = require('crypto');

// Gmail SMTP Credentials (with environment variable fallback)
const GMAIL_USER = process.env.GMAIL_USER || 'pulianil72@gmail.com';
const GMAIL_APP_PASSWORD = (process.env.GMAIL_APP_PASSWORD || 'xvcd adrx ggle sgkn').replace(/\s+/g, '');
const OTP_SECRET = process.env.OTP_SECRET || 'student-shop-rvrjc-secret-2026';

function sendTlsEmail(toEmail, otpCode) {
  return new Promise((resolve, reject) => {
    const client = tls.connect(465, 'smtp.gmail.com', { timeout: 10000 }, () => {});

    let step = 0;
    const userB64 = Buffer.from(GMAIL_USER).toString('base64');
    const passB64 = Buffer.from(GMAIL_APP_PASSWORD).toString('base64');

    const emailData = [
      `From: "Student Shop" <${GMAIL_USER}>`,
      `To: ${toEmail}`,
      `Subject: Your Student Shop Verification Code: ${otpCode}`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      `<div style="font-family: Arial, sans-serif; padding: 25px; background: #F4F1EA; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #E2DDD3;">`,
      `  <h2 style="color: #102A27; margin-bottom: 8px; font-size: 22px;">Student Shop Campus Verification</h2>`,
      `  <p style="color: #5C6B68; font-size: 14px; line-height: 1.5;">Your 6-digit verification code for your student account is:</p>`,
      `  <div style="background: #102A27; color: #F59E0B; font-size: 34px; font-weight: bold; letter-spacing: 6px; padding: 16px 24px; text-align: center; border-radius: 12px; margin: 20px 0;">${otpCode}</div>`,
      `  <p style="color: #5C6B68; font-size: 13px;">This code expires in 5 minutes. Please do not share it with anyone.</p>`,
      `  <hr style="border: none; border-top: 1px solid #E2DDD3; margin: 20px 0;" />`,
      `  <p style="color: #888; font-size: 11px;">R.V.R. & J.C. College of Engineering — Hyperlocal Student Marketplace</p>`,
      `</div>`,
      `.`
    ].join('\r\n');

    client.on('data', (data) => {
      const msg = data.toString();

      if (step === 0 && msg.startsWith('220')) {
        step = 1;
        client.write('EHLO localhost\r\n');
      } else if (step === 1 && msg.startsWith('250')) {
        step = 2;
        client.write('AUTH LOGIN\r\n');
      } else if (step === 2 && msg.startsWith('334')) {
        step = 3;
        client.write(`${userB64}\r\n`);
      } else if (step === 3 && msg.startsWith('334')) {
        step = 4;
        client.write(`${passB64}\r\n`);
      } else if (step === 4 && msg.startsWith('235')) {
        step = 5;
        client.write(`MAIL FROM:<${GMAIL_USER}>\r\n`);
      } else if (step === 5 && msg.startsWith('250')) {
        step = 6;
        client.write(`RCPT TO:<${toEmail}>\r\n`);
      } else if (step === 6 && msg.startsWith('250')) {
        step = 7;
        client.write('DATA\r\n');
      } else if (step === 7 && msg.startsWith('354')) {
        step = 8;
        client.write(`${emailData}\r\n`);
      } else if (step === 8 && msg.startsWith('250')) {
        step = 9;
        client.write('QUIT\r\n');
        resolve({ success: true });
      } else if (msg.startsWith('5')) {
        reject(new Error(msg.trim()));
      }
    });

    client.on('error', (err) => reject(err));
    client.on('timeout', () => {
      client.destroy();
      reject(new Error('SMTP connection timed out after 10s'));
    });
  });
}

// In-Memory store for localhost server reuse
global.__STUDENT_SHOP_OTP_STORE = global.__STUDENT_SHOP_OTP_STORE || {};

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ success: false, error: 'Method Not Allowed' }));
  }

  // Parse Body
  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      if (typeof body === 'string') {
        body = JSON.parse(body);
      } else {
        body = await new Promise((resolve) => {
          let str = '';
          req.on('data', chunk => str += chunk);
          req.on('end', () => {
            try { resolve(JSON.parse(str || '{}')); }
            catch (e) { resolve({}); }
          });
        });
      }
    } catch (e) {
      body = {};
    }
  }

  const email = (body.email || '').toLowerCase().trim();
  if (!email || !email.includes('@') || !email.includes('.')) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'A valid email address is required.' }));
  }

  try {
    // Generate 6-digit random OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Create tamper-proof HMAC verification token
    const token = crypto.createHmac('sha256', OTP_SECRET)
      .update(`${email}:${otpCode}:${expiresAt}`)
      .digest('hex');

    // Store in global memory store as fallback
    global.__STUDENT_SHOP_OTP_STORE[email] = {
      otp: otpCode,
      expiresAt: expiresAt
    };

    console.log(`[OTP] Dispatching email to ${email} (Expires in 5 min)...`);
    await sendTlsEmail(email, otpCode);
    console.log(`[OTP SUCCESS] Email successfully delivered to ${email}`);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      message: `Verification code sent to ${email}`,
      token: token,
      expiresAt: expiresAt
    }));
  } catch (err) {
    console.error('[OTP ERROR]', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: `Could not send verification email: ${err.message}`
    }));
  }
};

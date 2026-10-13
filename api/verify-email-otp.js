const crypto = require('crypto');

const OTP_SECRET = process.env.OTP_SECRET || 'student-shop-rvrjc-secret-2026';
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
  const otp = (body.otp || '').trim();
  const token = body.token;
  const expiresAt = Number(body.expiresAt || 0);

  if (!email || !otp) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Email and 6-digit OTP code are required.' }));
  }

  // 1. Primary Stateless Verification via HMAC token
  if (token && expiresAt) {
    if (Date.now() > expiresAt) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        error: 'OTP code has expired (valid for 5 minutes). Please request a new code.'
      }));
    }

    const expectedToken = crypto.createHmac('sha256', OTP_SECRET)
      .update(`${email}:${otp}:${expiresAt}`)
      .digest('hex');

    if (token === expectedToken) {
      // Valid! Clear any fallback store
      delete global.__STUDENT_SHOP_OTP_STORE[email];
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, message: 'OTP verified successfully!' }));
    }
  }

  // 2. Fallback to in-memory store
  const record = global.__STUDENT_SHOP_OTP_STORE[email];
  if (record) {
    if (Date.now() > record.expiresAt) {
      delete global.__STUDENT_SHOP_OTP_STORE[email];
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        error: 'OTP code expired. Please request a new code.'
      }));
    }

    if (record.otp === otp) {
      delete global.__STUDENT_SHOP_OTP_STORE[email];
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ success: true, message: 'OTP verified successfully!' }));
    }
  }

  res.statusCode = 400;
  res.setHeader('Content-Type', 'application/json');
  return res.end(JSON.stringify({
    success: false,
    error: 'Invalid 6-digit OTP code. Please check your email inbox.'
  }));
};

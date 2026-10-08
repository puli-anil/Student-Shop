const http = require('http');
const fs = require('fs');
const path = require('path');
const tls = require('tls');

// Load environment variables from .env
function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        process.env[key.trim()] = val;
      }
    });
  }
}
loadEnv();

const PORT = process.env.PORT || 5173;

// In-Memory OTP Store (Email -> { otp, expiresAt })
const otpStore = {};

// Clean expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  Object.keys(otpStore).forEach(email => {
    if (otpStore[email].expiresAt < now) {
      delete otpStore[email];
    }
  });
}, 5 * 60 * 1000);

// Zero-Dependency Pure Node.js Gmail TLS SMTP Sender
function sendGmailOtp(toEmail, otpCode) {
  return new Promise((resolve) => {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword || gmailUser === 'yourproject@gmail.com') {
      console.log(`\n⚠️  [SMTP WARNING] Real Gmail credentials not set in .env yet.`);
      console.log(`👉 To send real emails to inbox, add GMAIL_USER & GMAIL_APP_PASSWORD in .env file!`);
      console.log(`🔐 [LOCAL DEBUG OTP] Code for ${toEmail}: ${otpCode}\n`);
      return resolve({ success: true, simulated: true });
    }

    console.log(`\n📧 [SMTP DISPATCH] Sending real email via Gmail SMTP to ${toEmail}...`);
    
    const client = tls.connect(465, 'smtp.gmail.com', () => {
      // Connected via TLS
    });

    let step = 0;
    const userB64 = Buffer.from(gmailUser).toString('base64');
    const passB64 = Buffer.from(gmailAppPassword.replace(/\s+/g, '')).toString('base64');

    const emailData = [
      `From: "Student Shop" <${gmailUser}>`,
      `To: ${toEmail}`,
      `Subject: Your Student Shop Verification OTP: ${otpCode}`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      `<div style="font-family: Arial, sans-serif; padding: 25px; background: #F4F1EA; border-radius: 16px; max-width: 500px; margin: 0 auto; border: 1px solid #E2DDD3;">`,
      `  <h2 style="color: #102A27; margin-bottom: 10px; font-size: 22px;">Student Shop Verification</h2>`,
      `  <p style="color: #5C6B68; font-size: 14px; line-height: 1.5;">Your 6-digit One Time Password (OTP) to complete your student login/registration is:</p>`,
      `  <div style="background: #102A27; color: #F59E0B; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 15px 25px; text-align: center; border-radius: 12px; margin: 20px 0;">${otpCode}</div>`,
      `  <p style="color: #888; font-size: 12px;">This code expires in 5 minutes. Do not share this code with anyone.</p>`,
      `</div>`,
      `.`
    ].join('\r\n');

    client.on('data', (data) => {
      const msg = data.toString();

      if (step === 0 && msg.startsWith('220')) {
        step = 1;
        client.write(`EHLO localhost\r\n`);
      } else if (step === 1 && msg.startsWith('250')) {
        step = 2;
        client.write(`AUTH LOGIN\r\n`);
      } else if (step === 2 && msg.startsWith('334')) {
        step = 3;
        client.write(`${userB64}\r\n`);
      } else if (step === 3 && msg.startsWith('334')) {
        step = 4;
        client.write(`${passB64}\r\n`);
      } else if (step === 4 && msg.startsWith('235')) {
        step = 5;
        client.write(`MAIL FROM:<${gmailUser}>\r\n`);
      } else if (step === 5 && msg.startsWith('250')) {
        step = 6;
        client.write(`RCPT TO:<${toEmail}>\r\n`);
      } else if (step === 6 && msg.startsWith('250')) {
        step = 7;
        client.write(`DATA\r\n`);
      } else if (step === 7 && msg.startsWith('354')) {
        step = 8;
        client.write(`${emailData}\r\n`);
      } else if (step === 8 && msg.startsWith('250')) {
        step = 9;
        client.write(`QUIT\r\n`);
        console.log(`✅ [SMTP SUCCESS] Real email sent to ${toEmail}!`);
        resolve({ success: true });
      } else if (msg.startsWith('5')) {
        console.error('❌ [SMTP ERROR]', msg.trim());
        resolve({ success: false, error: msg.trim() });
      }
    });

    client.on('error', (err) => {
      console.error('❌ [SMTP CONNECTION ERROR]', err.message);
      resolve({ success: false, error: err.message });
    });
  });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'text/javascript; charset=UTF-8',
  '.jsx': 'text/javascript; charset=UTF-8',
  '.ts': 'text/javascript; charset=UTF-8',
  '.tsx': 'text/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. API: Send Email OTP
  if (req.url.startsWith('/api/send-email-otp') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const { email } = JSON.parse(body || '{}');
        if (!email || !email.includes('@')) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Valid email is required.' }));
        }

        const normalizedEmail = email.toLowerCase().trim();
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with 5-minute expiration
        otpStore[normalizedEmail] = {
          otp: generatedOtp,
          expiresAt: Date.now() + 5 * 60 * 1000
        };

        // Dispatch real Gmail email via SMTP
        const smtpResult = await sendGmailOtp(normalizedEmail, generatedOtp);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        // DO NOT return the OTP code to frontend! Secure verification only!
        res.end(JSON.stringify({
          success: true,
          message: `OTP sent to ${normalizedEmail}`,
          simulated: Boolean(smtpResult.simulated)
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 2. API: Verify Email OTP
  if (req.url.startsWith('/api/verify-email-otp') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const { email, otp } = JSON.parse(body || '{}');
        if (!email || !otp) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Email and OTP are required.' }));
        }

        const normalizedEmail = email.toLowerCase().trim();
        const record = otpStore[normalizedEmail];

        if (!record) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'No OTP found or expired. Please request a new code.' }));
        }

        if (Date.now() > record.expiresAt) {
          delete otpStore[normalizedEmail];
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'OTP code expired (valid for 5 minutes). Please request a new code.' }));
        }

        if (record.otp !== otp.trim()) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Invalid 6-digit OTP code. Please check your email.' }));
        }

        // Verification successful -> Clear OTP from memory
        delete otpStore[normalizedEmail];
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'OTP verified successfully!' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Static File Server
  let ext = path.extname(filePath);
  if (!ext) {
    filePath = path.join(__dirname, 'index.html');
    ext = '.html';
  }

  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'index.html'), (indexErr, indexContent) => {
          if (indexErr) {
            res.writeHead(500);
            res.end(`Server Error: ${indexErr.code}`);
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🎓 Student Shop server running at http://localhost:${PORT}/`);
  console.log(`📧 Gmail SMTP Service Ready.`);
});

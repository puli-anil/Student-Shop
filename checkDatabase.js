const fs = require('fs');
const path = require('path');
const https = require('https');
const tls = require('tls');

// 1. Load config from .env
const envPath = path.join(__dirname, '.env');
const env = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
const config = {};
env.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v) config[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
});

const SUPABASE_URL = config.SUPABASE_URL || 'https://btvogucxbrsbgscrcdub.supabase.co';
const SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY || 'sb_publishable_-w6Nk-Ho8AM5MGVYcjQMMQ_be6PybrV';
const GMAIL_USER = config.GMAIL_USER || 'pulianil72@gmail.com';
const GMAIL_PASS = (config.GMAIL_APP_PASSWORD || 'xvcd adrx ggle sgkn').replace(/\s+/g, '');

console.log('\n===============================================================');
console.log('   📊 STUDENT SHOP DATABASE & EMAIL SYSTEM DIAGNOSTICS');
console.log('===============================================================\n');

console.log('⚙️  1. CONFIGURATION DETECTED:');
console.log(`   - Supabase URL:       ${SUPABASE_URL}`);
console.log(`   - Supabase Anon Key:  ${SUPABASE_ANON_KEY.substring(0, 18)}...`);
console.log(`   - Gmail User:         ${GMAIL_USER}`);
console.log(`   - Gmail App Password: ${GMAIL_PASS ? '********' : 'NOT SET'}`);
console.log(`   - SQL Schema File:    supabase_schema.sql`);

async function checkSupabase() {
  console.log('\n☁️  2. TESTING SUPABASE CLOUD DATABASE:');
  try {
    const url = new URL(SUPABASE_URL + '/rest/v1/listings?select=count');
    await new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        },
        timeout: 5000
      }, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`   ✅ Supabase Status: CONNECTED & ONLINE (HTTP ${res.statusCode})`);
          } else {
            console.log(`   ⚠️  Supabase Response (HTTP ${res.statusCode}): ${data}`);
          }
          resolve();
        });
      });
      req.on('error', err => {
        if (err.code === 'ENOTFOUND') {
          console.log(`   ⏸️  SUPABASE PROJECT IS PAUSED (DNS ENOTFOUND)`);
          console.log(`   👉 Free Supabase projects pause after 7 days of inactivity.`);
          console.log(`   👉 TO RESTORE IN 1 MINUTE:`);
          console.log(`      1. Go to https://supabase.com/dashboard`);
          console.log(`      2. Click on your project ("btvogucxbrsbgscrcdub")`);
          console.log(`      3. Click the "Restore project" button!`);
        } else {
          console.log(`   ⚠️  Supabase Connection Notice: ${err.message}`);
        }
        resolve();
      });
      req.on('timeout', () => {
        req.destroy();
        console.log(`   ⚠️  Supabase request timed out after 5s.`);
        resolve();
      });
      req.end();
    });
  } catch (e) {
    console.log(`   ⚠️  Error: ${e.message}`);
  }
}

function checkSmtp() {
  return new Promise((resolve) => {
    console.log('\n📧 3. TESTING GMAIL SMTP TLS CONNECTION (smtp.gmail.com:465):');
    const client = tls.connect(465, 'smtp.gmail.com', { timeout: 8000 }, () => {});
    let step = 0;
    const userB64 = Buffer.from(GMAIL_USER).toString('base64');
    const passB64 = Buffer.from(GMAIL_PASS).toString('base64');

    client.on('data', data => {
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
        console.log('   ✅ Gmail SMTP Status: AUTHENTICATION SUCCEEDED (235 Accepted)');
        console.log('   ✅ Real verification codes can be dispatched to any student email!');
        client.write('QUIT\r\n');
        client.end();
        resolve();
      } else if (msg.startsWith('5')) {
        console.log(`   ❌ Gmail SMTP Error: ${msg.trim()}`);
        client.end();
        resolve();
      }
    });

    client.on('error', err => {
      console.log(`   ❌ Gmail SMTP Socket Error: ${err.message}`);
      resolve();
    });

    client.on('timeout', () => {
      client.destroy();
      console.log('   ⚠️  Gmail SMTP Timeout after 8s');
      resolve();
    });
  });
}

async function main() {
  await checkSupabase();
  await checkSmtp();

  console.log('\n📦 4. DATABASE SEED DATA IN STORAGE:');
  try {
    const { CAMPUSES, SEED_LISTINGS } = require('./src/seedData.js');
    const rvrItems = SEED_LISTINGS.filter(l => l.campus === 'rvr-jc');
    console.log(`   - Default College:    ${CAMPUSES[0].fullName} (${CAMPUSES[0].city})`);
    console.log(`   - RVR & JC Items:     ${rvrItems.length} active campus listings`);
    console.log(`   - Total Seed Items:   ${SEED_LISTINGS.length} across all engineering colleges`);
  } catch (e) {
    console.log(`   Notice: ${e.message}`);
  }

  console.log('\n===============================================================\n');
}

main();

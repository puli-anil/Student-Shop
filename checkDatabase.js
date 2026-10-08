const fs = require('fs');
const path = require('path');

console.log('\n===============================================================');
console.log('   📊 STUDENT SHOP DATABASE & API KEY CREDENTIAL STATUS');
console.log('===============================================================\n');

// 1. Supabase Cloud Database Details
console.log('☁️ 1. SUPABASE CLOUD DATABASE & API KEYS:');
console.log('   - Project URL:      https://btvogucxbrsbgscrcdub.supabase.co');
console.log('   - Anon/Public Key:  sb_publishable_-w6Nk-Ho8AM5MGVYcjQMMQ_be6PybrV');
console.log('   - Database Tables:  "listings", "campuses", "pings", "auth.users"');

// 2. Gmail SMTP Credentials
console.log('\n📧 2. GMAIL SMTP OTP EMAIL ENGINE:');
console.log('   - Sender Gmail:     pulianil72@gmail.com');
console.log('   - App Password:     xvcd adrx ggle sgkn');
console.log('   - SMTP Server:      smtp.gmail.com:465 (SSL/TLS)');

// 3. Local Seed Database
try {
  const { CAMPUSES, SEED_LISTINGS } = require('./src/seedData.js');
  const rvrItems = SEED_LISTINGS.filter(l => l.campus === 'rvr-jc');
  console.log('\n📦 3. LOCAL & CLOUD SEED DATA:');
  console.log(`   - Main Campus:      ${CAMPUSES[0].fullName} (${CAMPUSES[0].city})`);
  console.log(`   - RVR & JC Items:   ${rvrItems.length} active products/services`);
  console.log(`   - Total Campus Ads: ${SEED_LISTINGS.length} ads across all campuses`);
} catch (e) {
  console.log('⚠️ Seed Database Notice:', e.message);
}

// 4. File Locations
console.log('\n📁 4. CONFIGURATION FILE LOCATIONS:');
console.log('   - Environment File: .env');
console.log('   - Supabase Client:  src/supabase.js');
console.log('   - Database Seeder:  src/seedDatabase.js');

console.log('\n===============================================================\n');

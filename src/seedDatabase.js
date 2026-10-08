import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CAMPUSES, INITIAL_LISTINGS } from './src/seedData.js';

const SUPABASE_URL = 'https://btvogucxbrsbgscrcdub.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_-w6Nk-Ho8AM5MGVYcjQMMQ_be6PybrV';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function seedSupabaseData() {
  console.log('Seeding Supabase database...');

  // 1. Seed Campuses
  const { error: campusErr } = await supabase.from('campuses').upsert(CAMPUSES);
  if (campusErr) console.error('Error seeding campuses:', campusErr);
  else console.log('Campuses seeded successfully!');

  // 2. Seed Listings
  const formattedListings = INITIAL_LISTINGS.map(l => ({
    id: l.id,
    title: l.title,
    description: l.description,
    price: l.price,
    price_label: l.price_label,
    category: l.category,
    condition: l.condition,
    hostel: l.hostel,
    campus: l.campus,
    image_url: l.image_url,
    featured: l.featured,
    listing_kind: l.listing_kind || 'marketplace',
    extra: l.extra || {},
    seller_label: l.seller_label,
    user_id: l.user_id,
    created_at: new Date().toISOString()
  }));

  const { error: listingErr } = await supabase.from('listings').upsert(formattedListings);
  if (listingErr) console.error('Error seeding listings:', listingErr);
  else console.log('35+ Campus Listings seeded to Supabase successfully!');
}

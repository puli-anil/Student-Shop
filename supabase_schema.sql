-- ====================================================================
-- STUDENT SHOP - SUPABASE DATABASE SCHEMA FOR HYPERLOCAL CAMPUS MARKETPLACE
-- Paste this script into your Supabase Dashboard -> SQL Editor and click RUN
-- ====================================================================

-- 1. Create Campuses Table
CREATE TABLE IF NOT EXISTS campuses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  city TEXT NOT NULL,
  hostels JSONB DEFAULT '[]'::jsonb,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Listings Table
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  price_label TEXT,
  category TEXT NOT NULL,
  condition TEXT DEFAULT 'Good',
  campus TEXT NOT NULL,
  hostel TEXT,
  city TEXT,
  image_url TEXT,
  featured BOOLEAN DEFAULT false,
  listing_kind TEXT DEFAULT 'marketplace',
  extra JSONB DEFAULT '{}'::jsonb,
  seller_label TEXT,
  verified BOOLEAN DEFAULT false,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Pings (Direct Student Inquiries / Chats) Table
CREATE TABLE IF NOT EXISTS pings (
  id BIGSERIAL PRIMARY KEY,
  listing_id TEXT REFERENCES listings(id) ON DELETE CASCADE,
  from_user_name TEXT,
  from_hostel TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create User Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  college_name TEXT,
  roll_no TEXT,
  hostel TEXT,
  campus TEXT,
  year TEXT,
  avatar TEXT,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) and Set Permissive Public Access Policies
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow Public Reads & Writes so students can post & view items without auth friction
CREATE POLICY "Public read campuses" ON campuses FOR SELECT USING (true);
CREATE POLICY "Public insert campuses" ON campuses FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Public insert listings" ON listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update listings" ON listings FOR UPDATE USING (true);
CREATE POLICY "Public delete listings" ON listings FOR DELETE USING (true);

CREATE POLICY "Public read pings" ON pings FOR SELECT USING (true);
CREATE POLICY "Public insert pings" ON pings FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Public insert profiles" ON profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update profiles" ON profiles FOR UPDATE USING (true);

-- Indexes for lightning fast campus filtering
CREATE INDEX IF NOT EXISTS idx_listings_campus ON listings(campus);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);

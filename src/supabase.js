import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://btvogucxbrsbgscrcdub.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'sb_publishable_-w6Nk-Ho8AM5MGVYcjQMMQ_be6PybrV';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

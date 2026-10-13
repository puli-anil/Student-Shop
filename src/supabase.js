import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = window.ENV_SUPABASE_URL || 'https://nwoqmravjqbobjqjitua.supabase.co';
const SUPABASE_ANON_KEY = window.ENV_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53b3FtcmF2anFib2JqcWppdHVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4OTA0MjAsImV4cCI6MjEwNzQ2NjQyMH0.VcYJDQQLYHw73mIMXvhALtYEhg4AnxXXyfDpzWOex4Y';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

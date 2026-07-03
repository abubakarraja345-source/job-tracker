/* ============================================================
   4JobTracker — Supabase client
   Get these two values from: Supabase Dashboard → Settings → API
   The "anon public" key is safe to expose in frontend code —
   Row Level Security policies (see database/supabase-schema.sql)
   are what actually protect each user's data.
   ============================================================ */

const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR-ANON-PUBLIC-KEY';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

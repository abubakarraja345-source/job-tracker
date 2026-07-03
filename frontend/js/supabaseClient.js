/* ============================================================
   4JobTracker — Supabase client
   Get these two values from: Supabase Dashboard → Settings → API
   The "anon public" key is safe to expose in frontend code —
   Row Level Security policies (see database/supabase-schema.sql)
   are what actually protect each user's data.
   ============================================================ */


const SUPABASE_URL = 'https://emlykqjcptauhzcgubur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbHlrcWpjcHRhdWh6Y2d1YnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Nzg3OTQsImV4cCI6MjA5ODQ1NDc5NH0.cbmi0uqRv2VbnIQYsi4zQ77FVw53JWGveY2RQRpb75Y';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ===============================
   MEETLY — SUPABASE AUTH
================================ */

const SUPABASE_URL = "https://myodwejhbhhdixqsyisq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fyyr1e8CXEcIkbv5AMGxJw_bJ5NJ6r7";

window.meetlySupabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
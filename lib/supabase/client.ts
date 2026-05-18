import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://bhsvvpvfbszrcitjwxxl.supabase.co";

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoc3Z2cHZmYnN6cmNpdGp3eHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNTQzMTUsImV4cCI6MjA5NDYzMDMxNX0.-fhaMhwiLj33v_S2u8b_B-BJRLnVNqNaCO7zgmDds3U";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

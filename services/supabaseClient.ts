
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Initialize the client only if credentials exist.
// These are now provided via the vite.config.ts injection.
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!supabase) {
  console.warn("Supabase credentials missing. App is running in Local Fallback mode.");
} else {
  console.log("Supabase Engine: Connected to laudxusnxpulctxwbjtq");
}

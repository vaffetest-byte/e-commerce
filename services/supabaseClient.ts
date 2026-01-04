
import { createClient } from '@supabase/supabase-js';

// Use environment variables injected by Vite, with hardcoded fallbacks as a safety measure
const supabaseUrl = process.env.SUPABASE_URL || 'https://laudxusnxpulctxwbjtq.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhdWR4dXNueHB1bGN0eHdianRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczNjI3MjYsImV4cCI6MjA4MjkzODcyNn0.UPmNRGQ8BUm4rQsSZ2eNVyJ8aZlS3iE6fA7_cuC26a0';

// Initialize the client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log("Supabase Engine: Initialized for target laudxusnxpulctxwbjtq");

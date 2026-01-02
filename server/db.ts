import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
}

export const supabase = createClient(supabaseUrl!, supabaseKey!);

// No initDb needed for now as we assume tables exist or will be created via Dashboard/SQL Editor if needed.
// If we wanted to check connection, we could do a simple query.
export const initDb = async () => {
  const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('Supabase connection check failed:', error.message);
  } else {
    console.log('Supabase connected successfully.');
  }
};

export default supabase;

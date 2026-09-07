import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseClient: SupabaseClient | null = null;

if (
  supabaseUrl &&
  supabaseServiceKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('xyzcompany')
) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    console.log('[Supabase Client] Successfully initialized Supabase PostgreSQL client.');
  } catch (err) {
    console.warn('[Supabase Client] Could not initialize Supabase client:', err);
  }
} else {
  console.log('[Supabase Client] Operating in Local Storage Engine Mode (Supabase URL placeholder).');
}

export function getSupabase() {
  return supabaseClient;
}

export function isSupabaseConnected(): boolean {
  return supabaseClient !== null;
}

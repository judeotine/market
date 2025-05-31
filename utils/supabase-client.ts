import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

// Check if the environment variables are properly loaded
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or key is missing');
}

// Initialize Supabase with the environment variables
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js';

/**
 * CORTEX SUPABASE CLIENT
 * * This file initializes the connection to your Supabase backend.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check for missing variables during development
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('🔥 CORTEX ERROR: Supabase environment variables are missing in .env.local');
}

// Named export for the supabase client instance
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);
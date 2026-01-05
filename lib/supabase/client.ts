import { createBrowserClient as createClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          tier: 'free' | 'pro';
          first_name?: string | null;
          last_name?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          tier?: 'free' | 'pro';
          first_name?: string | null;
          last_name?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          tier?: 'free' | 'pro';
          first_name?: string | null;
          last_name?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          updated_at?: string;
        };
      };
    };
  };
};

// Client-side Supabase client (for use in components)
export const createBrowserClient = () => {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Server-side Supabase client with service role (for API routes)
export const createServiceClient = (): SupabaseClient<Database> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

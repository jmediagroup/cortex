import { createBrowserClient as createClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          tier: 'free' | 'finance_pro' | 'elite';
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
          tier?: 'free' | 'finance_pro' | 'elite';
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
          tier?: 'free' | 'finance_pro' | 'elite';
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
      events: {
        Row: {
          id: number;
          user_id: string | null;
          session_id: string | null;
          event_type: string;
          event_data: Record<string, any> | null;
          page_url: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          session_id?: string | null;
          event_type: string;
          event_data?: Record<string, any> | null;
          page_url?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          user_id?: string | null;
          session_id?: string | null;
          event_type?: string;
          event_data?: Record<string, any> | null;
          page_url?: string | null;
          user_agent?: string | null;
        };
      };
      enterprise_leads: {
        Row: {
          id: number;
          first_name: string;
          last_name: string;
          email: string;
          company_name: string;
          company_size: string;
          phone: string | null;
          message: string;
          status: 'new' | 'contacted' | 'qualified' | 'closed';
          created_at: string;
        };
        Insert: {
          id?: never;
          first_name: string;
          last_name: string;
          email: string;
          company_name: string;
          company_size: string;
          phone?: string | null;
          message: string;
          status?: 'new' | 'contacted' | 'qualified' | 'closed';
          created_at?: string;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string;
          company_name?: string;
          company_size?: string;
          phone?: string | null;
          message?: string;
          status?: 'new' | 'contacted' | 'qualified' | 'closed';
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

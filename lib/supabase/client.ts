import { createBrowserClient as createClient } from '@supabase/ssr';
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

export type OnboardingAnswers = {
  describes_you: string;
  financial_focus: string;
  investing_status: string;
  own_or_rent: string;
  tool_familiarity: string;
};

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          tier: 'free' | 'finance_pro';
          first_name?: string | null;
          last_name?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscription_status: string | null;
          has_completed_onboarding: boolean;
          onboarding_answers: OnboardingAnswers | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          tier?: 'free' | 'finance_pro';
          first_name?: string | null;
          last_name?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          has_completed_onboarding?: boolean;
          onboarding_answers?: OnboardingAnswers | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          tier?: 'free' | 'finance_pro';
          first_name?: string | null;
          last_name?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'prefer_not_to_say' | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_status?: string | null;
          has_completed_onboarding?: boolean;
          onboarding_answers?: OnboardingAnswers | null;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [];
      };
      scenarios: {
        Row: {
          id: string;
          user_id: string;
          tool_id: string;
          tool_name: string;
          inputs: Record<string, any>;
          key_result: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tool_id: string;
          tool_name: string;
          inputs: Record<string, any>;
          key_result: string;
          created_at?: string;
        };
        Update: {
          tool_id?: string;
          tool_name?: string;
          inputs?: Record<string, any>;
          key_result?: string;
        };
        Relationships: [];
      };
      outlook_subscribers: {
        Row: {
          id: string;
          email: string;
          confirmation_token: string;
          confirmed_at: string | null;
          unsubscribed_at: string | null;
          unsubscribe_token: string;
          user_id: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          confirmation_token?: string;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          unsubscribe_token?: string;
          user_id?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          email?: string;
          confirmation_token?: string;
          confirmed_at?: string | null;
          unsubscribed_at?: string | null;
          unsubscribe_token?: string;
          user_id?: string | null;
          source?: string | null;
        };
        Relationships: [];
      };
      outlook_email_sends: {
        Row: {
          id: string;
          type: string;
          slug: string;
          outlook_date: string;
          recipient_count: number;
          sent_count: number;
          failed_count: number;
          claimed_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          type: string;
          slug: string;
          outlook_date: string;
          recipient_count?: number;
          sent_count?: number;
          failed_count?: number;
          claimed_at?: string;
          completed_at?: string | null;
        };
        Update: {
          recipient_count?: number;
          sent_count?: number;
          failed_count?: number;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      webhook_events: {
        Row: {
          id: string;
          type: string;
          processed_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          type: string;
          processed_at?: string | null;
          created_at?: string;
        };
        Update: {
          type?: string;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      why_reflections: {
        Row: {
          id: string;
          user_id: string;
          answers: Record<string, string>;
          summary: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          answers: Record<string, string>;
          summary: Record<string, any>;
          created_at?: string;
        };
        Update: {
          answers?: Record<string, string>;
          summary?: Record<string, any>;
        };
        Relationships: [];
      };
      cms_content: {
        Row: {
          id: string;
          type: 'article' | 'guide' | 'daily' | 'weekly';
          slug: string;
          title: string;
          excerpt: string | null;
          body_markdown: string;
          status: 'draft' | 'published' | 'scheduled' | 'archived';
          featured_image_url: string | null;
          featured_image_alt: string | null;
          featured_image_width: number | null;
          featured_image_height: number | null;
          author_name: string;
          author_slug: string;
          author_avatar: string | null;
          author_bio: string | null;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          seo_og_title: string | null;
          seo_og_description: string | null;
          seo_og_image: string | null;
          seo_canonical: string | null;
          metadata: Record<string, unknown>;
          reading_time: number | null;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type?: 'article' | 'guide' | 'daily' | 'weekly';
          slug: string;
          title: string;
          excerpt?: string | null;
          body_markdown?: string;
          status?: 'draft' | 'published' | 'scheduled' | 'archived';
          featured_image_url?: string | null;
          featured_image_alt?: string | null;
          featured_image_width?: number | null;
          featured_image_height?: number | null;
          author_name?: string;
          author_slug?: string;
          author_avatar?: string | null;
          author_bio?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          seo_og_title?: string | null;
          seo_og_description?: string | null;
          seo_og_image?: string | null;
          seo_canonical?: string | null;
          metadata?: Record<string, unknown>;
          reading_time?: number | null;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: 'article' | 'guide' | 'daily' | 'weekly';
          slug?: string;
          title?: string;
          excerpt?: string | null;
          body_markdown?: string;
          status?: 'draft' | 'published' | 'scheduled' | 'archived';
          featured_image_url?: string | null;
          featured_image_alt?: string | null;
          featured_image_width?: number | null;
          featured_image_height?: number | null;
          author_name?: string;
          author_slug?: string;
          author_avatar?: string | null;
          author_bio?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          seo_og_title?: string | null;
          seo_og_description?: string | null;
          seo_og_image?: string | null;
          seo_canonical?: string | null;
          metadata?: Record<string, unknown>;
          reading_time?: number | null;
          published_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      cms_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
        };
        Relationships: [];
      };
      cms_tags: {
        Row: {
          id: string;
          slug: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
        };
        Relationships: [];
      };
      cms_content_categories: {
        Row: {
          content_id: string;
          category_id: string;
        };
        Insert: {
          content_id: string;
          category_id: string;
        };
        Update: {
          content_id?: string;
          category_id?: string;
        };
        Relationships: [];
      };
      cms_content_tags: {
        Row: {
          content_id: string;
          tag_id: string;
        };
        Insert: {
          content_id: string;
          tag_id: string;
        };
        Update: {
          content_id?: string;
          tag_id?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
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
export const createServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

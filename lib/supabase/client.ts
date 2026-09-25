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
          /**
           * Generated column (see supabase/migrations/harden_signup_abuse.sql):
           * canonical form of `email` used to detect alias duplicates. Read
           * only — Postgres computes it, and it is not a delivery address.
           */
          email_normalized: string;
          /** NULL means the address was never confirmed. */
          email_verified_at: string | null;
          /** Salted hash of the signup IP; NULL when no salt is configured. */
          signup_ip_hash: string | null;
          /** Abuse reason codes from lib/email-hygiene.ts `assessSignup`. */
          signup_flags: string[];
          is_flagged: boolean;
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
        // `email_normalized` is intentionally absent from Insert and Update —
        // it is GENERATED ALWAYS, and writing to it is a Postgres error.
        Insert: {
          id: string;
          email: string;
          email_verified_at?: string | null;
          signup_ip_hash?: string | null;
          signup_flags?: string[];
          is_flagged?: boolean;
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
          email_verified_at?: string | null;
          signup_ip_hash?: string | null;
          signup_flags?: string[];
          is_flagged?: boolean;
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
      // Ads — defined in supabase/migrations/20260920120000_create_ads_tables.sql.
      ad_advertisers: {
        Row: {
          id: string;
          slug: string;
          name: string;
          url: string;
          description: string | null;
          tagline: string | null;
          cta: string | null;
          category: string;
          is_active: boolean;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          url: string;
          description?: string | null;
          tagline?: string | null;
          cta?: string | null;
          category?: string;
          is_active?: boolean;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          url?: string;
          description?: string | null;
          tagline?: string | null;
          cta?: string | null;
          category?: string;
          is_active?: boolean;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      ad_placements: {
        Row: {
          id: string;
          slug: string;
          name: string;
          formats: string[];
          rotation_interval_ms: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          formats?: string[];
          rotation_interval_ms?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          formats?: string[];
          rotation_interval_ms?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      ad_campaigns: {
        Row: {
          id: string;
          slug: string | null;
          advertiser_id: string;
          placement_id: string;
          name: string;
          status: 'draft' | 'active' | 'paused' | 'archived';
          tool_ids: string[] | null;
          exclude_tool_ids: string[];
          weight: number;
          priority: number;
          starts_at: string | null;
          ends_at: string | null;
          hide_for_tiers: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug?: string | null;
          advertiser_id: string;
          placement_id: string;
          name: string;
          status?: 'draft' | 'active' | 'paused' | 'archived';
          tool_ids?: string[] | null;
          exclude_tool_ids?: string[];
          weight?: number;
          priority?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          hide_for_tiers?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          slug?: string | null;
          advertiser_id?: string;
          placement_id?: string;
          name?: string;
          status?: 'draft' | 'active' | 'paused' | 'archived';
          tool_ids?: string[] | null;
          exclude_tool_ids?: string[];
          weight?: number;
          priority?: number;
          starts_at?: string | null;
          ends_at?: string | null;
          hide_for_tiers?: string[];
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      ad_creatives: {
        Row: {
          id: string;
          campaign_id: string;
          seed_key: string | null;
          format: 'medium_rectangle' | 'leaderboard' | 'mobile_banner' | 'large_rectangle';
          headline: string;
          body: string | null;
          body_line2: string | null;
          cta: string;
          weight: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          campaign_id: string;
          seed_key?: string | null;
          format: 'medium_rectangle' | 'leaderboard' | 'mobile_banner' | 'large_rectangle';
          headline: string;
          body?: string | null;
          body_line2?: string | null;
          cta: string;
          weight?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          campaign_id?: string;
          seed_key?: string | null;
          format?: 'medium_rectangle' | 'leaderboard' | 'mobile_banner' | 'large_rectangle';
          headline?: string;
          body?: string | null;
          body_line2?: string | null;
          cta?: string;
          weight?: number;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      ad_events: {
        Row: {
          id: number;
          event_type: 'impression' | 'click';
          campaign_id: string | null;
          creative_id: string | null;
          advertiser_id: string | null;
          placement_slug: string | null;
          tool_id: string | null;
          format: string | null;
          session_id: string | null;
          user_id: string | null;
          tier: string | null;
          page_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          event_type: 'impression' | 'click';
          campaign_id?: string | null;
          creative_id?: string | null;
          advertiser_id?: string | null;
          placement_slug?: string | null;
          tool_id?: string | null;
          format?: string | null;
          session_id?: string | null;
          user_id?: string | null;
          tier?: string | null;
          page_path?: string | null;
          created_at?: string;
        };
        Update: {
          event_type?: 'impression' | 'click';
        };
        Relationships: [];
      };
    };
    Views: {
      /** Daily impressions/clicks rollup of ad_events (20260920120000_create_ads_tables.sql). */
      ad_stats_daily: {
        Row: {
          campaign_id: string | null;
          creative_id: string | null;
          advertiser_id: string | null;
          day: string;
          impressions: number;
          clicks: number;
        };
        Relationships: [];
      };
      // Defined in supabase/migrations/harden_signup_abuse.sql.
      signup_abuse_summary: {
        Row: {
          total_users: number;
          verified_users: number;
          unverified_users: number;
          flagged_users: number;
          stale_unverified_users: number;
          distinct_inboxes: number;
        };
        Relationships: [];
      };
      /** One row per real inbox that has more than one account. */
      user_alias_clusters: {
        Row: {
          email_normalized: string;
          account_count: number;
          verified_count: number;
          addresses: string[];
          first_seen: string;
          last_seen: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      /**
       * Deletes analytics events older than `retention_days` and returns how
       * many rows it removed (supabase/migrations/20260925120000_events_retention.sql).
       */
      delete_old_events: {
        Args: { retention_days: number };
        Returns: number;
      };
    };
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

import { createClient } from '@supabase/supabase-js';

// Environment configuration with fallback to demo instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database Types based on the deployed schema
export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          plan: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          plan?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          plan?: string;
          settings?: Json;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          permissions: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          permissions?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: string;
          permissions?: Json;
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string;
          timezone: string;
          preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          avatar_url?: string;
          timezone?: string;
          preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          avatar_url?: string;
          timezone?: string;
          preferences?: Json;
          updated_at?: string;
        };
      };
      campaigns: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string;
          type: string;
          status: string;
          settings: Json;
          stats: Json;
          created_by: string;
          start_date: string;
          end_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string;
          type?: string;
          status?: string;
          settings?: Json;
          stats?: Json;
          created_by: string;
          start_date?: string;
          end_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          type?: string;
          status?: string;
          settings?: Json;
          stats?: Json;
          start_date?: string;
          end_date?: string;
          updated_at?: string;
        };
      };
      contacts: {
        Row: {
          id: string;
          organization_id: string;
          full_name: string;
          email: string;
          company: string;
          title: string;
          linkedin_url: string;
          phone: string;
          location: Json;
          enrichment_data: Json;
          interaction_history: Json;
          tags: string[];
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          full_name: string;
          email?: string;
          company?: string;
          title?: string;
          linkedin_url?: string;
          phone?: string;
          location?: Json;
          enrichment_data?: Json;
          interaction_history?: Json;
          tags?: string[];
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          email?: string;
          company?: string;
          title?: string;
          linkedin_url?: string;
          phone?: string;
          location?: Json;
          enrichment_data?: Json;
          interaction_history?: Json;
          tags?: string[];
          status?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          contact_id: string;
          title: string;
          context: Json;
          status: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          contact_id?: string;
          title?: string;
          context?: Json;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          context?: Json;
          status?: string;
          metadata?: Json;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          message_type: string;
          metadata: Json;
          tool_calls: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          message_type?: string;
          metadata?: Json;
          tool_calls?: Json;
          created_at?: string;
        };
        Update: {
          content?: string;
          metadata?: Json;
          tool_calls?: Json;
        };
      };
    };
    Views: {
      campaign_performance_summary: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          total_contacts: number;
          sent_count: number;
          opened_count: number;
          replied_count: number;
          response_rate: number;
          status: string;
        };
      };
    };
    Functions: {
      get_organization_dashboard_metrics: {
        Args: {
          org_id: string;
        };
        Returns: {
          total_campaigns: number;
          active_campaigns: number;
          total_contacts: number;
          total_messages_sent: number;
          average_response_rate: number;
        }[];
      };
    };
  };
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Helper types for common operations
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

// Authentication context type
export interface AuthUser extends UserProfile {
  organization_id?: string;
  organization?: Organization;
  role?: string;
}

// Real-time subscription helpers
export const subscribeToTable = (table: keyof Database['public']['Tables'], callback: (payload: any) => void) => {
  return supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table,
    }, callback)
    .subscribe();
};

// Helper function to get current user's organization context
export const getCurrentUserContext = async (): Promise<{ user: AuthUser | null; organization: Organization | null }> => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { user: null, organization: null };
  }

  // Get user profile with organization context
  const { data: profile } = await supabase
    .from('user_profiles')
    .select(`
      *,
      organization_members!inner(
        organization_id,
        role,
        organizations!inner(*)
      )
    `)
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { user: null, organization: null };
  }

  const orgMember = profile.organization_members?.[0];
  const organization = orgMember?.organizations;

  return {
    user: {
      ...profile,
      organization_id: orgMember?.organization_id,
      role: orgMember?.role,
    },
    organization,
  };
};

export default supabase;
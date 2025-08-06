import { supabase } from '@/lib/supabase';

// Development organization and user setup
export const setupDevEnvironment = async () => {
  try {
    console.log('Setting up development environment...');

    // Create test organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .upsert([
        {
          id: 'dev-org-1',
          name: 'Sam AI Demo Organization',
          slug: 'sam-ai-demo',
          plan: 'enterprise',
          settings: {
            features: ['campaigns', 'analytics', 'ai_chat', 'integrations'],
            limits: {
              campaigns: 100,
              contacts: 10000,
              messages_per_month: 50000
            }
          }
        }
      ], {
        onConflict: 'id'
      })
      .select()
      .single();

    if (orgError) {
      console.error('Error creating organization:', orgError);
      return { success: false, error: orgError };
    }

    console.log('Development organization created:', organization);

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Create user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .upsert([
          {
            id: user.id,
            email: user.email!,
            full_name: 'Development User',
            timezone: 'UTC',
            preferences: {
              theme: 'light',
              notifications: true,
              dashboard_layout: 'default'
            }
          }
        ], {
          onConflict: 'id'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }

      // Create organization membership
      const { data: membership, error: memberError } = await supabase
        .from('organization_members')
        .upsert([
          {
            organization_id: organization.id,
            user_id: user.id,
            role: 'admin',
            permissions: {
              campaigns: ['create', 'read', 'update', 'delete'],
              contacts: ['create', 'read', 'update', 'delete'],
              analytics: ['read'],
              settings: ['read', 'update']
            }
          }
        ], {
          onConflict: 'organization_id,user_id'
        });

      if (memberError) {
        console.error('Error creating membership:', memberError);
      } else {
        console.log('User membership created:', membership);
      }
    }

    return { success: true, organization };
  } catch (error) {
    console.error('Error in setupDevEnvironment:', error);
    return { success: false, error };
  }
};

// Function to check if dev environment is set up
export const checkDevEnvironment = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('id')
      .eq('id', 'dev-org-1')
      .single();

    return !error && !!data;
  } catch {
    return false;
  }
};
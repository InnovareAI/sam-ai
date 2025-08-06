import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getCurrentUserContext, AuthUser, Organization } from '@/lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: AuthUser | null;
  organization: Organization | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  refreshUserContext: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Check if we're in demo mode (no valid Supabase URL)
  const isDemoMode = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === 'https://demo.supabase.co';
  
  // Demo data for when Supabase is not configured
  const demoUser: AuthUser = {
    id: 'demo-user',
    email: 'demo@sam-ai.com',
    full_name: 'Demo User',
    organization_id: 'demo-org',
    role: 'admin'
  };
  
  const demoOrg: Organization = {
    id: 'demo-org',
    name: 'Demo Organization',
    slug: 'demo-org',
    plan: 'enterprise',
    settings: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const [session, setSession] = useState<Session | null>(isDemoMode ? { user: { id: 'demo-user' } as any, access_token: 'demo', refresh_token: 'demo' } as Session : null);
  const [user, setUser] = useState<AuthUser | null>(isDemoMode ? demoUser : null);
  const [organization, setOrganization] = useState<Organization | null>(isDemoMode ? demoOrg : null);
  const [loading, setLoading] = useState(!isDemoMode);

  const refreshUserContext = async () => {
    if (isDemoMode) {
      setUser(demoUser);
      setOrganization(demoOrg);
      return;
    }
    
    try {
      const { user: authUser, organization: org } = await getCurrentUserContext();
      setUser(authUser);
      setOrganization(org);
    } catch (error) {
      console.error('Error refreshing user context:', error);
      setUser(null);
      setOrganization(null);
    }
  };

  useEffect(() => {
    if (isDemoMode) {
      // Skip Supabase in demo mode
      return;
    }
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        refreshUserContext();
      }
      setLoading(false);
    }).catch(() => {
      // If Supabase fails, use demo mode
      setSession({ user: { id: 'demo-user' } as any, access_token: 'demo', refresh_token: 'demo' } as Session);
      setUser(demoUser);
      setOrganization(demoOrg);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setLoading(true);
        
        if (session?.user) {
          await refreshUserContext();
        } else {
          setUser(null);
          setOrganization(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || '',
        },
      },
    });

    // If signup successful, create user profile
    if (data.user && !error) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName || '',
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      }
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOrganization(null);
  };

  const switchOrganization = async (organizationId: string) => {
    if (!user) return;

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from('organization_members')
      .select('*, organizations(*)')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    if (membership) {
      setOrganization(membership.organizations);
      setUser({
        ...user,
        organization_id: organizationId,
        role: membership.role,
      });
    }
  };

  const value: AuthContextType = {
    session,
    user,
    organization,
    loading,
    signIn,
    signUp,
    signOut,
    switchOrganization,
    refreshUserContext,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
-- ================================================================
-- SAM AI - MULTI-TENANT FOUNDATION SCHEMA
-- ================================================================
-- CRITICAL: This schema provides complete tenant isolation for Sam AI
-- Execute in Supabase SQL Editor or via psql connection
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- CORE MULTI-TENANT TABLES
-- ================================================================

-- Organizations (Tenant Boundary)
-- This is the primary tenant isolation table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    
    -- Business settings and configuration
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    settings JSONB DEFAULT '{}',
    billing_email TEXT,
    
    -- Feature flags for tenant-specific features
    features JSONB DEFAULT '{
        "ai_agents": true,
        "voice_interface": true,
        "campaign_automation": true,
        "advanced_analytics": false,
        "custom_integrations": false
    }'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    CONSTRAINT organizations_name_length CHECK (char_length(name) >= 2),
    CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$')
);

-- Organization Members (User-Tenant Relationship)
-- This table defines which users belong to which organizations and their roles
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Role-based access control
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN (
        'owner',        -- Full admin access
        'admin',        -- Can manage organization and members  
        'manager',      -- Can manage campaigns and settings
        'member',       -- Can use features but not manage
        'viewer'        -- Read-only access
    )),
    
    -- Invitation and access tracking
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMPTZ DEFAULT now(),
    joined_at TIMESTAMPTZ,
    last_active_at TIMESTAMPTZ,
    
    -- Status management
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    UNIQUE(organization_id, user_id)
);

-- User Profiles (Extended User Data)
-- Extends Supabase auth.users with application-specific data
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Personal information
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    
    -- Preferences and settings
    timezone TEXT DEFAULT 'UTC',
    locale TEXT DEFAULT 'en-US',
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
    
    -- User preferences stored as JSON
    preferences JSONB DEFAULT '{
        "notifications": {
            "email": true,
            "push": true,
            "desktop": true
        },
        "dashboard": {
            "default_view": "overview",
            "metrics_period": "7d"
        },
        "ai_agent": {
            "voice_enabled": true,
            "auto_suggestions": true,
            "personality": "professional"
        }
    }'::jsonb,
    
    -- Onboarding and feature adoption
    onboarding_completed BOOLEAN DEFAULT false,
    onboarding_step INTEGER DEFAULT 0,
    feature_flags JSONB DEFAULT '{}'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_seen_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- INDEXES FOR MULTI-TENANT PERFORMANCE
-- ================================================================

-- Organizations
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_subscription_tier ON organizations(subscription_tier);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);

-- Organization Members
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_organization_members_role ON organization_members(organization_id, role);
CREATE INDEX idx_organization_members_status ON organization_members(organization_id, status);
CREATE INDEX idx_organization_members_active ON organization_members(organization_id) WHERE status = 'active';

-- User Profiles
CREATE INDEX idx_user_profiles_full_name ON user_profiles(full_name) WHERE full_name IS NOT NULL;
CREATE INDEX idx_user_profiles_last_seen ON user_profiles(last_seen_at);

-- ================================================================
-- ROW LEVEL SECURITY (CRITICAL FOR TENANT ISOLATION)
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- SECURITY POLICIES
-- ================================================================

-- Organizations: Users can only see organizations they're members of
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Organizations: Only owners can update organization settings
CREATE POLICY "Owners can update their organizations" ON organizations
    FOR UPDATE TO authenticated
    USING (
        id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
        )
    );

-- Organization Members: Users can view members of their organizations
CREATE POLICY "Users can view organization members" ON organization_members
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Organization Members: Admins and owners can manage members
CREATE POLICY "Admins can manage organization members" ON organization_members
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin') 
            AND status = 'active'
        )
    );

-- User Profiles: Users can view profiles of members in their organizations
CREATE POLICY "Users can view organization member profiles" ON user_profiles
    FOR SELECT TO authenticated
    USING (
        id IN (
            SELECT om.user_id
            FROM organization_members om1
            JOIN organization_members om ON om.organization_id = om1.organization_id
            WHERE om1.user_id = auth.uid() 
            AND om1.status = 'active' 
            AND om.status = 'active'
        )
        OR id = auth.uid()  -- Users can always view their own profile
    );

-- User Profiles: Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE TO authenticated
    USING (id = auth.uid());

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Function to get current user's organization context
CREATE OR REPLACE FUNCTION get_user_organizations()
RETURNS TABLE(organization_id UUID, organization_name TEXT, role TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT om.organization_id, o.name, om.role
    FROM organization_members om
    JOIN organizations o ON o.id = om.organization_id
    WHERE om.user_id = auth.uid() AND om.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has role in organization
CREATE OR REPLACE FUNCTION user_has_role_in_org(org_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM organization_members
    WHERE organization_id = org_id 
    AND user_id = auth.uid() 
    AND status = 'active';
    
    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Role hierarchy: owner > admin > manager > member > viewer
    RETURN CASE 
        WHEN required_role = 'viewer' THEN user_role IN ('owner', 'admin', 'manager', 'member', 'viewer')
        WHEN required_role = 'member' THEN user_role IN ('owner', 'admin', 'manager', 'member')
        WHEN required_role = 'manager' THEN user_role IN ('owner', 'admin', 'manager')
        WHEN required_role = 'admin' THEN user_role IN ('owner', 'admin')
        WHEN required_role = 'owner' THEN user_role = 'owner'
        ELSE FALSE
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- UPDATED_AT TRIGGERS
-- ================================================================

-- Create a generic function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER set_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ================================================================
-- INITIAL DATA SETUP (OPTIONAL)
-- ================================================================

-- Create a default organization for testing/development
-- UNCOMMENT ONLY FOR DEVELOPMENT/TESTING
-- INSERT INTO organizations (name, slug, subscription_tier, settings) VALUES
-- ('Sam AI Demo', 'sam-ai-demo', 'pro', '{
--     "demo_mode": true,
--     "max_campaigns": 10,
--     "max_contacts": 1000
-- }');

COMMENT ON TABLE organizations IS 'Primary tenant boundary table - all data scoped to organization';
COMMENT ON TABLE organization_members IS 'User-organization relationships with role-based access control';  
COMMENT ON TABLE user_profiles IS 'Extended user data beyond Supabase auth.users';

COMMENT ON FUNCTION get_user_organizations() IS 'Helper function to get current user organization context';
COMMENT ON FUNCTION user_has_role_in_org(UUID, TEXT) IS 'Check if current user has required role in organization';
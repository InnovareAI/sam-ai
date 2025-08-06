-- ================================================================
-- SAM AI - CAMPAIGN MANAGEMENT & CRM SCHEMA
-- ================================================================
-- CRITICAL: Multi-tenant campaign and contact management
-- Depends on: 01_multi_tenant_foundation.sql
-- ================================================================

-- ================================================================
-- ACCOUNT MANAGEMENT TABLES
-- ================================================================

-- LinkedIn Accounts (User-owned social accounts)
CREATE TABLE linkedin_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Account identification
    account_name TEXT NOT NULL,
    linkedin_url TEXT,
    profile_picture_url TEXT,
    
    -- Account status and limits
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'rate_limited')),
    connection_count INTEGER DEFAULT 0,
    daily_connection_limit INTEGER DEFAULT 100,
    weekly_message_limit INTEGER DEFAULT 300,
    
    -- Usage tracking
    connections_used_today INTEGER DEFAULT 0,
    messages_sent_today INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Account metadata
    account_type TEXT DEFAULT 'personal' CHECK (account_type IN ('personal', 'premium', 'sales_navigator')),
    connected_at TIMESTAMPTZ DEFAULT now(),
    settings JSONB DEFAULT '{
        "auto_accept_connections": false,
        "auto_message_connections": true,
        "working_hours": {
            "start": "09:00",
            "end": "17:00",
            "timezone": "UTC"
        },
        "daily_limits": {
            "connections": 100,
            "messages": 50,
            "profile_views": 200
        }
    }'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Email Accounts (User-owned email accounts)
CREATE TABLE email_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Account identification
    email_address TEXT NOT NULL,
    display_name TEXT,
    provider TEXT CHECK (provider IN ('gmail', 'outlook', 'custom')),
    
    -- Account status and configuration
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'rate_limited')),
    daily_limit INTEGER DEFAULT 500,
    smtp_settings JSONB,
    imap_settings JSONB,
    
    -- Usage tracking
    emails_sent_today INTEGER DEFAULT 0,
    last_sync_at TIMESTAMPTZ,
    last_reset_date DATE DEFAULT CURRENT_DATE,
    
    -- Account metadata
    verified BOOLEAN DEFAULT false,
    warmup_status TEXT DEFAULT 'not_started' CHECK (warmup_status IN ('not_started', 'in_progress', 'completed')),
    reputation_score INTEGER DEFAULT 100 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    UNIQUE(organization_id, email_address)
);

-- ================================================================
-- CAMPAIGN SYSTEM TABLES
-- ================================================================

-- Campaigns (User-created campaigns)
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Campaign identification
    name TEXT NOT NULL,
    description TEXT,
    campaign_type TEXT DEFAULT 'linkedin' CHECK (campaign_type IN ('linkedin', 'email', 'mixed')),
    
    -- Campaign status and settings
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
    
    -- Targeting and limits
    target_audience JSONB DEFAULT '{}',
    daily_limit INTEGER DEFAULT 50,
    total_target_count INTEGER DEFAULT 0,
    
    -- Schedule settings
    schedule_enabled BOOLEAN DEFAULT true,
    working_hours_start TIME DEFAULT '09:00',
    working_hours_end TIME DEFAULT '17:00',
    working_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- Monday to Friday
    timezone TEXT DEFAULT 'UTC',
    
    -- Performance tracking
    contacts_added INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    connections_made INTEGER DEFAULT 0,
    replies_received INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    
    -- Campaign settings
    settings JSONB DEFAULT '{
        "auto_connect": true,
        "auto_message": true,
        "message_delay_min": 1,
        "message_delay_max": 5,
        "followup_enabled": true,
        "max_followups": 3
    }'::jsonb,
    
    -- AI agent configuration
    ai_agent_config JSONB DEFAULT '{
        "personality": "professional",
        "tone": "friendly",
        "personalization_level": "medium",
        "auto_responses": false
    }'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Campaign Sequences (Message flows and follow-up templates)
CREATE TABLE campaign_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Sequence configuration
    step_number INTEGER NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN ('connection_request', 'message', 'email', 'delay', 'condition')),
    
    -- Message content
    subject TEXT, -- For emails
    message_template TEXT,
    personalization_fields TEXT[], -- Fields to personalize: ['first_name', 'company', 'job_title']
    
    -- Timing and conditions
    delay_days INTEGER DEFAULT 1,
    delay_hours INTEGER DEFAULT 0,
    conditions JSONB DEFAULT '{}', -- Conditional logic for sequence flow
    
    -- Performance tracking
    sent_count INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    replied_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    UNIQUE(campaign_id, step_number)
);

-- ================================================================
-- CONTACT MANAGEMENT TABLES
-- ================================================================

-- Contacts/Leads (Campaign targets and CRM contacts)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Contact identification
    first_name TEXT,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (COALESCE(first_name || ' ' || last_name, first_name, last_name)) STORED,
    email TEXT,
    phone TEXT,
    
    -- Professional information
    job_title TEXT,
    company_name TEXT,
    company_size TEXT,
    industry TEXT,
    location TEXT,
    
    -- Social profiles
    linkedin_url TEXT,
    linkedin_profile_id TEXT,
    twitter_url TEXT,
    website_url TEXT,
    
    -- Contact status and classification
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'contacted', 'replied', 'connected', 'converted', 'unresponsive', 'do_not_contact')),
    lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    source TEXT, -- How the contact was acquired
    tags TEXT[], -- Flexible tagging system
    
    -- Relationship tracking
    connection_status TEXT DEFAULT 'not_connected' CHECK (connection_status IN ('not_connected', 'pending', 'connected', 'removed')),
    last_contacted_at TIMESTAMPTZ,
    last_reply_at TIMESTAMPTZ,
    
    -- Contact enrichment data
    enrichment_data JSONB DEFAULT '{}', -- Store additional data from enrichment services
    custom_fields JSONB DEFAULT '{}', -- User-defined custom fields
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints and indexes for search
    CONSTRAINT contacts_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Contact Lists (Organized grouping of contacts)
CREATE TABLE contact_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- List identification
    name TEXT NOT NULL,
    description TEXT,
    list_type TEXT DEFAULT 'custom' CHECK (list_type IN ('custom', 'campaign', 'imported', 'smart')),
    
    -- Smart list criteria (for dynamic lists)
    criteria JSONB, -- Filter criteria for smart lists
    
    -- List metadata
    contact_count INTEGER DEFAULT 0,
    last_updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact List Memberships (Many-to-many relationship)
CREATE TABLE contact_list_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    list_id UUID NOT NULL REFERENCES contact_lists(id) ON DELETE CASCADE,
    
    -- Membership metadata
    added_by UUID REFERENCES auth.users(id),
    added_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    UNIQUE(contact_id, list_id)
);

-- ================================================================
-- INTERACTION TRACKING
-- ================================================================

-- Contact Interactions (Track all touchpoints)
CREATE TABLE contact_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    
    -- Interaction details
    interaction_type TEXT NOT NULL CHECK (interaction_type IN (
        'connection_request', 'connection_accepted', 'message_sent', 
        'message_received', 'email_sent', 'email_opened', 'email_replied',
        'profile_viewed', 'note_added', 'status_changed', 'call_made'
    )),
    
    -- Content and metadata
    subject TEXT,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Status tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'opened', 'replied', 'failed')),
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- LinkedIn Accounts
CREATE INDEX idx_linkedin_accounts_org_id ON linkedin_accounts(organization_id);
CREATE INDEX idx_linkedin_accounts_user_id ON linkedin_accounts(user_id);
CREATE INDEX idx_linkedin_accounts_status ON linkedin_accounts(organization_id, status);

-- Email Accounts  
CREATE INDEX idx_email_accounts_org_id ON email_accounts(organization_id);
CREATE INDEX idx_email_accounts_user_id ON email_accounts(user_id);
CREATE INDEX idx_email_accounts_status ON email_accounts(organization_id, status);

-- Campaigns
CREATE INDEX idx_campaigns_org_id ON campaigns(organization_id);
CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_status ON campaigns(organization_id, status);
CREATE INDEX idx_campaigns_type ON campaigns(organization_id, campaign_type);

-- Campaign Sequences
CREATE INDEX idx_campaign_sequences_campaign_id ON campaign_sequences(campaign_id);
CREATE INDEX idx_campaign_sequences_org_id ON campaign_sequences(organization_id);

-- Contacts
CREATE INDEX idx_contacts_org_id ON contacts(organization_id);
CREATE INDEX idx_contacts_user_id ON contacts(user_id);
CREATE INDEX idx_contacts_status ON contacts(organization_id, status);
CREATE INDEX idx_contacts_email ON contacts(organization_id, email) WHERE email IS NOT NULL;
CREATE INDEX idx_contacts_company ON contacts(organization_id, company_name) WHERE company_name IS NOT NULL;
CREATE INDEX idx_contacts_full_name ON contacts(organization_id, full_name) WHERE full_name IS NOT NULL;
CREATE INDEX idx_contacts_tags ON contacts USING GIN(tags);

-- Contact Lists
CREATE INDEX idx_contact_lists_org_id ON contact_lists(organization_id);
CREATE INDEX idx_contact_lists_user_id ON contact_lists(user_id);
CREATE INDEX idx_contact_lists_type ON contact_lists(organization_id, list_type);

-- Contact List Memberships
CREATE INDEX idx_contact_list_memberships_contact_id ON contact_list_memberships(contact_id);
CREATE INDEX idx_contact_list_memberships_list_id ON contact_list_memberships(list_id);

-- Contact Interactions
CREATE INDEX idx_contact_interactions_org_id ON contact_interactions(organization_id);
CREATE INDEX idx_contact_interactions_contact_id ON contact_interactions(contact_id);
CREATE INDEX idx_contact_interactions_user_id ON contact_interactions(user_id);
CREATE INDEX idx_contact_interactions_campaign_id ON contact_interactions(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_contact_interactions_type ON contact_interactions(organization_id, interaction_type);
CREATE INDEX idx_contact_interactions_created_at ON contact_interactions(organization_id, created_at);

-- ================================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE linkedin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_list_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;

-- LinkedIn Accounts: Users can manage accounts in their organizations
CREATE POLICY "Users can manage linkedin accounts in their organization" ON linkedin_accounts
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Email Accounts: Users can manage email accounts in their organizations
CREATE POLICY "Users can manage email accounts in their organization" ON email_accounts
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Campaigns: Users can manage campaigns in their organizations
CREATE POLICY "Users can manage campaigns in their organization" ON campaigns
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Campaign Sequences: Inherit access from campaigns
CREATE POLICY "Users can manage campaign sequences in their organization" ON campaign_sequences
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Contacts: Users can manage contacts in their organizations
CREATE POLICY "Users can manage contacts in their organization" ON contacts
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Contact Lists: Users can manage contact lists in their organizations
CREATE POLICY "Users can manage contact lists in their organization" ON contact_lists
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Contact List Memberships: Access controlled through contact and list policies
CREATE POLICY "Users can manage contact list memberships in their organization" ON contact_list_memberships
    FOR ALL TO authenticated
    USING (
        contact_id IN (
            SELECT id FROM contacts 
            WHERE organization_id IN (
                SELECT organization_id 
                FROM organization_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Contact Interactions: Users can manage interactions in their organizations
CREATE POLICY "Users can manage contact interactions in their organization" ON contact_interactions
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- ================================================================
-- UPDATED_AT TRIGGERS
-- ================================================================

CREATE TRIGGER set_linkedin_accounts_updated_at
    BEFORE UPDATE ON linkedin_accounts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_email_accounts_updated_at
    BEFORE UPDATE ON email_accounts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_campaign_sequences_updated_at
    BEFORE UPDATE ON campaign_sequences
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_contact_lists_updated_at
    BEFORE UPDATE ON contact_lists
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ================================================================
-- TABLE COMMENTS
-- ================================================================

COMMENT ON TABLE linkedin_accounts IS 'User-owned LinkedIn accounts for campaign automation';
COMMENT ON TABLE email_accounts IS 'User-owned email accounts for email outreach';
COMMENT ON TABLE campaigns IS 'Marketing/sales campaigns with multi-channel support';
COMMENT ON TABLE campaign_sequences IS 'Sequential message flows and automation steps';
COMMENT ON TABLE contacts IS 'CRM contacts and campaign prospects with enrichment data';
COMMENT ON TABLE contact_lists IS 'Organized grouping of contacts with smart list support';
COMMENT ON TABLE contact_list_memberships IS 'Many-to-many relationship between contacts and lists';
COMMENT ON TABLE contact_interactions IS 'Complete interaction history for relationship tracking';
-- ================================================================
-- SAM AI - AI CONVERSATION & MESSAGING SCHEMA
-- ================================================================
-- CRITICAL: Multi-tenant AI chat and conversation management
-- Depends on: 01_multi_tenant_foundation.sql
-- ================================================================

-- ================================================================
-- AI CONVERSATION TABLES
-- ================================================================

-- Conversations (AI chat sessions)
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Conversation identification
    title TEXT,
    conversation_type TEXT DEFAULT 'chat' CHECK (conversation_type IN (
        'chat',              -- Standard AI chat
        'campaign_planning', -- Campaign strategy discussion
        'contact_research',  -- Contact/lead research
        'analysis',          -- Data analysis and insights
        'troubleshooting',   -- Problem solving
        'training'           -- User onboarding/training
    )),
    
    -- AI Agent configuration
    agent_type TEXT DEFAULT 'sam' CHECK (agent_type IN (
        'sam',           -- Main Sam AI agent
        'campaign',      -- Campaign strategy specialist
        'research',      -- Contact research specialist
        'analytics',     -- Data analysis specialist
        'writing'        -- Content writing specialist
    )),
    
    -- Conversation status and metadata
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
    priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
    
    -- Context and state management
    context JSONB DEFAULT '{
        "current_task": null,
        "active_campaign": null,
        "selected_contacts": [],
        "user_preferences": {},
        "conversation_goals": [],
        "completed_actions": []
    }'::jsonb,
    
    -- Conversation settings
    settings JSONB DEFAULT '{
        "ai_personality": "professional",
        "response_style": "detailed",
        "auto_suggestions": true,
        "voice_enabled": false,
        "language": "en",
        "timezone": "UTC"
    }'::jsonb,
    
    -- Performance and analytics
    message_count INTEGER DEFAULT 0,
    user_satisfaction_score INTEGER CHECK (user_satisfaction_score >= 1 AND user_satisfaction_score <= 5),
    total_response_time_ms BIGINT DEFAULT 0,
    average_response_time_ms INTEGER,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_activity_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Messages (Individual chat messages)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Message identification
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    message_type TEXT DEFAULT 'text' CHECK (message_type IN (
        'text',              -- Standard text message
        'voice',             -- Voice message (transcribed)
        'image',             -- Image with description
        'file',              -- File attachment
        'action_request',    -- AI requesting action approval
        'action_result',     -- Result of executed action
        'suggestion',        -- AI suggestion or recommendation
        'error',             -- Error message
        'system_notification' -- System-generated notification
    )),
    
    -- Message content
    content TEXT NOT NULL,
    content_html TEXT, -- Rich text/HTML version if applicable
    
    -- Voice and multimedia support
    audio_url TEXT, -- URL to audio file (for voice messages)
    audio_duration_seconds INTEGER,
    attachments JSONB DEFAULT '[]'::jsonb, -- File attachments metadata
    
    -- AI processing metadata
    model_used TEXT, -- Which AI model generated the response
    tokens_used INTEGER, -- Token count for cost tracking
    processing_time_ms INTEGER, -- Response generation time
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Message context and relationships
    parent_message_id UUID REFERENCES messages(id), -- For threaded conversations
    thread_id UUID, -- Group related messages
    references_message_ids UUID[], -- Messages this message references
    
    -- User interaction tracking
    user_feedback TEXT CHECK (user_feedback IN ('positive', 'negative', 'neutral')),
    user_feedback_comment TEXT,
    edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    
    -- Tool/action execution metadata (for AI-initiated actions)
    tool_calls JSONB DEFAULT '[]'::jsonb, -- Tools/functions called by AI
    action_results JSONB DEFAULT '[]'::jsonb, -- Results of executed actions
    
    -- Message metadata
    metadata JSONB DEFAULT '{}'::jsonb, -- Extensible metadata storage
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- AI AGENT CAPABILITIES AND TOOLS
-- ================================================================

-- AI Agent Tools (Available functions for AI agents)
CREATE TABLE ai_agent_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Tool identification
    tool_name TEXT NOT NULL,
    tool_category TEXT NOT NULL CHECK (tool_category IN (
        'campaign_management',  -- Campaign CRUD operations
        'contact_management',   -- Contact research and management
        'data_analysis',       -- Analytics and reporting
        'integration',         -- External service integrations
        'automation',          -- Workflow automation
        'communication'        -- Messaging and outreach
    )),
    
    -- Tool configuration
    enabled BOOLEAN DEFAULT true,
    configuration JSONB DEFAULT '{}'::jsonb,
    permissions JSONB DEFAULT '{
        "roles_allowed": ["owner", "admin", "manager"],
        "requires_approval": false,
        "rate_limit_per_hour": 100
    }'::jsonb,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Tool metadata
    description TEXT,
    version TEXT DEFAULT '1.0',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    UNIQUE(organization_id, tool_name)
);

-- ================================================================
-- CONVERSATION ANALYTICS AND INSIGHTS
-- ================================================================

-- Conversation Insights (AI-generated insights from conversations)
CREATE TABLE conversation_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Insight classification
    insight_type TEXT NOT NULL CHECK (insight_type IN (
        'user_intent',           -- Understanding what user wants to achieve
        'pain_point',           -- Identified challenges or problems
        'opportunity',          -- Business opportunities discovered
        'action_item',          -- Tasks or actions identified
        'preference',           -- User preferences learned
        'pattern',              -- Usage or behavior patterns
        'feedback',             -- User feedback on AI performance
        'improvement_area'      -- Areas for system improvement
    )),
    
    -- Insight content
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    
    -- Insight context
    relevant_messages UUID[], -- Message IDs that contributed to this insight
    categories TEXT[], -- Flexible categorization
    tags TEXT[], -- Searchable tags
    
    -- Actionability
    actionable BOOLEAN DEFAULT false,
    action_taken BOOLEAN DEFAULT false,
    action_description TEXT,
    
    -- Insight metadata
    extracted_data JSONB DEFAULT '{}'::jsonb, -- Structured data extracted from conversation
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ -- Some insights may have expiration dates
);

-- ================================================================
-- CONVERSATION TEMPLATES AND WORKFLOWS
-- ================================================================

-- Conversation Templates (Predefined conversation flows)
CREATE TABLE conversation_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Template identification
    name TEXT NOT NULL,
    description TEXT,
    template_type TEXT NOT NULL CHECK (template_type IN (
        'onboarding',        -- New user onboarding flows
        'campaign_setup',    -- Campaign creation workflows
        'troubleshooting',   -- Problem resolution flows
        'training',          -- Feature training workflows
        'analysis_request'   -- Data analysis request flows
    )),
    
    -- Template configuration
    conversation_flow JSONB NOT NULL, -- Structured conversation flow definition
    ai_instructions TEXT NOT NULL, -- Instructions for AI agent behavior
    
    -- Template settings
    enabled BOOLEAN DEFAULT true,
    version TEXT DEFAULT '1.0',
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2), -- Percentage of successful completions
    
    -- Template metadata
    tags TEXT[],
    estimated_duration_minutes INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Conversations
CREATE INDEX idx_conversations_org_id ON conversations(organization_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(organization_id, status);
CREATE INDEX idx_conversations_agent_type ON conversations(organization_id, agent_type);
CREATE INDEX idx_conversations_type ON conversations(organization_id, conversation_type);
CREATE INDEX idx_conversations_last_activity ON conversations(organization_id, last_activity_at);
CREATE INDEX idx_conversations_context ON conversations USING GIN(context);

-- Messages
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_org_id ON messages(organization_id);
CREATE INDEX idx_messages_role ON messages(conversation_id, role);
CREATE INDEX idx_messages_type ON messages(conversation_id, message_type);
CREATE INDEX idx_messages_created_at ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_parent_id ON messages(parent_message_id) WHERE parent_message_id IS NOT NULL;
CREATE INDEX idx_messages_thread_id ON messages(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX idx_messages_tool_calls ON messages USING GIN(tool_calls) WHERE tool_calls != '[]'::jsonb;

-- Full-text search on message content
CREATE INDEX idx_messages_content_search ON messages USING GIN(to_tsvector('english', content));

-- AI Agent Tools
CREATE INDEX idx_ai_agent_tools_org_id ON ai_agent_tools(organization_id);
CREATE INDEX idx_ai_agent_tools_category ON ai_agent_tools(organization_id, tool_category);
CREATE INDEX idx_ai_agent_tools_enabled ON ai_agent_tools(organization_id) WHERE enabled = true;

-- Conversation Insights
CREATE INDEX idx_conversation_insights_conversation_id ON conversation_insights(conversation_id);
CREATE INDEX idx_conversation_insights_org_id ON conversation_insights(organization_id);
CREATE INDEX idx_conversation_insights_type ON conversation_insights(organization_id, insight_type);
CREATE INDEX idx_conversation_insights_actionable ON conversation_insights(organization_id) WHERE actionable = true;

-- Conversation Templates
CREATE INDEX idx_conversation_templates_org_id ON conversation_templates(organization_id);
CREATE INDEX idx_conversation_templates_type ON conversation_templates(organization_id, template_type);
CREATE INDEX idx_conversation_templates_enabled ON conversation_templates(organization_id) WHERE enabled = true;

-- ================================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_templates ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can manage conversations in their organizations
CREATE POLICY "Users can manage conversations in their organization" ON conversations
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Messages: Users can access messages in conversations they have access to
CREATE POLICY "Users can access messages in their conversations" ON messages
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- AI Agent Tools: Organization-wide access based on membership
CREATE POLICY "Users can access AI tools in their organization" ON ai_agent_tools
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- AI Agent Tools: Only admins can modify tools
CREATE POLICY "Admins can manage AI tools" ON ai_agent_tools
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

-- Conversation Insights: Users can access insights from their conversations
CREATE POLICY "Users can access conversation insights in their organization" ON conversation_insights
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Conversation Templates: Organization-wide access
CREATE POLICY "Users can access conversation templates in their organization" ON conversation_templates
    FOR SELECT TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Conversation Templates: Managers and above can create/modify templates
CREATE POLICY "Managers can manage conversation templates" ON conversation_templates
    FOR ALL TO authenticated
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin', 'manager') 
            AND status = 'active'
        )
    );

-- ================================================================
-- FUNCTIONS FOR CONVERSATION MANAGEMENT
-- ================================================================

-- Function to update conversation last_activity_at when messages are added
CREATE OR REPLACE FUNCTION update_conversation_activity()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations 
    SET 
        last_activity_at = NEW.created_at,
        message_count = message_count + 1,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update conversation activity
CREATE TRIGGER update_conversation_activity_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_activity();

-- Function to calculate average response time for conversations
CREATE OR REPLACE FUNCTION calculate_conversation_response_time()
RETURNS TRIGGER AS $$
DECLARE
    total_time BIGINT;
    message_pairs INTEGER;
BEGIN
    -- Calculate total response time and message pair count for this conversation
    WITH message_pairs AS (
        SELECT 
            m1.created_at as user_time,
            m2.created_at as ai_time,
            EXTRACT(EPOCH FROM (m2.created_at - m1.created_at)) * 1000 as response_time_ms
        FROM messages m1
        JOIN messages m2 ON m2.conversation_id = m1.conversation_id
        WHERE m1.conversation_id = NEW.conversation_id
        AND m1.role = 'user'
        AND m2.role = 'assistant'
        AND m2.created_at > m1.created_at
        AND NOT EXISTS (
            SELECT 1 FROM messages m3 
            WHERE m3.conversation_id = m1.conversation_id
            AND m3.created_at > m1.created_at 
            AND m3.created_at < m2.created_at
        )
    )
    SELECT 
        SUM(response_time_ms)::BIGINT,
        COUNT(*)::INTEGER
    INTO total_time, message_pairs
    FROM message_pairs;
    
    -- Update conversation with calculated metrics
    UPDATE conversations 
    SET 
        total_response_time_ms = COALESCE(total_time, 0),
        average_response_time_ms = CASE 
            WHEN message_pairs > 0 THEN (total_time / message_pairs)::INTEGER
            ELSE NULL 
        END,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to calculate response times when assistant messages are added
CREATE TRIGGER calculate_response_time_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    WHEN (NEW.role = 'assistant')
    EXECUTE FUNCTION calculate_conversation_response_time();

-- ================================================================
-- UPDATED_AT TRIGGERS
-- ================================================================

CREATE TRIGGER set_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_ai_agent_tools_updated_at
    BEFORE UPDATE ON ai_agent_tools
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_conversation_templates_updated_at
    BEFORE UPDATE ON conversation_templates
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ================================================================
-- TABLE COMMENTS
-- ================================================================

COMMENT ON TABLE conversations IS 'AI chat sessions with context and state management';
COMMENT ON TABLE messages IS 'Individual messages in conversations with multimedia support';
COMMENT ON TABLE ai_agent_tools IS 'Available AI agent tools and their configurations';
COMMENT ON TABLE conversation_insights IS 'AI-generated insights extracted from conversations';
COMMENT ON TABLE conversation_templates IS 'Predefined conversation flows and workflows';

-- ================================================================
-- DEFAULT AI AGENT TOOLS (OPTIONAL - UNCOMMENT FOR DEVELOPMENT)
-- ================================================================

-- UNCOMMENT THESE INSERTS FOR DEVELOPMENT/TESTING ONLY
-- INSERT INTO ai_agent_tools (organization_id, tool_name, tool_category, description, configuration) VALUES
-- ((SELECT id FROM organizations LIMIT 1), 'create_campaign', 'campaign_management', 'Create new marketing campaigns', '{"requires_approval": false}'),
-- ((SELECT id FROM organizations LIMIT 1), 'search_contacts', 'contact_management', 'Search and filter contacts', '{"requires_approval": false}'),
-- ((SELECT id FROM organizations LIMIT 1), 'generate_report', 'data_analysis', 'Generate analytics reports', '{"requires_approval": true}'),
-- ((SELECT id FROM organizations LIMIT 1), 'send_linkedin_message', 'communication', 'Send LinkedIn messages', '{"requires_approval": true, "rate_limit_per_hour": 20}');
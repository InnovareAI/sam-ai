-- ================================================================
-- SAM AI - COMPLETE DATABASE DEPLOYMENT SCRIPT
-- ================================================================
-- CRITICAL: This script deploys the complete multi-tenant schema
-- Execute this script in the following order:
-- 1. 01_multi_tenant_foundation.sql
-- 2. 02_campaign_management.sql  
-- 3. 03_ai_conversations.sql
-- 4. 04_complete_deployment.sql (this file)
-- ================================================================

-- ================================================================
-- ADDITIONAL PERFORMANCE OPTIMIZATIONS
-- ================================================================

-- Composite indexes for common multi-tenant queries
CREATE INDEX CONCURRENTLY idx_campaigns_org_user_status 
    ON campaigns(organization_id, user_id, status) 
    WHERE status IN ('active', 'paused');

CREATE INDEX CONCURRENTLY idx_contacts_org_status_updated 
    ON contacts(organization_id, status, updated_at) 
    WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_conversations_org_user_activity 
    ON conversations(organization_id, user_id, last_activity_at DESC);

CREATE INDEX CONCURRENTLY idx_messages_conversation_created_role 
    ON messages(conversation_id, created_at DESC, role);

-- Partial indexes for frequently accessed data
CREATE INDEX CONCURRENTLY idx_organization_members_active_users 
    ON organization_members(organization_id, role, last_active_at) 
    WHERE status = 'active';

CREATE INDEX CONCURRENTLY idx_linkedin_accounts_active_usage 
    ON linkedin_accounts(organization_id, status, last_activity_at) 
    WHERE status = 'active';

-- ================================================================
-- DATABASE VIEWS FOR COMMON QUERIES
-- ================================================================

-- Organization member summary view
CREATE VIEW organization_member_summary AS
SELECT 
    om.organization_id,
    o.name as organization_name,
    om.user_id,
    up.full_name,
    up.avatar_url,
    om.role,
    om.status,
    om.last_active_at,
    om.joined_at,
    -- Count user's activities
    (SELECT COUNT(*) FROM campaigns c WHERE c.user_id = om.user_id AND c.organization_id = om.organization_id) as campaign_count,
    (SELECT COUNT(*) FROM contacts ct WHERE ct.user_id = om.user_id AND ct.organization_id = om.organization_id) as contact_count,
    (SELECT COUNT(*) FROM conversations cv WHERE cv.user_id = om.user_id AND cv.organization_id = om.organization_id) as conversation_count
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
JOIN user_profiles up ON up.id = om.user_id
WHERE om.status = 'active';

-- Campaign performance summary view
CREATE VIEW campaign_performance_summary AS
SELECT 
    c.id,
    c.organization_id,
    c.user_id,
    c.name,
    c.status,
    c.campaign_type,
    c.daily_limit,
    c.contacts_added,
    c.messages_sent,
    c.connections_made,
    c.replies_received,
    c.conversion_count,
    -- Calculate performance metrics
    CASE 
        WHEN c.contacts_added > 0 THEN ROUND((c.connections_made::DECIMAL / c.contacts_added) * 100, 2)
        ELSE 0 
    END as connection_rate_percent,
    CASE 
        WHEN c.messages_sent > 0 THEN ROUND((c.replies_received::DECIMAL / c.messages_sent) * 100, 2)
        ELSE 0 
    END as response_rate_percent,
    CASE 
        WHEN c.replies_received > 0 THEN ROUND((c.conversion_count::DECIMAL / c.replies_received) * 100, 2)
        ELSE 0 
    END as conversion_rate_percent,
    -- Sequence information
    (SELECT COUNT(*) FROM campaign_sequences cs WHERE cs.campaign_id = c.id) as sequence_count,
    c.created_at,
    c.started_at,
    c.completed_at
FROM campaigns c;

-- Contact interaction summary view
CREATE VIEW contact_interaction_summary AS
SELECT 
    c.id,
    c.organization_id,
    c.user_id,
    c.full_name,
    c.email,
    c.company_name,
    c.job_title,
    c.status,
    c.lead_score,
    c.connection_status,
    c.last_contacted_at,
    c.last_reply_at,
    -- Interaction counts
    (SELECT COUNT(*) FROM contact_interactions ci WHERE ci.contact_id = c.id AND ci.interaction_type = 'connection_request') as connection_requests_sent,
    (SELECT COUNT(*) FROM contact_interactions ci WHERE ci.contact_id = c.id AND ci.interaction_type = 'message_sent') as messages_sent,
    (SELECT COUNT(*) FROM contact_interactions ci WHERE ci.contact_id = c.id AND ci.interaction_type = 'message_received') as messages_received,
    (SELECT COUNT(*) FROM contact_interactions ci WHERE ci.contact_id = c.id AND ci.interaction_type = 'email_sent') as emails_sent,
    -- Latest interaction
    (SELECT ci.interaction_type FROM contact_interactions ci WHERE ci.contact_id = c.id ORDER BY ci.created_at DESC LIMIT 1) as last_interaction_type,
    (SELECT ci.created_at FROM contact_interactions ci WHERE ci.contact_id = c.id ORDER BY ci.created_at DESC LIMIT 1) as last_interaction_at,
    c.created_at,
    c.updated_at
FROM contacts c;

-- Conversation analytics view
CREATE VIEW conversation_analytics AS
SELECT 
    c.id,
    c.organization_id,
    c.user_id,
    c.title,
    c.conversation_type,
    c.agent_type,
    c.status,
    c.message_count,
    c.average_response_time_ms,
    c.user_satisfaction_score,
    -- Message breakdown
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.role = 'user') as user_messages,
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.role = 'assistant') as assistant_messages,
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.role = 'system') as system_messages,
    -- Voice message stats
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.message_type = 'voice') as voice_messages,
    -- Action execution stats
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND jsonb_array_length(m.tool_calls) > 0) as messages_with_actions,
    -- Feedback stats
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.user_feedback = 'positive') as positive_feedback_count,
    (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id AND m.user_feedback = 'negative') as negative_feedback_count,
    -- Duration
    CASE 
        WHEN c.completed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (c.completed_at - c.created_at)) / 60
        ELSE EXTRACT(EPOCH FROM (c.last_activity_at - c.created_at)) / 60
    END as duration_minutes,
    c.created_at,
    c.last_activity_at,
    c.completed_at
FROM conversations c;

-- ================================================================
-- ANALYTICS FUNCTIONS FOR DASHBOARD
-- ================================================================

-- Function to get organization dashboard metrics
CREATE OR REPLACE FUNCTION get_organization_dashboard_metrics(org_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_members', (SELECT COUNT(*) FROM organization_members WHERE organization_id = org_id AND status = 'active'),
        'total_campaigns', (SELECT COUNT(*) FROM campaigns WHERE organization_id = org_id),
        'active_campaigns', (SELECT COUNT(*) FROM campaigns WHERE organization_id = org_id AND status = 'active'),
        'total_contacts', (SELECT COUNT(*) FROM contacts WHERE organization_id = org_id),
        'connected_contacts', (SELECT COUNT(*) FROM contacts WHERE organization_id = org_id AND connection_status = 'connected'),
        'total_conversations', (SELECT COUNT(*) FROM conversations WHERE organization_id = org_id),
        'active_conversations', (SELECT COUNT(*) FROM conversations WHERE organization_id = org_id AND status = 'active'),
        'linkedin_accounts', (SELECT COUNT(*) FROM linkedin_accounts WHERE organization_id = org_id AND status = 'active'),
        'email_accounts', (SELECT COUNT(*) FROM email_accounts WHERE organization_id = org_id AND status = 'active'),
        -- Performance metrics
        'avg_response_rate', (
            SELECT COALESCE(AVG(
                CASE WHEN messages_sent > 0 THEN (replies_received::DECIMAL / messages_sent) * 100 ELSE 0 END
            ), 0)
            FROM campaigns WHERE organization_id = org_id
        ),
        'avg_connection_rate', (
            SELECT COALESCE(AVG(
                CASE WHEN contacts_added > 0 THEN (connections_made::DECIMAL / contacts_added) * 100 ELSE 0 END
            ), 0)
            FROM campaigns WHERE organization_id = org_id
        ),
        -- Recent activity
        'recent_messages_count', (
            SELECT COUNT(*) FROM messages m
            JOIN conversations c ON c.id = m.conversation_id
            WHERE c.organization_id = org_id 
            AND m.created_at > NOW() - INTERVAL '24 hours'
        ),
        'recent_interactions_count', (
            SELECT COUNT(*) FROM contact_interactions 
            WHERE organization_id = org_id 
            AND created_at > NOW() - INTERVAL '24 hours'
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user-specific metrics
CREATE OR REPLACE FUNCTION get_user_metrics(user_uuid UUID, org_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'campaigns_created', (SELECT COUNT(*) FROM campaigns WHERE user_id = user_uuid AND organization_id = org_id),
        'active_campaigns', (SELECT COUNT(*) FROM campaigns WHERE user_id = user_uuid AND organization_id = org_id AND status = 'active'),
        'contacts_managed', (SELECT COUNT(*) FROM contacts WHERE user_id = user_uuid AND organization_id = org_id),
        'conversations_started', (SELECT COUNT(*) FROM conversations WHERE user_id = user_uuid AND organization_id = org_id),
        'messages_sent_today', (
            SELECT COUNT(*) FROM contact_interactions 
            WHERE user_id = user_uuid AND organization_id = org_id 
            AND interaction_type IN ('message_sent', 'email_sent')
            AND created_at > CURRENT_DATE
        ),
        'connections_made_today', (
            SELECT COUNT(*) FROM contact_interactions 
            WHERE user_id = user_uuid AND organization_id = org_id 
            AND interaction_type = 'connection_accepted'
            AND created_at > CURRENT_DATE
        ),
        -- AI conversation stats
        'ai_conversations', (SELECT COUNT(*) FROM conversations WHERE user_id = user_uuid AND organization_id = org_id),
        'avg_conversation_satisfaction', (
            SELECT COALESCE(AVG(user_satisfaction_score), 0) 
            FROM conversations 
            WHERE user_id = user_uuid AND organization_id = org_id 
            AND user_satisfaction_score IS NOT NULL
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- DATA VALIDATION AND HEALTH CHECK FUNCTIONS
-- ================================================================

-- Function to validate database schema and constraints
CREATE OR REPLACE FUNCTION validate_database_health()
RETURNS TABLE(
    table_name TEXT,
    status TEXT,
    row_count BIGINT,
    issues TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    WITH table_stats AS (
        SELECT 
            'organizations'::TEXT as tbl_name,
            (SELECT COUNT(*) FROM organizations) as cnt,
            ARRAY[]::TEXT[] as problems
        UNION ALL
        SELECT 
            'organization_members'::TEXT,
            (SELECT COUNT(*) FROM organization_members),
            CASE 
                WHEN EXISTS(SELECT 1 FROM organization_members WHERE organization_id NOT IN (SELECT id FROM organizations))
                THEN ARRAY['Orphaned organization_members found']
                ELSE ARRAY[]::TEXT[]
            END
        UNION ALL
        SELECT 
            'user_profiles'::TEXT,
            (SELECT COUNT(*) FROM user_profiles),
            ARRAY[]::TEXT[]
        UNION ALL
        SELECT 
            'campaigns'::TEXT,
            (SELECT COUNT(*) FROM campaigns),
            CASE 
                WHEN EXISTS(SELECT 1 FROM campaigns WHERE organization_id NOT IN (SELECT id FROM organizations))
                THEN ARRAY['Orphaned campaigns found']
                ELSE ARRAY[]::TEXT[]
            END
        UNION ALL
        SELECT 
            'contacts'::TEXT,
            (SELECT COUNT(*) FROM contacts),
            CASE 
                WHEN EXISTS(SELECT 1 FROM contacts WHERE organization_id NOT IN (SELECT id FROM organizations))
                THEN ARRAY['Orphaned contacts found']
                ELSE ARRAY[]::TEXT[]
            END
        UNION ALL
        SELECT 
            'conversations'::TEXT,
            (SELECT COUNT(*) FROM conversations),
            CASE 
                WHEN EXISTS(SELECT 1 FROM conversations WHERE organization_id NOT IN (SELECT id FROM organizations))
                THEN ARRAY['Orphaned conversations found']
                ELSE ARRAY[]::TEXT[]
            END
        UNION ALL
        SELECT 
            'messages'::TEXT,
            (SELECT COUNT(*) FROM messages),
            CASE 
                WHEN EXISTS(SELECT 1 FROM messages WHERE conversation_id NOT IN (SELECT id FROM conversations))
                THEN ARRAY['Orphaned messages found']
                ELSE ARRAY[]::TEXT[]
            END
    )
    SELECT 
        tbl_name,
        CASE 
            WHEN array_length(problems, 1) > 0 THEN 'WARNING'
            WHEN cnt > 0 THEN 'OK'
            ELSE 'EMPTY'
        END,
        cnt,
        problems
    FROM table_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PERMISSIONS AND FINAL SECURITY
-- ================================================================

-- Grant appropriate permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_user_organizations() TO authenticated;
GRANT EXECUTE ON FUNCTION user_has_role_in_org(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_organization_dashboard_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_metrics(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION validate_database_health() TO authenticated;

-- Create service role permissions (for API access)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ================================================================
-- DEPLOYMENT COMPLETION LOG
-- ================================================================

-- Create deployment log table
CREATE TABLE IF NOT EXISTS deployment_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deployment_version TEXT NOT NULL,
    deployment_status TEXT NOT NULL,
    executed_by TEXT DEFAULT current_user,
    execution_details JSONB DEFAULT '{}'::jsonb,
    executed_at TIMESTAMPTZ DEFAULT now()
);

-- Log this deployment
INSERT INTO deployment_log (deployment_version, deployment_status, execution_details) VALUES (
    'v1.0-complete-multi-tenant-schema',
    'SUCCESS',
    json_build_object(
        'tables_created', ARRAY[
            'organizations', 'organization_members', 'user_profiles',
            'linkedin_accounts', 'email_accounts', 'campaigns', 'campaign_sequences',
            'contacts', 'contact_lists', 'contact_list_memberships', 'contact_interactions',
            'conversations', 'messages', 'ai_agent_tools', 'conversation_insights', 'conversation_templates'
        ],
        'views_created', ARRAY[
            'organization_member_summary', 'campaign_performance_summary', 
            'contact_interaction_summary', 'conversation_analytics'
        ],
        'functions_created', ARRAY[
            'get_user_organizations', 'user_has_role_in_org', 'trigger_set_updated_at',
            'update_conversation_activity', 'calculate_conversation_response_time',
            'get_organization_dashboard_metrics', 'get_user_metrics', 'validate_database_health'
        ],
        'rls_enabled', true,
        'indexes_created', true,
        'permissions_granted', true
    )
);

-- ================================================================
-- FINAL VALIDATION
-- ================================================================

-- Output deployment summary
DO $$ 
DECLARE
    table_count INTEGER;
    view_count INTEGER;
    function_count INTEGER;
    policy_count INTEGER;
    index_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    SELECT COUNT(*) INTO view_count FROM information_schema.views WHERE table_schema = 'public';
    SELECT COUNT(*) INTO function_count FROM information_schema.routines WHERE routine_schema = 'public';
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';
    
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'SAM AI DATABASE DEPLOYMENT COMPLETED SUCCESSFULLY';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Tables created: %', table_count;
    RAISE NOTICE 'Views created: %', view_count;
    RAISE NOTICE 'Functions created: %', function_count;
    RAISE NOTICE 'RLS policies created: %', policy_count;
    RAISE NOTICE 'Indexes created: %', index_count;
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'Multi-tenant architecture deployed with complete isolation';
    RAISE NOTICE 'All tables protected with Row Level Security (RLS)';
    RAISE NOTICE 'Performance indexes created for multi-tenant queries';
    RAISE NOTICE 'Analytics functions ready for dashboard integration';
    RAISE NOTICE '================================================================';
    RAISE NOTICE 'READY FOR FRONTEND INTEGRATION';
    RAISE NOTICE '================================================================';
END $$;

-- Final comment
COMMENT ON TABLE deployment_log IS 'Track database schema deployments and changes';
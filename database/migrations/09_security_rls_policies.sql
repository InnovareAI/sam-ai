-- Comprehensive Row Level Security (RLS) Policies
-- Ensures data isolation between workspaces and proper access control

-- Enable RLS on all tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE n8n_execution_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Workspace access" ON contacts;
DROP POLICY IF EXISTS "Workspace access" ON campaigns;
DROP POLICY IF EXISTS "Workspace access" ON messages;
DROP POLICY IF EXISTS "Workspace access" ON analytics;
DROP POLICY IF EXISTS "Workspace access" ON accounts;
DROP POLICY IF EXISTS "Workspace access" ON templates;
DROP POLICY IF EXISTS "Workspace access" ON n8n_workflows;
DROP POLICY IF EXISTS "Workspace access" ON n8n_execution_logs;

-- Contacts policies
CREATE POLICY "contacts_workspace_isolation" ON contacts
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "contacts_insert_check" ON contacts
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

-- Campaigns policies
CREATE POLICY "campaigns_workspace_isolation" ON campaigns
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "campaigns_owner_update" ON campaigns
  FOR UPDATE USING (
    created_by = auth.uid() OR
    workspace_id IN (
      SELECT workspace_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Messages policies
CREATE POLICY "messages_workspace_isolation" ON messages
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

-- Analytics policies (read-only for non-admins)
CREATE POLICY "analytics_read_access" ON analytics
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "analytics_write_admin_only" ON analytics
  FOR INSERT USING (
    workspace_id IN (
      SELECT workspace_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Accounts policies
CREATE POLICY "accounts_workspace_isolation" ON accounts
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

-- Templates policies (workspace-specific and public templates)
CREATE POLICY "templates_access" ON templates
  FOR SELECT USING (
    is_public = true OR
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "templates_modification" ON templates
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

-- N8N workflows policies
CREATE POLICY "n8n_workflows_workspace_isolation" ON n8n_workflows
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

-- N8N execution logs policies
CREATE POLICY "n8n_execution_logs_workspace_isolation" ON n8n_execution_logs
  FOR ALL USING (
    workspace_id IN (
      SELECT workspace_id FROM users WHERE id = auth.uid()
    )
  );

-- Create audit log table for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  workspace_id UUID REFERENCES workspaces(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_workspace ON audit_logs(workspace_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Enable RLS on audit logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs policy (only admins can read)
CREATE POLICY "audit_logs_admin_only" ON audit_logs
  FOR SELECT USING (
    workspace_id IN (
      SELECT workspace_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Function to automatically log changes
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    workspace_id,
    action,
    entity_type,
    entity_id,
    old_data,
    new_data,
    created_at
  ) VALUES (
    auth.uid(),
    COALESCE(NEW.workspace_id, OLD.workspace_id),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for sensitive tables
CREATE TRIGGER audit_contacts_changes
  AFTER INSERT OR UPDATE OR DELETE ON contacts
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_campaigns_changes
  AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_accounts_changes
  AFTER INSERT OR UPDATE OR DELETE ON accounts
  FOR EACH ROW EXECUTE FUNCTION log_audit_event();
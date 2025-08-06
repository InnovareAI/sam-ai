-- Create table for tracking n8n workflows
CREATE TABLE IF NOT EXISTS n8n_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  active BOOLEAN DEFAULT false,
  webhook_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  last_execution_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  workspace_id UUID REFERENCES workspaces(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_workflow_id ON n8n_workflows(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_active ON n8n_workflows(active);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_type ON n8n_workflows(type);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_workspace ON n8n_workflows(workspace_id);

-- Add RLS policies
ALTER TABLE n8n_workflows ENABLE ROW LEVEL SECURITY;

-- Policy for workspace access
CREATE POLICY "Workspace access" ON n8n_workflows
  USING (workspace_id IN (
    SELECT workspace_id FROM users WHERE id = auth.uid()
  ));

-- Create trigger for updated_at
CREATE TRIGGER update_n8n_workflows_updated_at
  BEFORE UPDATE ON n8n_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create table for n8n execution logs
CREATE TABLE IF NOT EXISTS n8n_execution_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id TEXT NOT NULL,
  execution_id TEXT,
  status TEXT CHECK (status IN ('success', 'error', 'running', 'waiting')),
  started_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  workspace_id UUID REFERENCES workspaces(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for execution logs
CREATE INDEX IF NOT EXISTS idx_n8n_execution_logs_workflow ON n8n_execution_logs(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_execution_logs_status ON n8n_execution_logs(status);
CREATE INDEX IF NOT EXISTS idx_n8n_execution_logs_workspace ON n8n_execution_logs(workspace_id);

-- Add RLS policies for execution logs
ALTER TABLE n8n_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace access" ON n8n_execution_logs
  USING (workspace_id IN (
    SELECT workspace_id FROM users WHERE id = auth.uid()
  ));
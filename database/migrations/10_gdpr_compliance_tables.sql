-- GDPR Compliance Tables

-- Consent records table
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT false,
  version TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, purpose, version)
);

-- GDPR requests table
CREATE TABLE IF NOT EXISTS gdpr_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('access', 'deletion', 'portability', 'rectification', 'restriction', 'objection')),
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'rejected')) DEFAULT 'pending',
  reason TEXT,
  data JSONB,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES users(id),
  notes TEXT
);

-- Data processing activities table (for Article 30 compliance)
CREATE TABLE IF NOT EXISTS data_processing_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis TEXT NOT NULL,
  data_categories TEXT[],
  data_subjects TEXT[],
  recipients TEXT[],
  retention_period TEXT,
  security_measures TEXT[],
  third_country_transfers BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Privacy policy versions table
CREATE TABLE IF NOT EXISTS privacy_policy_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  changes_summary TEXT,
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User privacy preferences
CREATE TABLE IF NOT EXISTS privacy_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  marketing_emails BOOLEAN DEFAULT false,
  analytics_tracking BOOLEAN DEFAULT true,
  data_sharing BOOLEAN DEFAULT false,
  profiling BOOLEAN DEFAULT false,
  automated_decisions BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Encrypted PII fields tracking
CREATE TABLE IF NOT EXISTS encrypted_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  encryption_method TEXT NOT NULL,
  encrypted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_name, column_name)
);

-- Create indexes
CREATE INDEX idx_consent_records_user ON consent_records(user_id);
CREATE INDEX idx_consent_records_purpose ON consent_records(purpose);
CREATE INDEX idx_gdpr_requests_user ON gdpr_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON gdpr_requests(status);
CREATE INDEX idx_gdpr_requests_type ON gdpr_requests(type);
CREATE INDEX idx_privacy_preferences_user ON privacy_preferences(user_id);

-- Enable RLS
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE privacy_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own consent records" ON consent_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own consent" ON consent_records
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own GDPR requests" ON gdpr_requests
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create GDPR requests" ON gdpr_requests
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage GDPR requests" ON gdpr_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

CREATE POLICY "Users can manage own privacy preferences" ON privacy_preferences
  FOR ALL USING (user_id = auth.uid());

-- Function to delete user data (for right to be forgotten)
CREATE OR REPLACE FUNCTION delete_user_data(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Delete or anonymize user data
  DELETE FROM messages WHERE sent_by = user_id;
  DELETE FROM campaigns WHERE created_by = user_id;
  
  -- Anonymize contacts instead of deleting
  UPDATE contacts 
  SET 
    email = 'deleted_' || gen_random_uuid() || '@anonymous.local',
    phone = NULL,
    linkedin = NULL,
    notes = '[Data Deleted per GDPR Request]'
  WHERE workspace_id IN (
    SELECT workspace_id FROM users WHERE id = user_id
  );
  
  -- Delete audit logs after a delay (for legal requirements)
  UPDATE audit_logs 
  SET 
    old_data = NULL,
    new_data = jsonb_build_object('status', 'deleted_per_gdpr')
  WHERE user_id = user_id;
  
  -- Mark user as deleted
  UPDATE users 
  SET 
    status = 'deleted',
    email = 'deleted_' || gen_random_uuid() || '@anonymous.local'
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export user data (for data portability)
CREATE OR REPLACE FUNCTION export_user_data(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user', (SELECT row_to_json(u) FROM users u WHERE u.id = user_id),
    'profile', (SELECT row_to_json(p) FROM user_profiles p WHERE p.id = user_id),
    'contacts', (SELECT jsonb_agg(row_to_json(c)) FROM contacts c WHERE c.workspace_id IN (SELECT workspace_id FROM users WHERE id = user_id)),
    'campaigns', (SELECT jsonb_agg(row_to_json(c)) FROM campaigns c WHERE c.created_by = user_id),
    'messages', (SELECT jsonb_agg(row_to_json(m)) FROM messages m WHERE m.sent_by = user_id),
    'exported_at', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add column for PII encryption flag
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS pii_encrypted BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pii_encrypted BOOLEAN DEFAULT false;
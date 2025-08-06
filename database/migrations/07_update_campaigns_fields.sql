-- Update campaigns table to match frontend requirements

-- Add channels field (array)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS channels TEXT[];

-- Add stats field (JSONB for flexible metrics)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}'::jsonb;

-- Add settings field (JSONB for campaign configuration)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Update type constraint to match frontend values
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_type_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_type_check 
  CHECK (type IN ('Email', 'LinkedIn', 'Multi-channel', 'Cold Outreach', 'linkedin', 'email', 'whatsapp', 'multi_channel'));

-- Update status constraint to match frontend values (capitalize first letter)
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
  CHECK (status IN ('Draft', 'Active', 'Paused', 'Completed', 'Archived', 'draft', 'active', 'paused', 'completed', 'archived'));
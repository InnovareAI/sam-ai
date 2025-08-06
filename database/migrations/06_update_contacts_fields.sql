-- Update contacts table to match frontend requirements
-- Add missing fields and rename existing ones

-- Add full name field
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS name TEXT;
UPDATE contacts SET name = CONCAT(first_name, ' ', last_name) WHERE name IS NULL;

-- Add company and role fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS role TEXT;
UPDATE contacts SET role = title WHERE role IS NULL AND title IS NOT NULL;

-- Add location field
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS location TEXT;

-- Add website field  
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS website TEXT;

-- Add linkedin field (in addition to linkedin_url)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin TEXT;
UPDATE contacts SET linkedin = linkedin_url WHERE linkedin IS NULL AND linkedin_url IS NOT NULL;

-- Add status field with constraint
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status TEXT 
  CHECK (status IN ('New Contact', 'In Progress', 'Qualified', 'Lost'));
UPDATE contacts SET status = 'New Contact' WHERE status IS NULL;

-- Add priority field with constraint
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS priority TEXT 
  CHECK (priority IN ('High', 'Medium', 'Low'));
UPDATE contacts SET priority = 'Medium' WHERE priority IS NULL;

-- Add notes field
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add WhatsApp field
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Add company phone field
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS company_phone TEXT;

-- Add avatar URL field
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add tags field (array of text)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add score field
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS score INTEGER;

-- Add last contacted field
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_contacted TIMESTAMPTZ;
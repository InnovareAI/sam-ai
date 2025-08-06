-- Insert test campaigns data
INSERT INTO campaigns (
  name,
  description,
  type,
  status,
  start_date,
  end_date,
  channels,
  stats,
  settings
) VALUES 
(
  'Q1 Enterprise Outreach',
  'Targeting enterprise accounts for Q1 growth with personalized LinkedIn and email sequences',
  'Multi-channel',
  'Active',
  '2024-01-15',
  '2024-03-31',
  ARRAY['email', 'linkedin'],
  '{"contacts": 156, "sent": 134, "opened": 89, "replied": 23, "connected": 12, "responseRate": 17.2}'::jsonb,
  '{"followUpDays": 3, "maxAttempts": 5}'::jsonb
),
(
  'Product Launch Campaign',
  'Email campaign for new product announcement to existing customers',
  'Email',
  'Completed',
  '2024-01-01',
  '2024-01-20',
  ARRAY['email'],
  '{"contacts": 2500, "sent": 2500, "opened": 1875, "replied": 125, "responseRate": 5.0}'::jsonb,
  '{"template": "product_launch_v2"}'::jsonb
),
(
  'LinkedIn Networking Drive',
  'Connect with industry leaders and decision makers on LinkedIn',
  'LinkedIn',
  'Active',
  '2024-02-01',
  '2024-04-30',
  ARRAY['linkedin'],
  '{"contacts": 300, "sent": 180, "connected": 72, "replied": 36, "responseRate": 20.0}'::jsonb,
  '{"personalized": true, "autoFollowUp": true}'::jsonb
),
(
  'Cold Outreach - Startups',
  'Targeting startup founders and CTOs for our developer tools',
  'Cold Outreach',
  'Paused',
  '2024-01-10',
  '2024-02-28',
  ARRAY['email', 'linkedin'],
  '{"contacts": 450, "sent": 225, "opened": 112, "replied": 18, "responseRate": 8.0}'::jsonb,
  '{"segment": "startups", "industry": "tech"}'::jsonb
);
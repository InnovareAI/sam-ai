# 🗄️ Database Validation Checklist - Sam AI

## MCP Tool Requirements

### Expected PostgreSQL MCP Tools:
- `mcp__postgres__execute_sql` - Execute SQL queries
- `mcp__postgres__list_tables` - List database tables
- `mcp__postgres__describe_table` - Get table schema

### Alternative: Supabase MCP Tools:
- `mcp__supabase__execute_sql` - Execute SQL on Supabase
- `mcp__supabase__list_tables` - List Supabase tables

## Current Status: 🚨 MCP Tools Not Available
**Issue**: PostgreSQL/Supabase MCP tools not accessible in Claude Code
**Solution Needed**: Restart Claude Desktop after MCP configuration

## Database Validation SQL Queries

### 1. **Connection Test**
```sql
-- Verify database connection and access
SELECT current_database(), current_user, version();

-- Check current schema
SELECT current_schema();
```

### 2. **Multi-Tenant Foundation Check**
```sql
-- Check for core tenant tables
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'organizations',
    'organization_members', 
    'user_profiles',
    'roles'
);

-- Validate organizations table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### 3. **Account Management Tables**
```sql
-- Check for user account tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'linkedin_accounts',
    'email_accounts', 
    'account_usage',
    'account_permissions'
);

-- Validate linkedin_accounts structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'linkedin_accounts'
ORDER BY ordinal_position;
```

### 4. **Campaign System Tables**
```sql
-- Check campaign management tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'campaigns',
    'campaign_sequences',
    'target_audiences',
    'campaign_metrics'
);

-- Validate campaigns table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns'
ORDER BY ordinal_position;
```

### 5. **Lead Management Tables**
```sql
-- Check lead/contact tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'leads',
    'lead_lists',
    'lead_sources',
    'lead_interactions'
);
```

### 6. **Message Documentation Tables**
```sql
-- Check message tracking tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'messages',
    'replies',
    'conversation_threads',
    'message_templates'
);
```

### 7. **Row Level Security Validation**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity, hasrls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 8. **Performance Indexes Check**
```sql
-- Check for multi-tenant indexes
SELECT 
    t.relname AS table_name,
    i.relname AS index_name,
    pg_get_indexdef(i.oid) AS index_definition
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
AND (
    pg_get_indexdef(i.oid) LIKE '%organization_id%'
    OR pg_get_indexdef(i.oid) LIKE '%user_id%'
    OR pg_get_indexdef(i.oid) LIKE '%tenant_id%'
)
ORDER BY t.relname, i.relname;
```

## Expected Database Schema

### **Priority 1: Multi-Tenant Foundation**
```sql
-- organizations (tenant boundary)
CREATE TABLE organizations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    settings jsonb DEFAULT '{}',
    subscription_tier text DEFAULT 'free',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- organization_members (user-tenant relationship)  
CREATE TABLE organization_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL DEFAULT 'member',
    invited_by uuid REFERENCES auth.users(id),
    joined_at timestamptz DEFAULT now(),
    UNIQUE(organization_id, user_id)
);

-- user_profiles (user context)
CREATE TABLE user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text,
    avatar_url text,
    timezone text DEFAULT 'UTC',
    preferences jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

### **Priority 2: Account Management**
```sql
-- linkedin_accounts (user-owned accounts)
CREATE TABLE linkedin_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    account_name text NOT NULL,
    profile_url text,
    connection_count integer DEFAULT 0,
    daily_limit integer DEFAULT 100,
    status text DEFAULT 'active',
    last_activity timestamptz,
    created_at timestamptz DEFAULT now()
);

-- email_accounts (user-owned accounts)
CREATE TABLE email_accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    email_address text NOT NULL,
    provider text, -- 'gmail', 'outlook', 'custom'
    daily_limit integer DEFAULT 500,
    status text DEFAULT 'active',
    last_sync timestamptz,
    created_at timestamptz DEFAULT now()
);
```

### **Priority 3: Campaign System**
```sql
-- campaigns (user-created campaigns)
CREATE TABLE campaigns (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    status text DEFAULT 'draft',
    target_count integer DEFAULT 0,
    daily_limit integer DEFAULT 50,
    working_hours_start time DEFAULT '09:00',
    working_hours_end time DEFAULT '17:00',
    timezone text DEFAULT 'UTC',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- campaign_sequences (message flows)
CREATE TABLE campaign_sequences (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
    step_number integer NOT NULL,
    message_template text NOT NULL,
    delay_days integer DEFAULT 1,
    conditions jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);
```

## Validation Report Template

### **When MCP Tools are Working:**
```markdown
# Database Validation Report - [Date]

## ✅ Connection Status
- [x] Database accessible
- [x] PostgreSQL version: X.X
- [x] Current schema: public

## 🏢 Multi-Tenant Foundation
- [ ] organizations table: MISSING/EXISTS
- [ ] organization_members table: MISSING/EXISTS  
- [ ] user_profiles table: MISSING/EXISTS
- [ ] RLS policies: MISSING/EXISTS

## 📧 Account Management
- [ ] linkedin_accounts table: MISSING/EXISTS
- [ ] email_accounts table: MISSING/EXISTS
- [ ] Account ownership isolation: MISSING/EXISTS

## 📊 Campaign System  
- [ ] campaigns table: MISSING/EXISTS
- [ ] campaign_sequences table: MISSING/EXISTS
- [ ] Performance tracking: MISSING/EXISTS

## 👥 Lead Management
- [ ] leads table: MISSING/EXISTS
- [ ] lead_lists table: MISSING/EXISTS
- [ ] Interaction tracking: MISSING/EXISTS

## 💬 Message Documentation
- [ ] messages table: MISSING/EXISTS
- [ ] replies table: MISSING/EXISTS
- [ ] Conversation threading: MISSING/EXISTS

## 🔒 Security Validation
- [ ] Row Level Security enabled: YES/NO
- [ ] Tenant isolation policies: WORKING/BROKEN
- [ ] User ownership policies: WORKING/BROKEN

## ⚡ Performance Indexes
- [ ] Multi-tenant indexes: EXISTS/MISSING
- [ ] User-scoped indexes: EXISTS/MISSING
- [ ] Query performance: OPTIMAL/NEEDS_WORK

## 🚨 Critical Issues Found
[List any blocking issues]

## 📋 Recommended Actions
[List required fixes in priority order]
```

---

## **Next Steps Once MCP is Working:**

1. **Execute connection test queries**
2. **Run complete schema validation** 
3. **Generate detailed validation report**
4. **Create Lovable briefs for any frontend misalignments**
5. **Provide migration plan for missing components**

**Status**: Ready to execute validation once PostgreSQL MCP tools are accessible after Claude Desktop restart.
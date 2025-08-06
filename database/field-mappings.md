# Frontend to Database Field Mappings

## Overview
This document maintains the critical mapping between frontend UI components and database fields. **MUST BE UPDATED** whenever design changes affect data requirements.

## Current Frontend Components (From Lovable)

### Workspace Architecture
- **WorkspaceSidebar** - Navigation and team context
- **WorkspaceHeader** - User info and mode switching  
- **WorkspaceDashboard** - Main dashboard view

### Conversational Interface
- **ConversationalInterface** - AI chat container
- **ChatHistory** - Message thread display
- **VoiceInterface** - TTS/STT integration
- **MessageFormatter** - Message rendering
- **SamStatusIndicator** - AI agent status

### Dashboard Components
- **AnalyticsChart** - Performance metrics visualization
- **MetricCard** - Key performance indicators

### CRM Pages
- **Accounts** - Account management interface
- **Contacts** - Contact database
- **Campaigns** - Campaign management
- **Templates** - Message templates
- **Requests** - Task/request management

### System Pages
- **Search** - Global search functionality
- **GlobalInbox** - Unified message queue
- **Members** - Team member management
- **Roles** - Permission management
- **WorkspaceSettings** - Configuration

## Required Database Schema (To Be Implemented)

### Core Tables Needed:

#### Users & Authentication
```sql
users (
  id uuid PRIMARY KEY,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamp,
  updated_at timestamp
)
```

#### Multi-Tenant Structure  
```sql
organizations (
  id uuid PRIMARY KEY,
  name text,
  settings jsonb,
  created_at timestamp
)

user_organizations (
  user_id uuid REFERENCES users(id),
  organization_id uuid REFERENCES organizations(id),
  role text,
  PRIMARY KEY (user_id, organization_id)
)
```

#### Campaign Management
```sql
campaigns (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  name text,
  status text,
  target_audience jsonb,
  daily_limit integer,
  working_hours_start time,
  working_hours_end time,
  created_at timestamp
)
```

#### Conversational AI
```sql
conversations (
  id uuid PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id),
  user_id uuid REFERENCES users(id),
  agent_type text,
  status text,
  context jsonb,
  created_at timestamp
)

messages (
  id uuid PRIMARY KEY,
  conversation_id uuid REFERENCES conversations(id),
  role text, -- 'user', 'assistant', 'system'
  content text,
  metadata jsonb,
  created_at timestamp
)
```

## Field Mapping Requirements

### Dashboard Analytics
**Frontend Component**: `AnalyticsChart`
- Performance metrics → `campaigns.analytics` (jsonb)
- Response rates → calculated from `messages` and `replies`
- Conversion data → `campaigns.conversions` (jsonb)

**Frontend Component**: `MetricCard`  
- Total campaigns → `COUNT(campaigns)`
- Active prospects → `COUNT(contacts WHERE status = 'active')`
- Response rate → calculated field
- Revenue → `campaigns.revenue` (decimal)

### Campaign Management
**Frontend Component**: `Campaigns` page
- Campaign list → `campaigns` table
- Status filters → `campaigns.status`
- Performance data → `campaigns.analytics`

### Contact Management
**Frontend Component**: `Contacts` page
- Contact database → `contacts` table
- Interaction history → `interactions` table
- Tagging system → `contact_tags` junction table

### AI Chat Interface
**Frontend Component**: `ConversationalInterface`
- Chat history → `conversations` and `messages` tables
- Agent context → `conversations.context` (jsonb)
- Voice transcripts → `messages.metadata.voice_data`

## Critical Missing Mappings (TO BE DEFINED)

### 🚨 High Priority:
1. **User authentication** - Supabase Auth integration
2. **Organization context** - Multi-tenant data isolation
3. **Real-time subscriptions** - Live updates for chat and notifications
4. **File uploads** - Profile images, attachments, voice recordings

### 🔍 Medium Priority:
1. **Search indexing** - Full-text search across campaigns and contacts
2. **Audit logging** - User activity tracking
3. **Notification system** - Real-time alerts and updates
4. **Integration webhooks** - External service connections

## Update Process

### When Frontend Changes:
1. **Immediate**: Update this mapping document
2. **Required**: Brief any new data requirements
3. **Critical**: Ensure database schema supports all fields
4. **Testing**: Verify data flow end-to-end

### Schema Change Checklist:
- [ ] Update TypeScript interfaces
- [ ] Modify Supabase RLS policies  
- [ ] Test real-time subscriptions
- [ ] Update API endpoint contracts
- [ ] Run data migration scripts
- [ ] Update this mapping document

---

**⚠️ CRITICAL**: This document must be updated BEFORE any design changes are implemented. Missing field mappings will cause deployment failures and broken functionality.
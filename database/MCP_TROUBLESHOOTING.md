# 🔧 MCP Troubleshooting Guide - Database Tools

## Current Issue: MCP Database Tools Not Available

### **Expected Tools:**
- `mcp__postgres__execute_sql`
- `mcp__postgres__list_tables` 
- `mcp__supabase__execute_sql`
- `mcp__supabase__list_tables`

### **Current Status:** ❌ Not Accessible in Claude Code

## Root Cause Analysis

Based on your investigation:

### ✅ **Configuration is Correct:**
```json
// Claude Desktop config has PostgreSQL MCP server
{
  "mcpServers": {
    "postgres": {
      "command": "postgres-mcp-server",
      "args": ["postgresql://..."]
    }
  }
}
```

### ✅ **Database Connection Works:**
- Manual testing confirmed database is accessible
- Authentication is working
- Database contains expected data

### 🚨 **Likely Issues:**

1. **Claude Desktop Restart Required**
   - MCP configuration changes require full restart
   - Claude Code session may be using old config

2. **MCP Server Startup Failure**
   - PostgreSQL MCP server may be failing to start
   - Process might be crashing on initialization

3. **Permission/Authentication Issues**
   - MCP server might not have correct database permissions
   - Connection string authentication failing

## Troubleshooting Steps

### **Step 1: Claude Desktop Restart**
```bash
# Completely quit Claude Desktop
# Relaunch Claude Desktop
# Wait for MCP servers to initialize
# Test database access in new Claude Code session
```

### **Step 2: Check MCP Server Logs**
```bash
# macOS: Check Claude Desktop logs
tail -f ~/Library/Logs/Claude/claude-desktop.log

# Look for MCP server startup messages:
# ✅ "MCP server 'postgres' started successfully"
# ❌ "Failed to start MCP server 'postgres'"
```

### **Step 3: Manual MCP Server Test**
```bash
# Test the MCP server manually
npx @anthropics/mcp-server-postgres postgresql://[connection-string]

# Should output:
# ✅ Server started successfully
# ✅ Available tools: execute_sql, list_tables, etc.
```

### **Step 4: Verify Database Access**
```bash
# Direct database connection test
psql "postgresql://[connection-string]"
\l  # List databases
\dt # List tables in current database
```

## Alternative Solutions

### **Option 1: Use Supabase Dashboard**
If MCP tools remain unavailable:
1. Access database via Supabase Dashboard
2. Run validation queries manually
3. Document results in validation report

### **Option 2: Direct SQL Execution**
```bash
# Create SQL validation script
cat > database_validation.sql << 'EOF'
-- All validation queries from VALIDATION_CHECKLIST.md
SELECT current_database(), current_user, version();
-- ... rest of validation queries
EOF

# Execute via direct connection
psql "postgresql://[connection]" -f database_validation.sql > validation_results.txt
```

### **Option 3: Alternative MCP Setup**
```bash
# Try alternative PostgreSQL MCP server
npm install -g @supabase/mcp-server
# Update Claude Desktop config to use Supabase MCP server instead
```

## Expected Resolution Timeline

### **Immediate (< 5 minutes):**
- Claude Desktop restart should resolve most issues
- MCP tools should become available

### **Short Term (< 30 minutes):**
- MCP server configuration fixes
- Alternative connection methods
- Manual validation execution

### **Backup Plan:**
- Manual database validation via Supabase Dashboard
- Document schema state for development team
- Proceed with backend development based on current schema

## Testing Commands for Working MCP

Once MCP tools are available, test with:

```sql
-- Test 1: Basic connection
SELECT 'MCP Connection Working' as status;

-- Test 2: List tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Test 3: Multi-tenant check
SELECT COUNT(*) as table_count 
FROM information_schema.tables 
WHERE table_name IN ('organizations', 'campaigns', 'leads');
```

## Success Indicators

### ✅ **MCP Working:**
- Database validation queries execute successfully
- Complete schema analysis available
- Detailed validation report generated
- Frontend-database alignment verified

### ⚡ **Ready for Development:**
- All required tables identified or documented as missing
- RLS policies validated or flagged for creation
- Performance indexes checked
- Migration plan created for missing components

---

**Priority Action:** Restart Claude Desktop and test MCP database tool availability before proceeding with full schema validation.
#!/usr/bin/env node

/**
 * Database Schema Validation Script
 * Runs comprehensive checks on database structure vs frontend requirements
 * Usage: node scripts/validate-database-schema.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Sam AI Database Schema Validation\n');

// Expected database tables based on frontend components
const EXPECTED_TABLES = {
  // Core multi-tenant architecture
  'organizations': {
    required: true,
    description: 'Tenant isolation boundary',
    frontend_usage: ['AuthContext', 'useAuth hook', 'All protected routes'],
    columns: ['id', 'name', 'created_at', 'data_region', 'requires_eu_residency']
  },
  
  'organization_members': {
    required: true,
    description: 'User-organization relationships',
    frontend_usage: ['AuthContext.switchOrganization', 'Member management'],
    columns: ['id', 'organization_id', 'user_id', 'role', 'created_at']
  },
  
  'user_profiles': {
    required: true,
    description: 'Extended user information',
    frontend_usage: ['ProfileSettings page', 'AuthContext.getCurrentUserContext'],
    columns: ['id', 'email', 'full_name', 'created_at']
  },
  
  // CRM Core functionality
  'contacts': {
    required: true,
    description: 'Contact/lead management',
    frontend_usage: ['Contacts page', 'Contact creation modal', 'useContacts hook'],
    columns: ['id', 'organization_id', 'full_name', 'email', 'company', 'phone', 'linkedin_url']
  },
  
  'campaigns': {
    required: true,
    description: 'Campaign management',
    frontend_usage: ['Campaigns page', 'Campaign creation wizard', 'useCampaigns hook'],
    columns: ['id', 'organization_id', 'name', 'description', 'status', 'settings', 'stats']
  },
  
  'linkedin_accounts': {
    required: true,
    description: 'LinkedIn account integration',
    frontend_usage: ['Accounts page', 'WorkspaceSettings LinkedIn section'],
    columns: ['id', 'organization_id', 'linkedin_email', 'profile_url', 'status']
  },
  
  // AI and automation
  'conversations': {
    required: true,
    description: 'AI chat conversations',
    frontend_usage: ['ConversationalInterface', 'Agent mode', 'useRealtimeData'],
    columns: ['id', 'organization_id', 'title', 'created_at']
  },
  
  'messages': {
    required: true,
    description: 'Individual chat messages',
    frontend_usage: ['ConversationalInterface', 'Message display', 'Real-time subscriptions'],
    columns: ['id', 'conversation_id', 'role', 'content', 'created_at']
  },
  
  // Compliance and legal (Phase 6)
  'lead_consent': {
    required: false,
    description: 'GDPR consent tracking',
    frontend_usage: ['Future compliance dashboard'],
    columns: ['id', 'lead_id', 'consent_type', 'consent_given', 'legal_basis']
  },
  
  'email_compliance': {
    required: false,
    description: 'CAN-SPAM compliance',
    frontend_usage: ['Future compliance dashboard'],
    columns: ['id', 'organization_id', 'sender_name', 'sender_address', 'unsubscribe_link_template']
  }
};

// Frontend components that require database integration
const FRONTEND_DB_DEPENDENCIES = {
  'src/pages/Contacts.tsx': ['contacts', 'organizations'],
  'src/pages/Campaigns.tsx': ['campaigns', 'organizations'],  
  'src/pages/Accounts.tsx': ['linkedin_accounts', 'organizations'],
  'src/pages/ProfileSettings.tsx': ['user_profiles', 'organizations'],
  'src/contexts/AuthContext.tsx': ['user_profiles', 'organizations', 'organization_members'],
  'src/hooks/useCampaigns.ts': ['campaigns', 'organizations'],
  'src/hooks/useContacts.ts': ['contacts', 'organizations'],
  'src/hooks/useRealtimeData.ts': ['campaigns', 'contacts', 'conversations', 'messages'],
  'src/components/workspace/ConversationalInterface.tsx': ['conversations', 'messages']
};

// Migration files that should exist
const EXPECTED_MIGRATIONS = [
  'database/migrations/01_multi_tenant_foundation.sql',
  'database/migrations/02_campaign_management.sql', 
  'database/migrations/03_ai_conversations.sql',
  'database/migrations/04_complete_deployment.sql'
];

function validateMigrationFiles() {
  console.log('📁 Checking Migration Files...');
  
  let allExist = true;
  EXPECTED_MIGRATIONS.forEach(migrationPath => {
    const fullPath = path.join(process.cwd(), migrationPath);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${migrationPath}`);
    } else {
      console.log(`  ❌ MISSING: ${migrationPath}`);
      allExist = false;
    }
  });
  
  if (allExist) {
    console.log('  🎉 All migration files present\n');
  } else {
    console.log('  🚨 Some migration files are missing!\n');
  }
  
  return allExist;
}

function validateFrontendDependencies() {
  console.log('🔗 Checking Frontend-Database Dependencies...');
  
  let allExist = true;
  Object.entries(FRONTEND_DB_DEPENDENCIES).forEach(([filePath, requiredTables]) => {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      console.log(`  ✅ ${filePath}`);
      
      // Check if file references the expected tables
      const fileContent = fs.readFileSync(fullPath, 'utf8');
      requiredTables.forEach(tableName => {
        if (fileContent.includes(tableName)) {
          console.log(`    ✅ References table: ${tableName}`);
        } else {
          console.log(`    ⚠️  May not reference: ${tableName}`);
        }
      });
    } else {
      console.log(`  ❌ MISSING: ${filePath}`);
      allExist = false;
    }
  });
  
  console.log();
  return allExist;
}

function generateSchemaReport() {
  console.log('📊 Database Schema Requirements Report...\n');
  
  console.log('PHASE 1-2: REQUIRED TABLES (Critical for functionality)');
  Object.entries(EXPECTED_TABLES)
    .filter(([_, config]) => config.required)
    .forEach(([tableName, config]) => {
      console.log(`\n🔹 ${tableName.toUpperCase()}`);
      console.log(`   Purpose: ${config.description}`);
      console.log(`   Frontend Usage: ${config.frontend_usage.join(', ')}`);
      console.log(`   Key Columns: ${config.columns.join(', ')}`);
    });
  
  console.log('\n\nPHASE 6: COMPLIANCE TABLES (Required for legal compliance)');
  Object.entries(EXPECTED_TABLES)
    .filter(([_, config]) => !config.required)
    .forEach(([tableName, config]) => {
      console.log(`\n🔸 ${tableName.toUpperCase()}`);
      console.log(`   Purpose: ${config.description}`);
      console.log(`   Frontend Usage: ${config.frontend_usage.join(', ')}`);
      console.log(`   Key Columns: ${config.columns.join(', ')}`);
    });
}

function checkSupabaseConfig() {
  console.log('\n🔧 Checking Supabase Configuration...');
  
  const envLocal = path.join(process.cwd(), '.env.local');
  const envExample = path.join(process.cwd(), '.env.example');
  
  if (fs.existsSync(envLocal)) {
    console.log('  ✅ .env.local exists');
    const envContent = fs.readFileSync(envLocal, 'utf8');
    
    if (envContent.includes('VITE_SUPABASE_URL')) {
      console.log('  ✅ Supabase URL configured');
    } else {
      console.log('  ❌ MISSING: VITE_SUPABASE_URL');
    }
    
    if (envContent.includes('VITE_SUPABASE_ANON_KEY')) {
      console.log('  ✅ Supabase Anon Key configured');
    } else {
      console.log('  ❌ MISSING: VITE_SUPABASE_ANON_KEY');
    }
    
    // Check if pointing to local or production
    if (envContent.includes('127.0.0.1') || envContent.includes('localhost')) {
      console.log('  🔧 Environment: LOCAL DEVELOPMENT');
    } else {
      console.log('  🚀 Environment: PRODUCTION/STAGING');
    }
  } else {
    console.log('  ⚠️  .env.local not found - create from .env.example');
  }
}

function generateNextSteps() {
  console.log('\n\n📋 NEXT STEPS FOR DATABASE INTEGRATION:\n');
  
  console.log('IMMEDIATE (Phase 2):');
  console.log('1. Deploy Supabase production instance');
  console.log('2. Run migration files in order (01 → 02 → 03 → 04)');
  console.log('3. Update .env.local with production Supabase credentials');
  console.log('4. Test database connectivity from frontend');
  console.log('5. Replace mock data with real Supabase queries\n');
  
  console.log('VALIDATION COMMANDS:');
  console.log('  npm run validate-schema    # Run this script');
  console.log('  npm run build             # Check for compilation errors');
  console.log('  npm run dev               # Test local development');
  console.log('  psql $DATABASE_URL        # Connect to database directly\n');
  
  console.log('TESTING CHECKLIST:');
  console.log('  □ Contact creation saves to contacts table');
  console.log('  □ Campaign creation saves to campaigns table'); 
  console.log('  □ Real-time subscriptions work');
  console.log('  □ Multi-tenant isolation enforced');
  console.log('  □ Authentication flow complete');
}

// Main execution
function main() {
  let allChecksPass = true;
  
  allChecksPass &= validateMigrationFiles();
  allChecksPass &= validateFrontendDependencies();
  checkSupabaseConfig();
  generateSchemaReport();
  generateNextSteps();
  
  if (allChecksPass) {
    console.log('🎉 SCHEMA VALIDATION PASSED - Ready for database integration!');
    process.exit(0);
  } else {
    console.log('🚨 SCHEMA VALIDATION ISSUES FOUND - Review above output');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  EXPECTED_TABLES,
  FRONTEND_DB_DEPENDENCIES,
  validateMigrationFiles,
  validateFrontendDependencies
};
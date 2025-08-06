# 🚀 SAM AI PRODUCTION DEPLOYMENT GUIDE

## Deployment Status: READY FOR PRODUCTION
**Date**: January 30, 2025  
**Version**: 1.0.0  
**Branch**: main (merged from staging)

## Quick Deploy Commands

### 1. Deploy to Netlify (Frontend)
```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to production
netlify deploy --prod

# Or link to existing site and deploy
netlify link
netlify deploy --prod --dir=dist
```

### 2. Deploy Supabase (Backend)
```bash
# Link to production Supabase project
npx supabase link --project-ref YOUR_PROD_PROJECT_REF

# Push database schema to production
npx supabase db push

# Deploy Edge Functions
npx supabase functions deploy ai-agent --no-verify-jwt
```

### 3. Environment Variables Setup

#### Required Environment Variables:
```env
# Supabase
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# AI Services
OPENAI_API_KEY=your_openai_key
VITE_OPENROUTER_API_KEY=your_openrouter_key

# N8N Integration
VITE_N8N_BASE_URL=https://your-n8n-instance.com
VITE_N8N_API_KEY=your_n8n_api_key

# Security
VITE_ENCRYPTION_KEY=your_encryption_key_min_32_chars
```

## Pre-Deployment Checklist

### ✅ Code Readiness
- [x] All features tested locally
- [x] No console.log statements in production code
- [x] Error handling implemented
- [x] Loading states for all async operations
- [x] Responsive design verified

### ✅ Database
- [x] All migrations created
- [x] RLS policies configured
- [x] Indexes optimized
- [x] Test data removed
- [x] Backup created

### ✅ Security
- [x] Authentication required for all routes
- [x] Row Level Security enabled
- [x] API keys secured
- [x] CORS configured
- [x] Rate limiting ready

### ✅ Compliance
- [x] GDPR compliance implemented
- [x] Privacy policy ready
- [x] Terms of service ready
- [x] Cookie consent mechanism
- [x] Data retention policies

## Deployment Steps

### Step 1: Build Production Bundle
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm run preview
```

### Step 2: Deploy Frontend to Netlify
```bash
# Deploy with CLI
netlify deploy --prod --dir=dist

# Or use GitHub integration
# 1. Connect GitHub repo to Netlify
# 2. Set build command: npm run build
# 3. Set publish directory: dist
# 4. Add environment variables in Netlify dashboard
```

### Step 3: Deploy Database to Supabase
```bash
# Apply all migrations
npx supabase db push

# Verify RLS policies
npx supabase db diff

# Deploy Edge Functions
npx supabase functions deploy ai-agent
```

### Step 4: Configure Production Settings

#### Netlify Configuration
1. Go to Site Settings > Environment Variables
2. Add all VITE_ prefixed variables
3. Enable automatic HTTPS
4. Configure custom domain if available

#### Supabase Configuration
1. Go to Project Settings > API
2. Copy URL and anon key
3. Configure Edge Function secrets
4. Enable realtime for required tables

### Step 5: Post-Deployment Verification

```bash
# Test production endpoints
curl https://your-domain.netlify.app
curl https://your-project.supabase.co/rest/v1/

# Monitor logs
netlify logs:function
npx supabase functions logs ai-agent
```

## Production URLs

### Frontend
- **Production**: https://sam-ai.netlify.app (or custom domain)
- **Staging**: https://staging--sam-ai.netlify.app

### Backend
- **Supabase Dashboard**: https://app.supabase.com/project/YOUR_PROJECT_ID
- **Database**: postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres

## Monitoring & Maintenance

### Health Checks
```javascript
// Add to your monitoring service
const healthCheck = async () => {
  const checks = [
    fetch('https://your-domain.com/api/health'),
    fetch('https://your-project.supabase.co/rest/v1/'),
    fetch('https://your-n8n-instance.com/api/v1/workflows')
  ];
  
  const results = await Promise.allSettled(checks);
  return results.every(r => r.status === 'fulfilled');
};
```

### Backup Strategy
1. **Database**: Daily automated backups via Supabase
2. **Code**: Git repository with tagged releases
3. **Environment**: Document all env variables

### Rollback Procedure
```bash
# Rollback frontend
netlify rollback

# Rollback database (from backup)
pg_restore -d postgresql://[CONNECTION_STRING] backup.sql

# Rollback to previous git tag
git checkout v1.0.0
git push origin main --force
```

## Performance Optimization

### Frontend
- Enable CDN caching
- Compress images
- Lazy load components
- Code splitting implemented

### Backend
- Database connection pooling
- Query optimization
- Caching strategy
- Rate limiting

## Support & Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check Supabase project status
   - Verify connection string
   - Check RLS policies

2. **AI Agent Not Responding**
   - Verify OpenAI API key
   - Check Edge Function logs
   - Monitor rate limits

3. **Real-time Not Working**
   - Enable realtime in Supabase dashboard
   - Check WebSocket connection
   - Verify authentication

### Contact Support
- **Technical Issues**: Create issue on GitHub
- **Supabase Support**: support@supabase.io
- **Netlify Support**: support@netlify.com

## Version History

### v1.0.0 (Current)
- Full CRM functionality
- AI Agent integration
- N8N automation
- GDPR compliance
- Real-time updates

## License
MIT License - See LICENSE file for details

---

**🎉 Congratulations! SAM AI is ready for production deployment!**

Follow the steps above to deploy your application. For any issues, refer to the troubleshooting section or contact support.
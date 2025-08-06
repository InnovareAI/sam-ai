# 🌿 Branch Setup Guide - Sam AI

## Branch Structure

### Main Branch (`main`)
- **Purpose**: Production-ready code
- **Protection**: Protected, requires PR approval
- **Deployment**: Auto-deploys to production

### Staging Branch (`staging`)
- **Purpose**: Development and testing
- **Protection**: Open for direct commits
- **Deployment**: Auto-deploys to staging environment

## 🔧 Workflow

### For Development Updates:
```bash
# Always work on staging branch
git checkout staging

# Make your changes
# ... edit files ...

# Commit and push to staging
git add .
git commit -m "your changes"
git push origin staging
```

### For Production Releases:
```bash
# Create PR from staging to main
gh pr create --base main --head staging --title "Release: [Description]"
```

## 🛡️ Branch Protection Setup

**Manual Setup Required** (GitHub Web Interface):

1. Go to: https://github.com/InnovareAI/sam-ai/settings/branches
2. Click "Add rule" for `main` branch
3. Configure:
   - ✅ Require a pull request before merging
   - ✅ Require approvals (1)
   - ✅ Dismiss stale PR approvals when new commits are pushed
   - ✅ Require branches to be up to date before merging

## 🚀 Netlify Deployment Setup

### Production (main branch):
- Site name: `sam-ai-prod` 
- Branch: `main`
- URL: `https://sam-ai-prod.netlify.app`

### Staging (staging branch):
- Site name: `sam-ai-staging`
- Branch: `staging` 
- URL: `https://sam-ai-staging.netlify.app`

---

**🎯 Result**: All updates go to staging first, then PR to main for production deployment.
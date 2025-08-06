# 🚀 Netlify Setup Instructions

## Manual Netlify Connection Required

The Netlify CLI is experiencing technical issues. Please follow these steps to connect manually:

### Steps to Connect to Netlify:

1. **Visit Netlify Dashboard**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Log in to your InnovareAI account

2. **Add New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose "Deploy with GitHub"

3. **Connect Repository**
   - Select: `InnovareAI/sam-ai`
   - Repository URL: https://github.com/InnovareAI/sam-ai

4. **Build Settings (Auto-detected)**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - These settings will be auto-detected from `netlify.toml`

5. **Deploy Site**
   - Click "Deploy site"
   - Your site will be available at: `https://[random-name].netlify.app`

### Expected Result:
- ✅ Live site displaying the Sam AI landing page
- ✅ Auto-deployment on GitHub pushes
- ✅ HTTPS enabled by default

### Alternative: Use Netlify Drop
If GitHub connection fails:
1. Run `npm run build` locally (when package.json is added)
2. Drag the `dist` folder to [netlify.com/drop](https://netlify.com/drop)

---

**Once connected, the site URL will be added to the README and conversation log.**
# FlowDownloader Hosting & Domain Setup Guide

## 🚀 GitHub Repository Status
✅ **Connected Successfully!**
- Repository: https://github.com/khmerfun9-dev/FlowDownloader.git
- Branch: main
- Status: All files pushed and synced

## 🌐 Website Hosting Options

### Option 1: Vercel (Recommended)

#### Quick Deploy
1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `khmerfun9-dev/FlowDownloader`
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Environment Variables
Add these in Vercel dashboard:
```
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Option 2: Netlify

#### Quick Deploy
1. Visit [netlify.com](https://netlify.com)
2. Connect GitHub account
3. Select `FlowDownloader` repository
4. Configure:
   - **Base directory**: `web`
   - **Build command**: `npm run build`
   - **Publish directory**: `web/dist`

### Option 3: GitHub Pages

#### Setup GitHub Actions
1. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd web && npm install
      - name: Build
        run: cd web && npm run build
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./web/dist
```

## 🔗 Custom Domain Connection

### For Vercel:
1. Go to Project Settings → Domains
2. Add your domain (e.g., `flowdownloader.com`)
3. Configure DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### For Netlify:
1. Go to Site Settings → Domain Management
2. Add custom domain
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

### For GitHub Pages:
1. Go to Repository Settings → Pages
2. Add custom domain in "Custom domain" field
3. Create `CNAME` file in `web/public/`:
   ```
   flowdownloader.com
   ```

## 🖥️ Backend Hosting

### Option 1: Railway
1. Visit [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select `backend` folder
4. Add environment variables
5. Deploy automatically

### Option 2: Vercel Functions
1. Create `api/` folder in root
2. Move backend files to `api/`
3. Configure `vercel.json`:
```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Update environment variables for production
- [ ] Test build locally: `npm run build`
- [ ] Verify all API endpoints
- [ ] Check Firebase configuration
- [ ] Test Stripe integration

### Post-Deployment
- [ ] Verify website loads correctly
- [ ] Test download functionality
- [ ] Check mobile responsiveness
- [ ] Verify SSL certificate
- [ ] Test custom domain
- [ ] Monitor performance

## 🔧 Production Environment Variables

### Frontend (.env.production)
```env
VITE_ENVIRONMENT=production
VITE_API_URL=https://api.flowdownloader.com
VITE_APP_URL=https://flowdownloader.com
VITE_FIREBASE_API_KEY=your_production_key
VITE_FIREBASE_AUTH_DOMAIN=flowdownloader.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=flowdownloader
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Backend
```env
NODE_ENV=production
PORT=3000
FIREBASE_PROJECT_ID=flowdownloader
STRIPE_SECRET_KEY=sk_live_...
JWT_SECRET=your_production_secret
CORS_ORIGIN=https://flowdownloader.com
```

## 🚀 Quick Start Commands

```bash
# Build for production
cd web && npm run build

# Preview production build
cd web && npm run preview

# Deploy to Vercel (with CLI)
npx vercel --prod

# Deploy to Netlify (with CLI)
netlify deploy --prod --dir=web/dist
```

## 📊 Performance Optimization

- ✅ Code splitting implemented
- ✅ Asset optimization enabled
- ✅ Gzip compression ready
- ✅ CDN-friendly build
- ✅ Progressive Web App features

## 🔒 Security Features

- HTTPS enforcement
- Content Security Policy headers
- XSS protection
- CSRF protection
- Secure authentication flow

---

**Next Steps:**
1. Choose your hosting platform
2. Configure environment variables
3. Set up custom domain
4. Deploy and test
5. Monitor performance

Need help with any specific step? Let me know!
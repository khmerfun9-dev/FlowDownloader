# Vercel Deployment & Domain Setup Guide

## 🚀 Quick Vercel Deployment

### Step 1: Connect GitHub Repository

1. **Visit Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub account
   - Click "New Project"

2. **Import Repository**
   - Search for `khmerfun9-dev/FlowDownloader`
   - Click "Import"
   - Select the repository

3. **Configure Project Settings**
   ```
   Project Name: flowdownloader
   Framework Preset: Vite
   Root Directory: web
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

### Step 2: Environment Variables Setup

Add these in Vercel Project Settings → Environment Variables:

```env
# Production Environment
VITE_ENVIRONMENT=production

# API Configuration
VITE_API_URL=https://your-backend-url.railway.app

# App Configuration
VITE_APP_URL=https://flowdownloader.com
VITE_APP_NAME=FlowDownloader
VITE_APP_VERSION=1.0.0

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_MODE=true

# Performance Settings
VITE_ENABLE_COMPRESSION=true
VITE_ENABLE_LAZY_LOADING=true
```

### Step 3: Deploy

1. **Automatic Deployment**
   - Vercel will automatically deploy from your `main` branch
   - Every push to `main` triggers a new deployment
   - Preview deployments for pull requests

2. **Manual Deployment (CLI)**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy
   cd web
   vercel --prod
   ```

---

## 🌐 Custom Domain Setup

### Option 1: Purchase Domain through Vercel

1. **Buy Domain**
   - Go to Project Settings → Domains
   - Click "Buy a domain"
   - Search and purchase your domain
   - Vercel handles all DNS automatically

### Option 2: Use External Domain Provider

#### For Namecheap, GoDaddy, or other providers:

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Click "Add Domain"
   - Enter your domain: `flowdownloader.com`
   - Click "Add"

2. **Configure DNS Records**
   
   **For Root Domain (flowdownloader.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.19.61
   TTL: 3600
   ```
   
   **For WWW Subdomain (www.flowdownloader.com):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

3. **Verify Domain**
   - Wait 24-48 hours for DNS propagation
   - Vercel will automatically issue SSL certificate
   - Check domain status in Vercel dashboard

### Option 3: Cloudflare Integration

1. **Add Site to Cloudflare**
   - Sign up at [cloudflare.com](https://cloudflare.com)
   - Add your domain
   - Update nameservers at your domain provider

2. **Configure DNS in Cloudflare**
   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   Proxy: Enabled (Orange Cloud)
   
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   Proxy: Enabled (Orange Cloud)
   ```

3. **SSL/TLS Settings**
   - Set SSL/TLS encryption mode to "Full (strict)"
   - Enable "Always Use HTTPS"
   - Configure HSTS if needed

---

## ⚡ Advanced Vercel Configuration

### Performance Optimization

Update `vercel.json` for optimal performance:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*\\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot))",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)\\.(html|json)",
      "headers": {
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/web/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://*.firebase.com https://*.googleapis.com;"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/web/index.html"
    }
  ]
}
```

### Environment-Specific Deployments

1. **Production Branch**
   - `main` branch → Production deployment
   - Custom domain: `flowdownloader.com`

2. **Staging Branch**
   - `staging` branch → Staging deployment
   - Vercel subdomain: `flowdownloader-staging.vercel.app`

3. **Preview Deployments**
   - All pull requests get preview URLs
   - Perfect for testing before merge

---

## 🔧 Deployment Automation

### GitHub Actions Integration

Create `.github/workflows/vercel-deploy.yml`:

```yaml
name: Vercel Production Deployment

env:
  VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
  VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}

on:
  push:
    branches:
      - main

jobs:
  Deploy-Production:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      
      - name: Install Vercel CLI
        run: npm install --global vercel@latest
      
      - name: Pull Vercel Environment Information
        run: vercel pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Build Project Artifacts
        run: vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
      
      - name: Deploy Project Artifacts to Vercel
        run: vercel deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### Required GitHub Secrets

Add these in GitHub Repository Settings → Secrets:

```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_org_id
VERCEL_PROJECT_ID=your_project_id
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics

1. **Enable Analytics**
   - Go to Project Settings → Analytics
   - Enable Web Analytics
   - Add analytics script to your app

2. **Performance Monitoring**
   - Core Web Vitals tracking
   - Real User Monitoring (RUM)
   - Performance insights

### Custom Monitoring

Add to your `web/src/main.jsx`:

```javascript
import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';

// Enable Vercel Analytics
inject();

// Enable Speed Insights
injectSpeedInsights();
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Check build logs in Vercel dashboard
   # Common fixes:
   - Ensure all dependencies in package.json
   - Check environment variables
   - Verify build command
   ```

2. **Domain Not Working**
   ```bash
   # Check DNS propagation
   nslookup flowdownloader.com
   
   # Verify DNS records
   dig flowdownloader.com
   ```

3. **SSL Certificate Issues**
   - Wait 24-48 hours for automatic SSL
   - Check domain verification status
   - Ensure DNS records are correct

4. **Environment Variables**
   - Redeploy after adding new variables
   - Check variable names (case-sensitive)
   - Verify values don't have extra spaces

### Debug Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Test local build
cd web && npm run build && npm run preview

# Check domain status
vercel domains ls
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Repository connected to Vercel
- [ ] Environment variables configured
- [ ] Build settings verified
- [ ] Domain purchased/configured
- [ ] DNS records updated

### Post-Deployment
- [ ] Website loads at custom domain
- [ ] SSL certificate active (https://)
- [ ] All pages accessible
- [ ] API endpoints working
- [ ] Analytics tracking enabled
- [ ] Performance optimized

### Production Readiness
- [ ] Error monitoring setup
- [ ] Backup strategy in place
- [ ] CDN configuration optimized
- [ ] Security headers configured
- [ ] SEO optimization complete

---

## 🎯 Next Steps

1. **Deploy to Vercel** using the GitHub integration
2. **Configure custom domain** with your DNS provider
3. **Set up environment variables** for production
4. **Enable analytics** and monitoring
5. **Test thoroughly** across all devices
6. **Monitor performance** and optimize as needed

**Your FlowDownloader website will be live at your custom domain with global CDN, automatic SSL, and enterprise-grade performance!**

---

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Domain Configuration Guide](https://vercel.com/docs/concepts/projects/domains)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Performance Optimization](https://vercel.com/docs/concepts/edge-network/overview)

Need help with any step? The configuration is ready to deploy!
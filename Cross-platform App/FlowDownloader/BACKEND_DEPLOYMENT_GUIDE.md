# FlowDownloader Backend Deployment Guide

## 🚀 Backend Deployment Options

### Option 1: Railway (Recommended for Node.js Backend)

#### Prerequisites
- GitHub repository connected
- Railway account (free tier available)
- Backend code in `/backend` directory

#### Step-by-Step Railway Deployment

1. **Sign Up & Connect**
   ```bash
   # Visit https://railway.app
   # Sign in with GitHub
   # Click "New Project" → "Deploy from GitHub repo"
   ```

2. **Project Configuration**
   - Select `khmerfun9-dev/FlowDownloader` repository
   - Choose "Deploy from a folder" → Select `backend`
   - Railway will auto-detect Node.js

3. **Environment Variables Setup**
   Go to Project → Variables tab and add:
   ```env
   NODE_ENV=production
   PORT=3000
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   STRIPE_SECRET_KEY=sk_live_...
   JWT_SECRET=your_super_secret_jwt_key_here
   CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. **Deploy Configuration**
   Create `railway.json` in backend folder:
   ```json
   {
     "build": {
       "builder": "NIXPACKS"
     },
     "deploy": {
       "startCommand": "npm start",
       "restartPolicyType": "ON_FAILURE",
       "restartPolicyMaxRetries": 10
     }
   }
   ```

5. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add custom domain: `api.flowdownloader.com`
   - Configure DNS CNAME record

#### Railway CLI Deployment (Alternative)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init

# Deploy
railway up
```

---

### Option 2: Vercel Functions

#### Prerequisites
- Vercel account
- Backend code restructured for serverless

#### Step-by-Step Vercel Functions Setup

1. **Restructure Backend for Serverless**
   Create `api/` folder in project root:
   ```
   FlowDownloader/
   ├── api/
   │   ├── auth/
   │   │   ├── login.js
   │   │   ├── register.js
   │   │   └── verify.js
   │   ├── download/
   │   │   ├── start.js
   │   │   ├── status.js
   │   │   └── history.js
   │   ├── payment/
   │   │   ├── create-session.js
   │   │   └── webhook.js
   │   └── utils/
   │       ├── firebase.js
   │       └── middleware.js
   ```

2. **Convert Express Routes to Vercel Functions**
   Example: `api/auth/login.js`
   ```javascript
   import { initializeApp } from 'firebase-admin/app';
   import { getAuth } from 'firebase-admin/auth';
   import jwt from 'jsonwebtoken';
   
   export default async function handler(req, res) {
     // Enable CORS
     res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*');
     res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
   
     if (req.method === 'OPTIONS') {
       return res.status(200).end();
     }
   
     if (req.method !== 'POST') {
       return res.status(405).json({ error: 'Method not allowed' });
     }
   
     try {
       const { email, password } = req.body;
       
       // Your authentication logic here
       const user = await authenticateUser(email, password);
       
       const token = jwt.sign(
         { uid: user.uid, email: user.email },
         process.env.JWT_SECRET,
         { expiresIn: '24h' }
       );
   
       res.status(200).json({ token, user });
     } catch (error) {
       res.status(401).json({ error: error.message });
     }
   }
   ```

3. **Configure Vercel**
   Create `vercel.json` in project root:
   ```json
   {
     "functions": {
       "api/**/*.js": {
         "runtime": "nodejs18.x",
         "maxDuration": 30
       }
     },
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       }
     ],
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Access-Control-Allow-Origin",
             "value": "*"
           },
           {
             "key": "Access-Control-Allow-Methods",
             "value": "GET, POST, PUT, DELETE, OPTIONS"
           },
           {
             "key": "Access-Control-Allow-Headers",
             "value": "Content-Type, Authorization"
           }
         ]
       }
     ]
   }
   ```

4. **Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all backend environment variables
   - Ensure `NODE_ENV=production`

5. **Deploy to Vercel**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

---

## 🔧 Database Setup (Firebase)

### 1. Create Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init
```

### 2. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Download history
    match /downloads/{downloadId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Public app settings
    match /settings/{document} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### 3. Firebase Functions (Optional)
```javascript
// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.processDownload = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  // Process download logic
  const { url, format, quality } = data;
  
  try {
    // Your download processing logic
    return { success: true, downloadId: 'generated-id' };
  } catch (error) {
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

---

## 🌐 Frontend Configuration Update

Update `web/.env.production`:
```env
# For Railway deployment
VITE_API_URL=https://your-app-name.railway.app

# For Vercel Functions
VITE_API_URL=https://your-vercel-app.vercel.app/api

# Common settings
VITE_ENVIRONMENT=production
VITE_APP_URL=https://flowdownloader.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Firebase project created and configured
- [ ] Stripe keys updated for production
- [ ] CORS origins set correctly
- [ ] Database security rules deployed
- [ ] SSL certificates ready

### Railway Specific
- [ ] `railway.json` configured
- [ ] Custom domain added (optional)
- [ ] Health check endpoint working
- [ ] Logs monitoring setup

### Vercel Functions Specific
- [ ] Backend restructured for serverless
- [ ] `vercel.json` configured
- [ ] Function timeouts optimized
- [ ] Cold start performance tested

### Post-Deployment
- [ ] API endpoints responding correctly
- [ ] Authentication flow working
- [ ] Download functionality tested
- [ ] Payment processing verified
- [ ] Error logging configured
- [ ] Performance monitoring setup

---

## 🔍 Testing Your Deployment

### Health Check Endpoint
```javascript
// For Railway: backend/routes/health.js
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version
  });
});

// For Vercel: api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
```

### Test Commands
```bash
# Test health endpoint
curl https://your-backend-url.com/health

# Test authentication
curl -X POST https://your-backend-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Test download endpoint
curl -X POST https://your-backend-url.com/api/download/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/video","format":"mp4"}'
```

---

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify `CORS_ORIGIN` environment variable
   - Check frontend URL matches exactly
   - Ensure preflight OPTIONS requests handled

2. **Firebase Connection Issues**
   - Verify service account key format
   - Check Firebase project ID
   - Ensure Firestore rules allow access

3. **Environment Variables**
   - Double-check all required variables set
   - Verify no trailing spaces or quotes
   - Restart deployment after changes

4. **Function Timeouts (Vercel)**
   - Optimize heavy operations
   - Consider upgrading to Pro plan for longer timeouts
   - Implement proper error handling

### Monitoring & Logs

**Railway:**
- View logs in Railway dashboard
- Set up log alerts
- Monitor resource usage

**Vercel:**
- Check function logs in Vercel dashboard
- Monitor function execution time
- Set up error tracking with Sentry

---

## 🎯 Next Steps

1. **Choose your deployment method** (Railway recommended for full backend)
2. **Set up environment variables** in your chosen platform
3. **Deploy and test** all API endpoints
4. **Update frontend** with production API URL
5. **Monitor performance** and set up alerts
6. **Scale as needed** based on usage

Need help with any specific step? Let me know!
# FlowDownloader Database Setup & Integration Guide

This guide explains how to set up the Firebase database and connect it to the web application, desktop program, and mobile app for customer account management and payment processing.

## Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [Database Schema](#database-schema)
3. [Web Application Integration](#web-application-integration)
4. [Desktop Application Integration](#desktop-application-integration)
5. [Mobile Application Integration](#mobile-application-integration)
6. [Payment Integration](#payment-integration)
7. [Environment Configuration](#environment-configuration)
8. [Testing the Integration](#testing-the-integration)
9. [Deployment](#deployment)

## Firebase Project Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `flowdownloader-project`
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Save changes

### 3. Create Firestore Database
1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select location closest to your users
5. Click "Done"

### 4. Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Web" icon to add web app
4. Register app with name "FlowDownloader Web"
5. Copy the configuration object

## Database Schema

The application uses the following Firestore collections:

### Users Collection (`users`)
```javascript
{
  uid: "user_unique_id",
  email: "user@example.com",
  displayName: "User Name",
  createdAt: "2024-01-01T00:00:00.000Z",
  licenseType: "free" | "premium" | "pro",
  downloadCount: 0,
  maxDownloads: 10,
  stripeCustomerId: "cus_xxxxx" // Optional
}
```

### Licenses Collection (`licenses`)
```javascript
{
  id: "license_id",
  name: "Premium Plan",
  price: 9.99,
  maxDownloads: 100,
  features: ["HD Downloads", "Batch Processing"],
  stripePriceId: "price_xxxxx"
}
```

### Payments Collection (`payments`)
```javascript
{
  id: "payment_id",
  userId: "user_id",
  amount: 9.99,
  currency: "usd",
  status: "succeeded",
  paymentMethod: "stripe" | "paypal",
  licenseType: "premium",
  createdAt: "2024-01-01T00:00:00.000Z",
  stripePaymentIntentId: "pi_xxxxx"
}
```

## Web Application Integration

### 1. Update Firebase Configuration
Update `web/src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "flowdownloader-project.firebaseapp.com",
  projectId: "flowdownloader-project",
  storageBucket: "flowdownloader-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 2. Environment Variables
Create `web/.env`:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=flowdownloader-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=flowdownloader-project
VITE_FIREBASE_STORAGE_BUCKET=flowdownloader-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

## Desktop Application Integration

### 1. Update Firebase Configuration
Update `desktop/config/app-config.json`:

```json
{
  "firebase": {
    "apiKey": "your-api-key",
    "authDomain": "flowdownloader-project.firebaseapp.com",
    "projectId": "flowdownloader-project",
    "storageBucket": "flowdownloader-project.appspot.com",
    "messagingSenderId": "123456789012",
    "appId": "your-app-id"
  }
}
```

### 2. Install Dependencies
```bash
cd desktop
npm install firebase
```

## Mobile Application Integration

### 1. Update Firebase Configuration
Update `mobile/config/firebase.js` with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "flowdownloader-project.firebaseapp.com",
  projectId: "flowdownloader-project",
  storageBucket: "flowdownloader-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

### 2. Dependencies Already Installed
The mobile app now includes:
- `firebase` - Firebase SDK
- Authentication context and screens
- Profile management

## Payment Integration

### 1. Stripe Setup
1. Create [Stripe account](https://stripe.com/)
2. Get API keys from Stripe Dashboard
3. Create products and prices in Stripe

### 2. Backend Environment Variables
Update `backend/.env`:

```env
# Firebase
FIREBASE_PROJECT_ID=flowdownloader-project
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@flowdownloader-project.iam.gserviceaccount.com

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox

# JWT
JWT_SECRET=your-jwt-secret-key

# Server
PORT=3001
NODE_ENV=development
```

### 3. Frontend Environment Variables
Update web app `.env`:

```env
# Add Stripe publishable key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_PAYPAL_CLIENT_ID=your-paypal-client-id
```

## Environment Configuration

### Development Setup
1. **Backend**: Copy `.env.example` to `.env` and fill in values
2. **Web**: Copy `.env.example` to `.env` and fill in values
3. **Desktop**: Update `config/app-config.json`
4. **Mobile**: Update `config/firebase.js`

### Production Setup
1. Use environment-specific Firebase projects
2. Set production Stripe keys
3. Configure proper CORS settings
4. Set up SSL certificates

## Testing the Integration

### 1. Start All Services
```bash
# Backend
cd backend
npm run dev

# Web
cd web
npm run dev

# Desktop
cd desktop
npm start

# Mobile
cd mobile
npm start
```

### 2. Test Authentication Flow
1. **Web App**: Visit http://localhost:5173
2. **Desktop**: Launch the desktop app
3. **Mobile**: Use Expo Go app

### 3. Test User Registration
1. Create new account in any app
2. Verify user appears in Firebase Console
3. Check user data synchronization

### 4. Test Login/Logout
1. Login with same credentials across apps
2. Verify user state synchronization
3. Test logout functionality

### 5. Test Payment Flow
1. Attempt to upgrade account
2. Use Stripe test cards:
   - Success: `4242424242424242`
   - Decline: `4000000000000002`
3. Verify payment records in Firebase

## Deployment

### 1. Firebase Security Rules
Update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read licenses
    match /licenses/{licenseId} {
      allow read: if true;
      allow write: if false;
    }
    
    // Users can read their own payments
    match /payments/{paymentId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow write: if false;
    }
  }
}
```

### 2. Backend Deployment
1. Deploy to your preferred platform (Heroku, Railway, etc.)
2. Set environment variables
3. Update CORS settings for production domains

### 3. Web App Deployment
1. Build: `npm run build`
2. Deploy to Netlify, Vercel, or similar
3. Set environment variables

### 4. Desktop App Distribution
1. Build installers: `npm run build`
2. Distribute via website or app stores

### 5. Mobile App Deployment
1. Build with EAS: `eas build`
2. Submit to app stores: `eas submit`

## Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify API keys are correct
   - Check network connectivity
   - Ensure Firebase project is active

2. **Authentication Errors**
   - Verify email/password provider is enabled
   - Check Firebase Auth domain settings
   - Ensure proper error handling

3. **Payment Issues**
   - Verify Stripe keys are correct
   - Check webhook endpoints
   - Test with Stripe test cards

4. **Cross-Platform Sync Issues**
   - Verify all apps use same Firebase project
   - Check user ID consistency
   - Ensure proper data structure

### Support
For additional support:
1. Check Firebase Console logs
2. Review browser/app console errors
3. Test with Firebase Emulator Suite
4. Consult Firebase and Stripe documentation

## Security Best Practices

1. **Never expose private keys** in client-side code
2. **Use environment variables** for sensitive data
3. **Implement proper validation** on both client and server
4. **Set up proper Firebase security rules**
5. **Use HTTPS** in production
6. **Regularly update dependencies**
7. **Monitor for suspicious activity**

This completes the database setup and integration guide for the FlowDownloader project. All three applications (web, desktop, mobile) now have full authentication and payment capabilities with Firebase as the backend database.
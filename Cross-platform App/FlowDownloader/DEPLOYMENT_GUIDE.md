# FlowDownloader Deployment Guide

## Overview
This guide covers deploying all components of the FlowDownloader application across different platforms.

## Web App Deployment (Vercel)

### Prerequisites
- Vercel account (free tier available)
- GitHub repository (recommended for automatic deployments)

### Manual Deployment Steps

1. **Build the application**:
   ```bash
   cd web
   npm run build
   ```

2. **Deploy to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your GitHub repository or upload the `dist` folder
   - Vercel will auto-detect Vite configuration
   - Deploy!

3. **Configuration**:
   - The `vercel.json` file is already configured with:
     - Build settings
     - Environment variables
     - Security headers
     - Redirects for SPA routing

### Environment Variables
Set these in Vercel dashboard:
- `VITE_API_URL`: Your backend API URL
- `VITE_APP_NAME`: FlowDownloader
- `NODE_ENV`: production

## Desktop App Packaging

### Windows Build

1. **Prerequisites**:
   - Node.js 16+
   - Windows 10/11
   - Administrator privileges (for first build)

2. **Build Steps**:
   ```bash
   cd desktop
   npm install
   
   # For unsigned build (development)
   npm run build:unsigned
   
   # For signed build (production - requires code signing certificate)
   npm run build:win
   ```

3. **Output**:
   - Executable: `dist/win-unpacked/FlowDownloader.exe`
   - Installer: `dist/FlowDownloader Setup.exe`
   - Portable: `dist/FlowDownloader.exe`

### macOS Build

1. **Prerequisites**:
   - macOS 10.15+
   - Xcode Command Line Tools
   - Apple Developer Account (for distribution)

2. **Build Steps**:
   ```bash
   cd desktop
   npm run build:mac
   ```

3. **Output**:
   - App Bundle: `dist/mac/FlowDownloader.app`
   - DMG Installer: `dist/FlowDownloader.dmg`

### Linux Build

```bash
cd desktop
npm run build:linux
```

## Mobile App Preparation

### React Native Setup

1. **Install React Native CLI**:
   ```bash
   npm install -g @react-native-community/cli
   ```

2. **Initialize React Native project**:
   ```bash
   cd mobile
   npx react-native init FlowDownloaderMobile
   ```

3. **Configure for existing codebase**:
   - Copy shared components from `../shared`
   - Set up navigation
   - Configure API endpoints

### Android Build

1. **Prerequisites**:
   - Android Studio
   - Java Development Kit 11
   - Android SDK

2. **Build Steps**:
   ```bash
   cd mobile
   npx react-native run-android --variant=release
   ```

### iOS Build

1. **Prerequisites**:
   - macOS with Xcode
   - iOS Developer Account
   - CocoaPods

2. **Build Steps**:
   ```bash
   cd mobile/ios
   pod install
   cd ..
   npx react-native run-ios --configuration Release
   ```

## Backend Deployment

### Recommended Platforms
- **Railway**: Easy Node.js deployment
- **Heroku**: Popular PaaS platform
- **DigitalOcean App Platform**: Scalable hosting
- **AWS/Google Cloud**: Enterprise solutions

### Environment Setup
```bash
cd backend
npm run build
npm start
```

### Required Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: production
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Authentication secret
- `CORS_ORIGIN`: Frontend URL

## CI/CD Pipeline

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy FlowDownloader

on:
  push:
    branches: [main]

jobs:
  deploy-web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install and Build
        run: |
          cd web
          npm ci
          npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./web

  build-desktop:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build Desktop App
        run: |
          cd desktop
          npm ci
          npm run build:unsigned
      - name: Upload Artifacts
        uses: actions/upload-artifact@v3
        with:
          name: desktop-build
          path: desktop/dist/
```

## Security Considerations

### Code Signing
- **Windows**: Requires Authenticode certificate
- **macOS**: Requires Apple Developer certificate
- **Mobile**: Requires platform-specific certificates

### Environment Variables
- Never commit secrets to repository
- Use platform-specific secret management
- Rotate keys regularly

## Monitoring and Analytics

### Recommended Tools
- **Sentry**: Error tracking
- **Google Analytics**: Usage analytics
- **Vercel Analytics**: Web performance
- **Electron Analytics**: Desktop usage

## Support and Maintenance

### Update Strategy
- Web: Automatic deployment on push
- Desktop: Auto-updater with electron-updater
- Mobile: App store updates

### Backup Strategy
- Database: Regular automated backups
- Code: Git repository with multiple remotes
- Assets: CDN with versioning

---

## Quick Start Checklist

- [ ] Web app built and deployed to Vercel
- [ ] Desktop app packaged for Windows
- [ ] Desktop app packaged for macOS (if applicable)
- [ ] Backend deployed to cloud platform
- [ ] Environment variables configured
- [ ] Domain configured (optional)
- [ ] SSL certificates installed
- [ ] Monitoring tools set up
- [ ] CI/CD pipeline configured

For detailed troubleshooting and advanced configuration, refer to the platform-specific documentation.
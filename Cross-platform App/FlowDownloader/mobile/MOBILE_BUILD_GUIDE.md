# FlowDownloader Mobile App Build Guide

## Prerequisites

### 1. Install Required Tools
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI for building
npm install -g eas-cli

# Login to Expo account
eas login
```

### 2. Project Setup
```bash
# Install dependencies
npm install

# Create development build (optional)
eas build --profile development --platform android
```

## Build Profiles

### Development Build
- **Purpose**: For development and testing
- **Command**: `npm run build:android:preview` or `npm run build:ios:preview`
- **Output**: APK for Android, Simulator build for iOS

### Production Build
- **Purpose**: For app store submission
- **Android**: `npm run build:android:production` (creates AAB)
- **iOS**: `npm run build:ios:production` (creates IPA)
- **Both**: `npm run build:all:production`

### APK Build (Android)
- **Purpose**: Direct APK distribution
- **Command**: `npm run build:android:apk`
- **Output**: APK file for sideloading

## Android Build Process

### 1. Preview Build (APK)
```bash
npm run build:android:preview
```

### 2. Production Build (AAB for Play Store)
```bash
npm run build:android:production
```

### 3. Production APK (for direct distribution)
```bash
npm run build:android:apk
```

### Android Signing
- EAS Build automatically handles signing
- For custom keystore, add to `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "aab",
        "credentialsSource": "local"
      }
    }
  }
}
```

## iOS Build Process

### 1. Preview Build (Simulator)
```bash
npm run build:ios:preview
```

### 2. Production Build (App Store)
```bash
npm run build:ios:production
```

### iOS Requirements
- **Apple Developer Account** ($99/year)
- **Bundle Identifier**: `com.flowdownloader.mobile`
- **Certificates**: Managed automatically by EAS

### Manual Certificate Setup (if needed)
1. Generate certificates in Apple Developer Console
2. Add to EAS credentials:
```bash
eas credentials
```

## App Store Submission

### Android (Google Play Store)
```bash
# After production build
npm run submit:android
```

### iOS (Apple App Store)
```bash
# After production build
npm run submit:ios
```

## Build Configuration Files

### `eas.json`
- Defines build profiles
- Configures platform-specific settings
- Manages distribution channels

### `app.json`
- App metadata and configuration
- Platform-specific settings
- Permissions and capabilities

## Assets Created

✅ **Icons**:
- `assets/icon.png` (512x512) - Main app icon
- `assets/adaptive-icon.png` (512x512) - Android adaptive icon

✅ **Splash Screen**:
- `assets/splash.png` (1242x2688) - Launch screen

✅ **Favicon**:
- `assets/favicon.png` (32x32) - Web favicon

## Build Commands Reference

| Command | Platform | Profile | Output |
|---------|----------|---------|--------|
| `npm run build:android:preview` | Android | Preview | APK |
| `npm run build:android:production` | Android | Production | AAB |
| `npm run build:android:apk` | Android | Production | APK |
| `npm run build:ios:preview` | iOS | Preview | Simulator |
| `npm run build:ios:production` | iOS | Production | IPA |
| `npm run build:all:preview` | Both | Preview | APK + Simulator |
| `npm run build:all:production` | Both | Production | AAB + IPA |

## Troubleshooting

### Common Issues

1. **Build Fails - Missing Dependencies**
   ```bash
   npm install
   expo install --fix
   ```

2. **iOS Build Fails - Certificate Issues**
   ```bash
   eas credentials
   # Follow prompts to set up certificates
   ```

3. **Android Build Fails - Gradle Issues**
   ```bash
   npm run prebuild:clean
   npm run prebuild
   ```

4. **Asset Issues**
   - Ensure all assets exist in `assets/` folder
   - Check file paths in `app.json`
   - Regenerate assets if needed: `node create-mobile-assets.js`

### Build Status
Check build status at: https://expo.dev/accounts/[username]/projects/flowdownloader-mobile/builds

## Next Steps

1. **Test the Build**:
   - Install APK on Android device
   - Test iOS build on simulator/device

2. **App Store Preparation**:
   - Create store listings
   - Prepare screenshots
   - Write app descriptions

3. **Distribution**:
   - Submit to Google Play Store
   - Submit to Apple App Store
   - Or distribute APK directly

## Production Checklist

- [ ] Assets created and optimized
- [ ] App configuration updated
- [ ] Build profiles configured
- [ ] Test builds successful
- [ ] Store metadata prepared
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] App store accounts set up

---

**Note**: These are placeholder assets. For production:
- Replace with high-quality, professionally designed icons
- Follow platform-specific design guidelines
- Test on real devices before submission
- Ensure compliance with app store policies
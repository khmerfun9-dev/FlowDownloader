# FlowDownloader

A powerful cross-platform video/audio downloader and converter supporting multiple platforms including YouTube, Facebook, Instagram, TikTok, and more.

## Features

- 🎥 **Multi-Platform Support**: Download from YouTube, Facebook, Instagram, TikTok, and 50+ other platforms
- 🔄 **Format Conversion**: Convert videos to MP4, MP3, AVI, MOV, and more
- 📱 **Cross-Platform**: Available as web app, desktop (Electron), and mobile applications
- 🎨 **Modern UI**: Beautiful, responsive interface with dark/light mode support
- 🔐 **License Management**: Tiered licensing system with free and premium features
- 📊 **Analytics Integration**: Google Analytics 4 tracking and AdSense monetization
- 🛡️ **GDPR Compliant**: Cookie consent management with Google Consent Mode v2

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- FFmpeg (for video processing)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/flowdownloader.git
cd flowdownloader
```

2. Install dependencies for all platforms:
```bash
# Web app
cd web && npm install

# Backend API
cd ../backend && npm install

# Desktop app
cd ../desktop && npm install

# Mobile app (React Native)
cd ../mobile && npm install
```

3. Set up environment variables (see [Environment Configuration](#environment-configuration))

4. Start the development servers:
```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Web app (Terminal 2)
cd web && npm run dev

# Desktop app (Terminal 3)
cd desktop && npm run dev
```

## Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

### Frontend (Web App)
```env
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX
REACT_APP_ADSENSE_PUBLISHER=ca-pub-XXXXXXXXXXXX
FRONTEND_URL=http://localhost:5173
```

### Backend
```env
PORT=3001
NODE_ENV=development
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_ga4_api_secret_here
```

## Google Analytics 4 Setup

### 1. Create GA4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Click "Admin" → "Create Property"
3. Choose "GA4" property type
4. Fill in your website details
5. Copy the **Measurement ID** (starts with `G-`)

### 2. Get Measurement Protocol API Secret

1. In GA4 Admin → Data Streams → Web
2. Click on your web stream
3. Scroll to "Measurement Protocol API secrets"
4. Click "Create" and name your secret
5. Copy the generated **API Secret**

### 3. Configure Environment Variables

```env
# Frontend
REACT_APP_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend (for server-side tracking)
GA4_MEASUREMENT_ID=G-XXXXXXXXXX
GA4_API_SECRET=your_api_secret_here
```

### 4. Verify Setup

1. Start your application
2. Open GA4 → Reports → Realtime
3. Navigate your app to see live events
4. Use **DebugView** for detailed event inspection

## Google AdSense Setup

⚠️ **Important**: AdSense ads should **ONLY** be displayed on verified web domains, **NOT** in desktop Electron apps or mobile apps (violates AdSense policies).

### 1. Create AdSense Account

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign up and verify your identity
3. Add your website for review
4. Wait for approval (can take 1-14 days)

### 2. Get Publisher ID

1. In AdSense dashboard → Account → Settings
2. Copy your **Publisher ID** (starts with `ca-pub-`)

### 3. Create Ad Units

1. AdSense → Ads → By ad unit → Display ads
2. Create different ad units:
   - **Banner**: 728x90 (desktop) / 320x50 (mobile)
   - **Square**: 300x250
   - **Sidebar**: 160x600
3. Copy the **Ad Slot IDs** for each unit

### 4. Configure Environment Variables

```env
REACT_APP_ADSENSE_PUBLISHER=ca-pub-XXXXXXXXXXXX
```

### 5. Add ads.txt File

1. Update `web/public/ads.txt` with your Publisher ID:
```
google.com, ca-pub-XXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

2. Deploy to your domain root: `https://yourdomain.com/ads.txt`

### 6. Verify Site Ownership

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Add your website property
3. Verify ownership using HTML tag or DNS method
4. This is required for AdSense approval

## Usage Examples

### Frontend Analytics Integration

```jsx
import { useAnalytics } from './hooks/useAnalytics';

function MyComponent() {
  const { trackEvent, trackPageView } = useAnalytics();
  
  const handleDownload = () => {
    trackEvent('download_start', {
      url: videoUrl,
      format: 'MP4',
      quality: '1080p'
    });
  };
  
  return <button onClick={handleDownload}>Download</button>;
}
```

### AdSense Integration

```jsx
import { BannerAd, SquareAd } from './components/AdUnit';

function HomePage() {
  return (
    <div>
      <BannerAd adSlot="1234567890" />
      <main>{/* Your content */}</main>
      <SquareAd adSlot="0987654321" />
    </div>
  );
}
```

### Backend Analytics Tracking

```javascript
// Track purchase event
app.post('/api/purchase', async (req, res) => {
  // Process payment...
  
  // Track in GA4
  await fetch('http://localhost:3001/api/analytics/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: req.body.client_id,
      transaction_id: paymentResult.id,
      value: 29.99,
      currency: 'USD',
      license_type: 'pro'
    })
  });
});
```

## Testing

### Run Frontend Tests
```bash
cd web
npm test
```

### Run Backend Tests
```bash
cd backend
npm test
```

### Test Analytics Integration

#### Using PowerShell (Windows):
```powershell
cd backend
.\test-analytics.ps1
```

#### Using Bash (Linux/Mac):
```bash
cd backend
chmod +x test-analytics.sh
./test-analytics.sh
```

#### Manual curl test:
```bash
curl -X POST "http://localhost:3001/api/analytics/ga4-event" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "test_123",
    "events": [{
      "name": "test_event",
      "params": {"test": "value"}
    }]
  }'
```

### Verify GA4 Events

1. Open GA4 → Admin → DebugView
2. Run your tests or use the app
3. Look for events with your test client IDs
4. Verify event parameters are correct

## GDPR Compliance

The app includes Google Consent Mode v2 for GDPR compliance:

### Features
- Automatic EU user detection
- Cookie consent banner
- Granular consent controls (Analytics, Ads, Functional)
- Consent state persistence
- Integration with GA4 and AdSense

### Consent Management

```jsx
import { ConsentBanner } from './components/ConsentBanner';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ConsentBanner />
    </div>
  );
}
```

## Deployment

### Web App (Vercel/Netlify)

1. Build the web app:
```bash
cd web && npm run build
```

2. Set environment variables in your hosting platform:
   - `REACT_APP_GA_MEASUREMENT_ID`
   - `REACT_APP_ADSENSE_PUBLISHER`

3. Ensure `ads.txt` is accessible at domain root

### Backend (Railway/Heroku)

1. Set environment variables:
   - `GA4_MEASUREMENT_ID`
   - `GA4_API_SECRET`
   - `PORT`
   - `NODE_ENV=production`

2. Deploy using your platform's CLI or Git integration

### Desktop App

```bash
cd desktop
npm run build
npm run dist
```

## Important Notes

### AdSense Policy Compliance

- ✅ **DO**: Show ads on verified web domains only
- ❌ **DON'T**: Show ads in Electron desktop apps
- ❌ **DON'T**: Show ads in mobile apps
- ❌ **DON'T**: Click your own ads or encourage clicks
- ✅ **DO**: Ensure ads don't break layout when blocked

### Analytics Best Practices

- Use consistent `client_id` across user sessions
- Include `user_id` for authenticated users
- Track meaningful events (downloads, purchases, errors)
- Respect user consent preferences
- Test events in GA4 DebugView before production

### Performance Considerations

- Analytics and ads load asynchronously
- Graceful degradation when scripts are blocked
- Minimal impact on Core Web Vitals
- Lazy loading for non-critical components

## Troubleshooting

### GA4 Events Not Showing

1. Check browser console for errors
2. Verify `REACT_APP_GA_MEASUREMENT_ID` is set
3. Ensure not running in Electron (analytics disabled)
4. Check GA4 DebugView for real-time events
5. Verify Measurement Protocol API secret is correct

### AdSense Ads Not Loading

1. Check browser console for AdSense errors
2. Verify `REACT_APP_ADSENSE_PUBLISHER` is set
3. Ensure domain is approved in AdSense
4. Check `ads.txt` file is accessible
5. Verify not running in Electron (ads disabled)
6. Test with ad blocker disabled

### GDPR Consent Issues

1. Check if EU user detection is working
2. Verify consent state in localStorage
3. Test consent banner appearance
4. Check Google Consent Mode integration

## API Documentation

### Analytics Endpoints

#### POST `/api/analytics/ga4-event`
Send custom events to GA4.

**Request:**
```json
{
  "client_id": "user_123",
  "user_id": "optional_user_id",
  "events": [
    {
      "name": "download_start",
      "params": {
        "url": "https://example.com/video",
        "format": "MP4"
      }
    }
  ]
}
```

#### POST `/api/analytics/purchase`
Track purchase events.

**Request:**
```json
{
  "client_id": "user_123",
  "transaction_id": "txn_456",
  "value": 29.99,
  "currency": "USD",
  "license_type": "pro"
}
```

#### GET `/api/analytics/health`
Check analytics service health.

**Response:**
```json
{
  "status": "ok",
  "ga4_configured": true,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For support, please:
1. Check this README and troubleshooting section
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Join our Discord community (link in repository)

---

**Made with ❤️ for content creators worldwide**
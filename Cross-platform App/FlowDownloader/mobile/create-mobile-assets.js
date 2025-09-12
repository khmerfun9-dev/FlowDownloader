const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// Function to create a simple PNG buffer (placeholder)
function createPNGBuffer(width, height, color = [64, 123, 255]) {
  // Simple PNG header and data for a solid color image
  const header = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
    0x49, 0x48, 0x44, 0x52, // IHDR
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF, // width
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF, // height
    0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
  ]);
  
  // Simple solid color data (this is a very basic implementation)
  const pixelData = Buffer.alloc(width * height * 3);
  for (let i = 0; i < pixelData.length; i += 3) {
    pixelData[i] = color[0];     // R
    pixelData[i + 1] = color[1]; // G
    pixelData[i + 2] = color[2]; // B
  }
  
  return Buffer.concat([header, pixelData]);
}

// Create SVG icon (more reliable than PNG generation)
function createSVGIcon(size, filename) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad)"/>
  <path d="M${size * 0.3} ${size * 0.4}L${size * 0.7} ${size * 0.4}L${size * 0.5} ${size * 0.7}Z" fill="white" opacity="0.9"/>
  <circle cx="${size * 0.5}" cy="${size * 0.25}" r="${size * 0.08}" fill="white" opacity="0.9"/>
</svg>`;
  
  fs.writeFileSync(path.join(assetsDir, filename), svg);
  console.log(`Created ${filename}`);
}

// Create placeholder assets
console.log('Creating mobile app assets...');

// App icon (1024x1024 for iOS, 512x512 for Android)
createSVGIcon(1024, 'icon.svg');
createSVGIcon(512, 'icon.png'); // Will be SVG but named .png for compatibility

// Adaptive icon for Android
createSVGIcon(512, 'adaptive-icon.svg');
createSVGIcon(512, 'adaptive-icon.png'); // Will be SVG but named .png

// Splash screen
const splashSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1242" height="2688" viewBox="0 0 1242 2688" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1e293b;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="iconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="1242" height="2688" fill="url(#bgGrad)"/>
  <g transform="translate(621, 1344)">
    <rect x="-100" y="-100" width="200" height="200" rx="40" fill="url(#iconGrad)"/>
    <path d="M-40 -20L40 -20L0 40Z" fill="white" opacity="0.9"/>
    <circle cx="0" cy="-50" r="16" fill="white" opacity="0.9"/>
    <text x="0" y="160" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="600">FlowDownloader</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(assetsDir, 'splash.svg'), splashSVG);
fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashSVG); // SVG content but .png extension
console.log('Created splash.svg and splash.png');

// Favicon for web
createSVGIcon(32, 'favicon.svg');
createSVGIcon(32, 'favicon.png');

console.log('\n✅ Mobile app assets created successfully!');
console.log('\n📱 Assets created:');
console.log('  - icon.svg (1024x1024)');
console.log('  - icon.png (512x512)');
console.log('  - adaptive-icon.svg (512x512)');
console.log('  - adaptive-icon.png (512x512)');
console.log('  - splash.svg (1242x2688)');
console.log('  - splash.png (1242x2688)');
console.log('  - favicon.svg (32x32)');
console.log('  - favicon.png (32x32)');

console.log('\n⚠️  Note: These are placeholder assets using SVG format.');
console.log('For production, replace with high-quality PNG/JPG images:');
console.log('  - Use proper image editing software');
console.log('  - Follow platform guidelines for icon design');
console.log('  - Test on actual devices before publishing');
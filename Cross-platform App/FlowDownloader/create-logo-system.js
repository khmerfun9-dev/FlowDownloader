#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create logos directory
const logosDir = path.join(__dirname, 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir);
}

// Color palette
const colors = {
  gradientStart: '#667eea',
  gradientEnd: '#764ba2',
  green: '#10b981',
  white: '#ffffff',
  dark: '#1f2937',
  light: '#f8fafc'
};

// Core symbol SVG (circular flow + download arrow + play button)
function createCoreSymbol(size = 256, variant = 'default') {
  const center = size / 2;
  const radius = size * 0.35;
  const arrowSize = size * 0.15;
  const playSize = size * 0.08;
  
  let background = '';
  let symbolColor = colors.white;
  
  if (variant === 'desktop') {
    // Rounded square background for desktop
    const cornerRadius = size * 0.2;
    background = `
      <defs>
        <linearGradient id="desktopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.gradientStart};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.gradientEnd};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#desktopGrad)"/>`;
  } else if (variant === 'mobile') {
    // Circular background for mobile
    background = `
      <defs>
        <linearGradient id="mobileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.gradientStart};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.gradientEnd};stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="${center}" cy="${center}" r="${center}" fill="url(#mobileGrad)"/>`;
  } else {
    // No background for website/favicon
    symbolColor = colors.gradientStart;
    background = `
      <defs>
        <linearGradient id="symbolGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colors.gradientStart};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${colors.gradientEnd};stop-opacity:1" />
        </linearGradient>
      </defs>`;
    symbolColor = 'url(#symbolGrad)';
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  ${background}
  
  <!-- Circular flow shape -->
  <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="${symbolColor}" stroke-width="${size * 0.04}" opacity="0.8"/>
  
  <!-- Flow wave inside circle -->
  <path d="M${center - radius * 0.6} ${center} Q${center} ${center - radius * 0.3} ${center + radius * 0.6} ${center} Q${center} ${center + radius * 0.3} ${center - radius * 0.6} ${center}" 
        fill="none" stroke="${symbolColor}" stroke-width="${size * 0.025}" opacity="0.6"/>
  
  <!-- Download arrow -->
  <g transform="translate(${center}, ${center - radius * 0.7})">
    <path d="M0 0 L0 ${arrowSize * 1.5} M${-arrowSize * 0.5} ${arrowSize} L0 ${arrowSize * 1.5} L${arrowSize * 0.5} ${arrowSize}" 
          stroke="${symbolColor}" stroke-width="${size * 0.03}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
  
  <!-- Play button -->
  <g transform="translate(${center + radius * 0.7}, ${center})">
    <path d="M${-playSize} ${-playSize * 0.8} L${playSize} 0 L${-playSize} ${playSize * 0.8} Z" 
          fill="${symbolColor}" opacity="0.9"/>
  </g>
</svg>`;
}

// Website logo with text
function createWebsiteLogo(width = 400, height = 100) {
  const symbolSize = height * 0.8;
  const textX = symbolSize + 20;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.gradientStart};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.gradientEnd};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Symbol -->
  <g transform="translate(${(height - symbolSize) / 2}, ${(height - symbolSize) / 2})">
    ${createCoreSymbol(symbolSize, 'default').replace(/.*<svg[^>]*>|<\/svg>/g, '')}
  </g>
  
  <!-- Text -->
  <text x="${textX}" y="${height * 0.65}" font-family="Inter, Montserrat, Arial, sans-serif" 
        font-size="${height * 0.35}" font-weight="600" fill="url(#logoGrad)">FlowDownloader</text>
</svg>`;
}

// Favicon (simplified version)
function createFavicon(size = 32) {
  const center = size / 2;
  const radius = size * 0.3;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="faviconGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors.gradientStart};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors.gradientEnd};stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Simplified circle with arrow -->
  <circle cx="${center}" cy="${center}" r="${radius}" fill="url(#faviconGrad)"/>
  <path d="M${center} ${center - radius * 0.4} L${center} ${center + radius * 0.2} M${center - radius * 0.3} ${center} L${center} ${center + radius * 0.2} L${center + radius * 0.3} ${center}" 
        stroke="${colors.white}" stroke-width="${size * 0.08}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
}

// Dark mode variants
function createDarkModeVariant(svgContent) {
  return svgContent
    .replace(new RegExp(colors.gradientStart, 'g'), colors.green)
    .replace(new RegExp(colors.gradientEnd, 'g'), colors.gradientStart)
    .replace(/fill="#1f2937"/g, `fill="${colors.light}"`);
}

// Generate all logo variants
function generateLogos() {
  console.log('🎨 Creating FlowDownloader Logo System...');
  
  // 1. Core Symbol (various sizes)
  const coreSizes = [64, 128, 256, 512, 1024];
  coreSizes.forEach(size => {
    fs.writeFileSync(
      path.join(logosDir, `core-symbol-${size}.svg`),
      createCoreSymbol(size, 'default')
    );
  });
  
  // 2. Desktop App Icons
  const desktopSizes = [64, 128, 256, 512];
  desktopSizes.forEach(size => {
    fs.writeFileSync(
      path.join(logosDir, `desktop-icon-${size}.svg`),
      createCoreSymbol(size, 'desktop')
    );
  });
  
  // 3. Mobile App Icons
  const mobileSizes = [48, 72, 96, 144, 192, 512];
  mobileSizes.forEach(size => {
    fs.writeFileSync(
      path.join(logosDir, `mobile-icon-${size}.svg`),
      createCoreSymbol(size, 'mobile')
    );
  });
  
  // 4. Website Logos
  const websiteVariants = [
    { width: 300, height: 80, name: 'website-logo-small' },
    { width: 400, height: 100, name: 'website-logo-medium' },
    { width: 600, height: 150, name: 'website-logo-large' }
  ];
  
  websiteVariants.forEach(variant => {
    fs.writeFileSync(
      path.join(logosDir, `${variant.name}.svg`),
      createWebsiteLogo(variant.width, variant.height)
    );
  });
  
  // 5. Favicons
  const faviconSizes = [16, 32, 48];
  faviconSizes.forEach(size => {
    fs.writeFileSync(
      path.join(logosDir, `favicon-${size}.svg`),
      createFavicon(size)
    );
  });
  
  // 6. Dark mode variants (selected sizes)
  const darkModeVariants = [
    { file: 'core-symbol-256.svg', output: 'core-symbol-256-dark.svg' },
    { file: 'desktop-icon-256.svg', output: 'desktop-icon-256-dark.svg' },
    { file: 'website-logo-medium.svg', output: 'website-logo-medium-dark.svg' }
  ];
  
  darkModeVariants.forEach(variant => {
    const originalContent = fs.readFileSync(path.join(logosDir, variant.file), 'utf8');
    const darkContent = createDarkModeVariant(originalContent);
    fs.writeFileSync(path.join(logosDir, variant.output), darkContent);
  });
  
  console.log('✅ Logo system created successfully!');
  console.log('\n📁 Generated files:');
  console.log('\n🎯 Core Symbols:');
  coreSizes.forEach(size => console.log(`  - core-symbol-${size}.svg`));
  
  console.log('\n🖥️  Desktop Icons:');
  desktopSizes.forEach(size => console.log(`  - desktop-icon-${size}.svg`));
  
  console.log('\n📱 Mobile Icons:');
  mobileSizes.forEach(size => console.log(`  - mobile-icon-${size}.svg`));
  
  console.log('\n🌐 Website Logos:');
  websiteVariants.forEach(variant => console.log(`  - ${variant.name}.svg`));
  
  console.log('\n🔖 Favicons:');
  faviconSizes.forEach(size => console.log(`  - favicon-${size}.svg`));
  
  console.log('\n🌙 Dark Mode Variants:');
  darkModeVariants.forEach(variant => console.log(`  - ${variant.output}`));
  
  console.log('\n💡 Usage Guidelines:');
  console.log('  - Desktop: Use desktop-icon-*.svg for app packaging');
  console.log('  - Mobile: Use mobile-icon-*.svg for React Native/Expo');
  console.log('  - Web: Use website-logo-*.svg for headers and branding');
  console.log('  - Favicon: Use favicon-32.svg for web favicon');
  console.log('  - All files are scalable SVG format');
  console.log('  - Dark mode variants available for key sizes');
  
  console.log('\n🎨 Design Features:');
  console.log('  ✓ Modern gradient (Blue → Purple)');
  console.log('  ✓ Circular flow pattern');
  console.log('  ✓ Download arrow symbol');
  console.log('  ✓ Play button element');
  console.log('  ✓ Cross-platform consistency');
  console.log('  ✓ Dark/Light mode ready');
  console.log('  ✓ Scalable vector format');
}

if (require.main === module) {
  generateLogos();
}

module.exports = { generateLogos, createCoreSymbol, createWebsiteLogo, createFavicon };
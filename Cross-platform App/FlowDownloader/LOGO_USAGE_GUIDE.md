# FlowDownloader Logo Usage Guide

## 🎨 Brand Identity Overview

**FlowDownloader** features a modern, minimalist logo system designed for cross-platform consistency and scalability. The logo combines elements of flow, downloading, and media to create a cohesive brand identity.

## 🎯 Design Elements

### Core Symbol Components
- **Circular Flow**: Represents smooth, continuous operation and cross-platform compatibility
- **Download Arrow**: Clear indication of the app's primary function
- **Play Button**: Represents video/media content
- **Modern Gradient**: Blue to Purple gradient for a tech-forward appearance

### Color Palette
- **Primary Gradient**: `#667eea` → `#764ba2` (Blue to Purple)
- **Secondary**: `#10b981` (Green - for eco/fresh vibe)
- **Accent**: `#ffffff` (White for contrast)
- **Dark Mode**: Adjusted variants for dark backgrounds

## 📁 Logo Files Structure

```
logos/
├── 🎯 Core Symbols (transparent background)
│   ├── core-symbol-64.svg
│   ├── core-symbol-128.svg
│   ├── core-symbol-256.svg
│   ├── core-symbol-512.svg
│   └── core-symbol-1024.svg
│
├── 🖥️ Desktop Icons (rounded square background)
│   ├── desktop-icon-64.svg
│   ├── desktop-icon-128.svg
│   ├── desktop-icon-256.svg
│   └── desktop-icon-512.svg
│
├── 📱 Mobile Icons (circular background)
│   ├── mobile-icon-48.svg
│   ├── mobile-icon-72.svg
│   ├── mobile-icon-96.svg
│   ├── mobile-icon-144.svg
│   ├── mobile-icon-192.svg
│   └── mobile-icon-512.svg
│
├── 🌐 Website Logos (horizontal with text)
│   ├── website-logo-small.svg (300x80)
│   ├── website-logo-medium.svg (400x100)
│   └── website-logo-large.svg (600x150)
│
├── 🔖 Favicons (simplified versions)
│   ├── favicon-16.svg
│   ├── favicon-32.svg
│   └── favicon-48.svg
│
└── 🌙 Dark Mode Variants
    ├── core-symbol-256-dark.svg
    ├── desktop-icon-256-dark.svg
    └── website-logo-medium-dark.svg
```

## 🎯 Usage Guidelines by Platform

### 🌐 Web Application

**Favicon**:
- Use: `favicon-32.svg`
- Location: `/public/favicon-32.svg`
- HTML: `<link rel="icon" type="image/svg+xml" href="/favicon-32.svg" />`

**Header Logo**:
- Use: `website-logo-medium.svg` (400x100)
- For smaller headers: `website-logo-small.svg` (300x80)
- For hero sections: `website-logo-large.svg` (600x150)

**Dark Mode**:
- Use: `website-logo-medium-dark.svg` for dark themes

### 🖥️ Desktop Application (Electron)

**App Icon**:
- Primary: `desktop-icon-256.svg`
- High DPI: `desktop-icon-512.svg`
- Small sizes: `desktop-icon-128.svg`, `desktop-icon-64.svg`

**Configuration**:
```json
{
  "build": {
    "appId": "com.flowdownloader.desktop",
    "icon": "assets/icon.svg"
  }
}
```

### 📱 Mobile Application (React Native/Expo)

**App Icon**:
- Primary: `mobile-icon-512.svg`
- Various densities: 48px, 72px, 96px, 144px, 192px

**Expo Configuration** (`app.json`):
```json
{
  "expo": {
    "icon": "./assets/icon.svg",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.svg"
      }
    }
  }
}
```

### 📄 Documentation & Marketing

**README Files**:
- Use: `core-symbol-256.svg` or `website-logo-medium.svg`

**Presentations**:
- Light backgrounds: `website-logo-large.svg`
- Dark backgrounds: `website-logo-medium-dark.svg`

**Social Media**:
- Profile pictures: `mobile-icon-512.svg`
- Cover images: `website-logo-large.svg`

## ✅ Do's and Don'ts

### ✅ Do's
- Use SVG format for scalability
- Maintain aspect ratios when resizing
- Use appropriate variants for each platform
- Ensure sufficient contrast on backgrounds
- Use dark mode variants on dark backgrounds

### ❌ Don'ts
- Don't stretch or distort the logo
- Don't change the color scheme arbitrarily
- Don't use low-resolution versions for large displays
- Don't place logo on busy backgrounds without proper contrast
- Don't modify the core design elements

## 🔧 Technical Specifications

### File Format
- **Primary**: SVG (Scalable Vector Graphics)
- **Benefits**: Infinite scalability, small file size, web-compatible
- **Fallback**: PNG exports can be generated if needed

### Minimum Sizes
- **Favicon**: 16px minimum
- **Mobile icons**: 48px minimum
- **Desktop icons**: 64px minimum
- **Website logos**: 300px width minimum

### Color Specifications
- **Gradient Start**: `#667eea` (RGB: 102, 126, 234)
- **Gradient End**: `#764ba2` (RGB: 118, 75, 162)
- **Green Accent**: `#10b981` (RGB: 16, 185, 129)
- **White**: `#ffffff` (RGB: 255, 255, 255)

## 🚀 Implementation Checklist

### Web Application
- [x] Favicon updated in `index.html`
- [x] Logo file copied to `public/` directory
- [x] Page title updated to "FlowDownloader"
- [ ] Header component updated with logo
- [ ] Dark mode logo variant implemented

### Desktop Application
- [x] Icon file copied to `assets/` directory
- [ ] `electron-builder` configuration updated
- [ ] App metadata updated with new branding

### Mobile Application
- [x] Icon file copied to `assets/` directory
- [x] `app.json` configuration references new icon
- [ ] Splash screen updated with logo
- [ ] App store metadata prepared

## 📱 Export Instructions

If PNG versions are needed:

```bash
# Using Inkscape (if available)
inkscape --export-type=png --export-dpi=300 logo.svg

# Using online converters
# Upload SVG files to cloudconvert.com or similar services
```

## 🎨 Brand Guidelines Summary

1. **Consistency**: Use the same logo variant across similar contexts
2. **Scalability**: Always use SVG when possible for crisp rendering
3. **Contrast**: Ensure logo is visible against background colors
4. **Spacing**: Maintain clear space around logo (minimum 1/2 logo height)
5. **Quality**: Never use pixelated or low-resolution versions

---

**Created**: FlowDownloader Logo System v1.0  
**Format**: SVG (Scalable Vector Graphics)  
**Platforms**: Web, Desktop (Electron), Mobile (React Native/Expo)  
**Compatibility**: All modern browsers and applications supporting SVG

For questions about logo usage or to request additional variants, refer to this guide or contact the development team.
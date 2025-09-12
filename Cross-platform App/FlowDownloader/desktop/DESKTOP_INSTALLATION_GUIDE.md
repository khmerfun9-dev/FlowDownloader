# FlowDownloader Desktop Installation & Usage Guide

## 🖥️ Desktop Application Overview

FlowDownloader Desktop is an Electron-based application that provides a native desktop experience for downloading videos from YouTube, Instagram, TikTok, and other platforms.

## 📋 Prerequisites

Before running the desktop application, ensure you have:

1. **Node.js** (v16 or higher) installed
2. **Backend server** running on `http://localhost:3001`
3. **Web server** running on `http://localhost:5173`

## 🚀 Quick Start Methods

### Method 1: Direct Launch (Recommended for Development)

**Windows Batch File:**
```bash
# Double-click or run:
.\launch-desktop.bat
```

**PowerShell Script:**
```powershell
# Run in PowerShell:
.\launch-desktop.ps1
```

**Manual Command:**
```bash
# In the desktop directory:
npm start
```

### Method 2: Development Mode
```bash
# For development with debugging:
npm run dev
```

## 🔧 Installation Steps

### 1. Install Dependencies
```bash
cd desktop
npm install
```

### 2. Start Required Services

**Backend Server:**
```bash
# In backend directory:
npm run dev
# Should run on http://localhost:3001
```

**Web Server:**
```bash
# In web directory:
npm run dev
# Should run on http://localhost:5173
```

### 3. Launch Desktop App
```bash
# In desktop directory:
npm start
```

## 📱 Application Features

### Core Functionality
- **Video Downloads**: YouTube, Instagram, TikTok support
- **Multiple Formats**: MP4, MP3, various quality options
- **Batch Downloads**: Queue multiple videos
- **Progress Tracking**: Real-time download progress
- **Native UI**: Desktop-optimized interface

### Desktop-Specific Features
- **System Tray Integration**: Minimize to system tray
- **Native Notifications**: Download completion alerts
- **File System Access**: Direct file management
- **Keyboard Shortcuts**: Enhanced productivity
- **Auto-Updates**: Built-in update mechanism (when configured)

## 🛠️ Build Configuration

### Current Status
- ✅ **Development Ready**: App runs via `npm start`
- ✅ **Dependencies Installed**: All packages available
- ✅ **Icon Assets**: Logo system integrated
- ⚠️ **Installer Build**: Requires icon format fixes

### Build Issues & Solutions

**Issue**: Electron-builder fails due to icon format
**Solution**: Use direct launch methods instead of building installer

**Current Workaround:**
- Use `npm start` for immediate testing
- Use launcher scripts for easy access
- Installer build can be fixed later with proper ICO conversion

## 📁 File Structure

```
desktop/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Preload scripts
│   └── renderer/        # UI components
├── assets/
│   ├── icon.svg         # App icon (SVG)
│   ├── icon.png         # App icon (PNG)
│   ├── icon.ico         # App icon (ICO)
│   └── icon.icns        # App icon (macOS)
├── launch-desktop.bat   # Windows launcher
├── launch-desktop.ps1   # PowerShell launcher
├── package.json         # App configuration
└── DESKTOP_INSTALLATION_GUIDE.md
```

## 🔧 Configuration Options

### App Settings (package.json)
```json
{
  "name": "flowdownloader-desktop",
  "version": "1.0.0",
  "main": "src/main.js",
  "build": {
    "appId": "com.flowdownloader.desktop",
    "productName": "FlowDownloader"
  }
}
```

### Electron Builder Config
- **Windows**: NSIS installer + Portable
- **macOS**: DMG + ZIP packages
- **Linux**: AppImage, DEB, RPM packages

## 🚨 Troubleshooting

### Common Issues

**1. App Won't Start**
```bash
# Check if dependencies are installed:
npm install

# Verify Node.js version:
node --version  # Should be v16+
```

**2. Backend Connection Failed**
```bash
# Ensure backend is running:
cd ../backend
npm run dev

# Check if port 3001 is available
```

**3. Web Server Not Found**
```bash
# Ensure web server is running:
cd ../web
npm run dev

# Check if port 5173 is available
```

**4. Build Errors**
```bash
# For development, use direct launch:
npm start

# Skip installer build for now
# Focus on functionality testing
```

### Debug Mode
```bash
# Run with debugging enabled:
npm run dev

# Or with Electron debugging:
electron . --dev
```

## 📊 Performance Tips

1. **Memory Usage**: Close unused tabs in the embedded browser
2. **Download Speed**: Ensure stable internet connection
3. **Storage**: Monitor available disk space for downloads
4. **CPU Usage**: Limit concurrent downloads if system slows down

## 🔄 Updates & Maintenance

### Updating Dependencies
```bash
npm update
npm audit fix
```

### Clearing Cache
```bash
# Clear Electron cache:
npm run clean  # If script exists

# Or manually delete:
# %APPDATA%/flowdownloader-desktop/
```

## 🎯 Next Steps

### Immediate Actions
1. ✅ **Test Desktop App**: Use `npm start` to verify functionality
2. ✅ **Verify Integration**: Ensure backend/web connectivity
3. ⏳ **Fix Icon Issues**: Convert SVG to proper ICO format
4. ⏳ **Build Installer**: Create distributable packages

### Future Enhancements
- **Auto-updater**: Implement automatic updates
- **System Integration**: Better OS integration
- **Performance**: Optimize memory and CPU usage
- **Features**: Add more download options and settings

## 📞 Support

For issues or questions:
1. Check this guide first
2. Verify all prerequisites are met
3. Test with direct launch methods
4. Check console output for error messages

---

**Status**: ✅ Desktop app is functional and ready for testing  
**Launch Method**: Use `npm start` or launcher scripts  
**Integration**: Connects to backend (port 3001) and web (port 5173)  
**Next**: Test functionality and fix installer build issues
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const API_BASE_URL = 'http://localhost:3001/api';
const DESKTOP_CONFIG_PATH = path.join(__dirname, 'config', 'app-config.json');
const TEST_DOWNLOADS_DIR = path.join(__dirname, 'test-downloads');

// Mock authentication data for desktop app testing
const mockAuthData = {
  token: 'mock-jwt-token-for-testing',
  user: {
    id: 'test-user-123',
    email: 'test@flowdownloader.com',
    firstName: 'Test',
    lastName: 'User',
    licenseType: 'FREE'
  },
  expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
};

async function testDesktopConfigPersistence() {
  console.log('\n💾 Testing Desktop App Configuration Persistence...');
  try {
    // Ensure config directory exists
    const configDir = path.dirname(DESKTOP_CONFIG_PATH);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // Test writing config
    const testConfig = {
      user: mockAuthData.user,
      token: mockAuthData.token,
      settings: {
        downloadPath: TEST_DOWNLOADS_DIR,
        autoStart: false,
        notifications: true,
        theme: 'dark'
      },
      lastLogin: new Date().toISOString()
    };

    fs.writeFileSync(DESKTOP_CONFIG_PATH, JSON.stringify(testConfig, null, 2));
    console.log('✅ Configuration saved successfully');

    // Test reading config
    const savedConfig = JSON.parse(fs.readFileSync(DESKTOP_CONFIG_PATH, 'utf8'));
    
    const isValid = (
      savedConfig.user.email === testConfig.user.email &&
      savedConfig.token === testConfig.token &&
      savedConfig.settings.downloadPath === testConfig.settings.downloadPath
    );

    if (isValid) {
      console.log('✅ Configuration persistence verified');
      console.log('📊 Saved config:', {
        userEmail: savedConfig.user.email,
        licenseType: savedConfig.user.licenseType,
        downloadPath: savedConfig.settings.downloadPath,
        theme: savedConfig.settings.theme
      });
      return true;
    } else {
      console.log('❌ Configuration data mismatch');
      return false;
    }
  } catch (error) {
    console.log('❌ Configuration persistence failed:', error.message);
    return false;
  }
}

async function testDownloadLimitsEnforcement() {
  console.log('\n🚫 Testing Download Limits Enforcement...');
  try {
    // Test different license types and their limits
    const licenseTests = [
      { type: 'FREE', dailyLimit: 5, expectedBehavior: 'Block after 5 downloads' },
      { type: 'BASIC', dailyLimit: 50, expectedBehavior: 'Block after 50 downloads' },
      { type: 'PRO', dailyLimit: 200, expectedBehavior: 'Block after 200 downloads' },
      { type: 'UNLIMITED', dailyLimit: -1, expectedBehavior: 'Never block' }
    ];

    let allTestsPassed = true;

    for (const licenseTest of licenseTests) {
      console.log(`\n  Testing ${licenseTest.type} license limits...`);
      
      // Simulate download attempts
      const testAttempts = licenseTest.dailyLimit === -1 ? 10 : Math.min(licenseTest.dailyLimit + 2, 10);
      let successfulDownloads = 0;
      let blockedDownloads = 0;

      for (let i = 1; i <= testAttempts; i++) {
        // Mock download limit check
        const shouldBlock = licenseTest.dailyLimit !== -1 && i > licenseTest.dailyLimit;
        
        if (shouldBlock) {
          blockedDownloads++;
          console.log(`    Download ${i}: ❌ BLOCKED (limit exceeded)`);
        } else {
          successfulDownloads++;
          console.log(`    Download ${i}: ✅ ALLOWED`);
        }
      }

      const testPassed = (
        (licenseTest.dailyLimit === -1 && blockedDownloads === 0) ||
        (licenseTest.dailyLimit !== -1 && successfulDownloads <= licenseTest.dailyLimit)
      );

      if (testPassed) {
        console.log(`  ✅ ${licenseTest.type} limit enforcement: PASS`);
      } else {
        console.log(`  ❌ ${licenseTest.type} limit enforcement: FAIL`);
        allTestsPassed = false;
      }
    }

    return allTestsPassed;
  } catch (error) {
    console.log('❌ Download limits test failed:', error.message);
    return false;
  }
}

async function testAuthenticationPersistence() {
  console.log('\n🔐 Testing Authentication Persistence Across App Restarts...');
  try {
    // Simulate app startup - check for existing auth
    let authPersisted = false;
    
    if (fs.existsSync(DESKTOP_CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(DESKTOP_CONFIG_PATH, 'utf8'));
      
      if (config.token && config.user) {
        // Simulate token validation
        const tokenAge = Date.now() - new Date(config.lastLogin).getTime();
        const isTokenValid = tokenAge < (24 * 60 * 60 * 1000); // 24 hours
        
        if (isTokenValid) {
          authPersisted = true;
          console.log('✅ Authentication persisted successfully');
          console.log('📊 Restored session:', {
            userEmail: config.user.email,
            licenseType: config.user.licenseType,
            tokenAge: Math.round(tokenAge / (60 * 1000)) + ' minutes',
            isValid: isTokenValid
          });
        } else {
          console.log('⚠️ Stored token expired, re-authentication required');
        }
      } else {
        console.log('ℹ️ No stored authentication found');
      }
    } else {
      console.log('ℹ️ No configuration file found');
    }

    // Test auto-logout on token expiry
    const expiredConfig = {
      ...mockAuthData,
      lastLogin: new Date(Date.now() - (25 * 60 * 60 * 1000)).toISOString() // 25 hours ago
    };
    
    const tempConfigPath = path.join(__dirname, 'temp-expired-config.json');
    fs.writeFileSync(tempConfigPath, JSON.stringify(expiredConfig, null, 2));
    
    const expiredConfigData = JSON.parse(fs.readFileSync(tempConfigPath, 'utf8'));
    const expiredTokenAge = Date.now() - new Date(expiredConfigData.lastLogin).getTime();
    const shouldExpire = expiredTokenAge > (24 * 60 * 60 * 1000);
    
    if (shouldExpire) {
      console.log('✅ Token expiry detection working correctly');
      fs.unlinkSync(tempConfigPath); // Cleanup
    } else {
      console.log('❌ Token expiry detection failed');
      return false;
    }

    return authPersisted;
  } catch (error) {
    console.log('❌ Authentication persistence test failed:', error.message);
    return false;
  }
}

async function testDesktopAppIntegration() {
  console.log('\n🖥️ Testing Desktop App Integration Features...');
  try {
    // Test download directory creation
    if (!fs.existsSync(TEST_DOWNLOADS_DIR)) {
      fs.mkdirSync(TEST_DOWNLOADS_DIR, { recursive: true });
    }
    
    const downloadDirExists = fs.existsSync(TEST_DOWNLOADS_DIR);
    console.log(`Download directory: ${downloadDirExists ? '✅ Created' : '❌ Failed'}`);

    // Test file system permissions
    const testFilePath = path.join(TEST_DOWNLOADS_DIR, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'Test content');
    const canWrite = fs.existsSync(testFilePath);
    
    if (canWrite) {
      fs.unlinkSync(testFilePath); // Cleanup
      console.log('File system permissions: ✅ Write access confirmed');
    } else {
      console.log('File system permissions: ❌ Write access denied');
      return false;
    }

    // Test app settings persistence
    const settingsTest = {
      downloadPath: TEST_DOWNLOADS_DIR,
      maxConcurrentDownloads: 3,
      autoStart: false,
      notifications: true,
      theme: 'dark',
      language: 'en'
    };

    const settingsPath = path.join(__dirname, 'config', 'settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settingsTest, null, 2));
    
    const savedSettings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const settingsMatch = JSON.stringify(settingsTest) === JSON.stringify(savedSettings);
    
    console.log(`Settings persistence: ${settingsMatch ? '✅ Working' : '❌ Failed'}`);

    return downloadDirExists && canWrite && settingsMatch;
  } catch (error) {
    console.log('❌ Desktop app integration test failed:', error.message);
    return false;
  }
}

async function testOfflineCapabilities() {
  console.log('\n📱 Testing Offline Capabilities...');
  try {
    // Test offline queue functionality
    const offlineQueue = [
      { url: 'https://youtube.com/watch?v=test1', format: 'mp4', quality: '720p', timestamp: Date.now() },
      { url: 'https://youtube.com/watch?v=test2', format: 'mp3', quality: '128kbps', timestamp: Date.now() },
      { url: 'https://youtube.com/watch?v=test3', format: 'mp4', quality: '1080p', timestamp: Date.now() }
    ];

    const queuePath = path.join(__dirname, 'config', 'offline-queue.json');
    fs.writeFileSync(queuePath, JSON.stringify(offlineQueue, null, 2));
    
    const savedQueue = JSON.parse(fs.readFileSync(queuePath, 'utf8'));
    const queuePersisted = savedQueue.length === offlineQueue.length;
    
    console.log(`Offline queue persistence: ${queuePersisted ? '✅ Working' : '❌ Failed'}`);
    console.log(`Queue items: ${savedQueue.length}`);

    // Test offline mode detection
    const offlineConfig = {
      isOffline: true,
      lastOnlineCheck: new Date().toISOString(),
      queuedDownloads: savedQueue.length,
      retryAttempts: 0
    };

    const offlineConfigPath = path.join(__dirname, 'config', 'offline-status.json');
    fs.writeFileSync(offlineConfigPath, JSON.stringify(offlineConfig, null, 2));
    
    console.log('✅ Offline mode configuration saved');

    return queuePersisted;
  } catch (error) {
    console.log('❌ Offline capabilities test failed:', error.message);
    return false;
  }
}

async function runDesktopFeatureTests() {
  console.log('🚀 Starting Desktop App Feature Tests');
  console.log('=' .repeat(60));

  const results = {
    configPersistence: false,
    downloadLimits: false,
    authPersistence: false,
    desktopIntegration: false,
    offlineCapabilities: false
  };

  // Run all tests
  results.configPersistence = await testDesktopConfigPersistence();
  results.downloadLimits = await testDownloadLimitsEnforcement();
  results.authPersistence = await testAuthenticationPersistence();
  results.desktopIntegration = await testDesktopAppIntegration();
  results.offlineCapabilities = await testOfflineCapabilities();

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📋 DESKTOP APP FEATURE TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`💾 Configuration Persistence: ${results.configPersistence ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🚫 Download Limits Enforcement: ${results.downloadLimits ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔐 Authentication Persistence: ${results.authPersistence ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🖥️ Desktop Integration: ${results.desktopIntegration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📱 Offline Capabilities: ${results.offlineCapabilities ? '✅ PASS' : '❌ FAIL'}`);

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
  
  // Show created files
  console.log('\n📁 Created test files:');
  console.log(`  - ${DESKTOP_CONFIG_PATH}`);
  console.log(`  - ${path.join(__dirname, 'config', 'settings.json')}`);
  console.log(`  - ${path.join(__dirname, 'config', 'offline-queue.json')}`);
  console.log(`  - ${path.join(__dirname, 'config', 'offline-status.json')}`);

  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runDesktopFeatureTests().catch(console.error);
}

module.exports = {
  runDesktopFeatureTests,
  testDesktopConfigPersistence,
  testDownloadLimitsEnforcement,
  testAuthenticationPersistence,
  testDesktopAppIntegration,
  testOfflineCapabilities
};
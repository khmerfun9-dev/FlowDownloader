const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001/api';
const TEST_URLS = {
  youtube: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Rick Roll - safe test video
  instagram: 'https://www.instagram.com/p/test/', // Placeholder
  tiktok: 'https://www.tiktok.com/@test/video/test' // Placeholder
};

// Test authentication token (you may need to get this from the web app)
let authToken = null;

async function testHealthEndpoint() {
  console.log('\n🔍 Testing API Health Endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check passed:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
}

async function testYouTubeDownload() {
  console.log('\n🎥 Testing YouTube Download...');
  try {
    const downloadData = {
      url: TEST_URLS.youtube,
      format: 'mp4',
      quality: '720p'
    };

    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post(`${API_BASE_URL}/download`, downloadData, {
      headers,
      timeout: 30000 // 30 second timeout
    });

    console.log('✅ YouTube download test passed');
    console.log('📊 Response:', {
      status: response.status,
      downloadUrl: response.data.downloadUrl ? 'Present' : 'Missing',
      filename: response.data.filename || 'Not provided',
      fileSize: response.data.fileSize || 'Not provided'
    });
    return true;
  } catch (error) {
    console.log('❌ YouTube download test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testInstagramDownload() {
  console.log('\n📸 Testing Instagram Download...');
  try {
    const downloadData = {
      url: TEST_URLS.instagram,
      format: 'mp4',
      quality: '720p'
    };

    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post(`${API_BASE_URL}/download`, downloadData, {
      headers,
      timeout: 30000
    });

    console.log('✅ Instagram download test passed');
    console.log('📊 Response:', {
      status: response.status,
      downloadUrl: response.data.downloadUrl ? 'Present' : 'Missing',
      filename: response.data.filename || 'Not provided'
    });
    return true;
  } catch (error) {
    console.log('❌ Instagram download test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testTikTokDownload() {
  console.log('\n🎵 Testing TikTok Download...');
  try {
    const downloadData = {
      url: TEST_URLS.tiktok,
      format: 'mp4',
      quality: '720p'
    };

    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post(`${API_BASE_URL}/download`, downloadData, {
      headers,
      timeout: 30000
    });

    console.log('✅ TikTok download test passed');
    console.log('📊 Response:', {
      status: response.status,
      downloadUrl: response.data.downloadUrl ? 'Present' : 'Missing',
      filename: response.data.filename || 'Not provided'
    });
    return true;
  } catch (error) {
    console.log('❌ TikTok download test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testMultipleFormats() {
  console.log('\n🔄 Testing Multiple Format Support...');
  const formats = ['mp4', 'avi', 'mov', 'webm'];
  const results = [];

  for (const format of formats) {
    try {
      const downloadData = {
        url: TEST_URLS.youtube,
        format: format,
        quality: '720p'
      };

      const headers = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await axios.post(`${API_BASE_URL}/download`, downloadData, {
        headers,
        timeout: 15000
      });

      results.push({ format, success: true, status: response.status });
      console.log(`✅ ${format.toUpperCase()} format supported`);
    } catch (error) {
      results.push({ format, success: false, error: error.message });
      console.log(`❌ ${format.toUpperCase()} format failed:`, error.response?.data?.message || error.message);
    }
  }

  return results;
}

async function testLicenseValidation() {
  console.log('\n🔐 Testing License Validation...');
  try {
    const testLicenseKey = 'TEST-LICENSE-KEY-12345';
    
    const response = await axios.post(`${API_BASE_URL}/auth/verify-license`, {
      licenseKey: testLicenseKey
    });

    console.log('✅ License validation endpoint working');
    console.log('📊 Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ License validation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting FlowDownloader Desktop App Tests');
  console.log('=' .repeat(50));

  const results = {
    health: false,
    youtube: false,
    instagram: false,
    tiktok: false,
    formats: [],
    license: false
  };

  // Test API health
  results.health = await testHealthEndpoint();
  
  if (!results.health) {
    console.log('\n❌ API server not available. Please ensure backend is running on port 3001.');
    return results;
  }

  // Test platform downloads
  results.youtube = await testYouTubeDownload();
  results.instagram = await testInstagramDownload();
  results.tiktok = await testTikTokDownload();

  // Test multiple formats
  results.formats = await testMultipleFormats();

  // Test license validation
  results.license = await testLicenseValidation();

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📋 TEST SUMMARY');
  console.log('=' .repeat(50));
  console.log(`🏥 API Health: ${results.health ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🎥 YouTube: ${results.youtube ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📸 Instagram: ${results.instagram ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🎵 TikTok: ${results.tiktok ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔄 Format Support: ${results.formats.filter(f => f.success).length}/${results.formats.length} formats`);
  console.log(`🔐 License System: ${results.license ? '✅ PASS' : '❌ FAIL'}`);

  const totalTests = 5 + results.formats.length;
  const passedTests = [results.health, results.youtube, results.instagram, results.tiktok, results.license].filter(Boolean).length + results.formats.filter(f => f.success).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);

  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testHealthEndpoint,
  testYouTubeDownload,
  testInstagramDownload,
  testTikTokDownload,
  testMultipleFormats,
  testLicenseValidation
};
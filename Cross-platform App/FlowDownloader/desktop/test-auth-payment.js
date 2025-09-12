const axios = require('axios');

// Test configuration
const API_BASE_URL = 'http://localhost:3001/api';
let authToken = null;
let testUser = {
  email: 'test@flowdownloader.com',
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User'
};

async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...');
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser);
    
    console.log('✅ User registration successful');
    console.log('📊 Response:', {
      success: response.data.success,
      userId: response.data.data?.user?.id || 'Not provided',
      email: response.data.data?.user?.email || 'Not provided',
      tokenProvided: !!response.data.data?.token
    });
    
    // Store auth token for subsequent tests
    if (response.data.data?.token) {
      authToken = response.data.data.token;
    }
    
    return true;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('ℹ️ User already exists, proceeding with login test');
      return true;
    }
    if (error.response?.data?.message?.includes('collection')) {
      console.log('⚠️ Firebase database not configured - skipping user registration');
      console.log('ℹ️ This is expected in development without Firebase setup');
      return false;
    }
    console.log('❌ User registration failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...');
  try {
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, loginData);
    
    console.log('✅ User login successful');
    console.log('📊 Response:', {
      success: response.data.success,
      userId: response.data.data?.user?.id || 'Not provided',
      email: response.data.data?.user?.email || 'Not provided',
      tokenProvided: !!response.data.data?.token
    });
    
    // Store auth token for subsequent tests
    if (response.data.data?.token) {
      authToken = response.data.data.token;
    }
    
    return true;
  } catch (error) {
    if (error.response?.data?.message?.includes('collection')) {
      console.log('⚠️ Firebase database not configured - skipping user login');
      console.log('ℹ️ This is expected in development without Firebase setup');
      return false;
    }
    console.log('❌ User login failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testUserProfile() {
  console.log('\n👥 Testing User Profile Access...');
  try {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Profile access successful');
    console.log('📊 Response:', {
      success: response.data.success,
      userId: response.data.data?.id || 'Not provided',
      email: response.data.data?.email || 'Not provided',
      licenseType: response.data.data?.licenseType || 'Not provided'
    });
    
    return true;
  } catch (error) {
    console.log('❌ Profile access failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLicenseTypes() {
  console.log('\n📋 Testing License Types Endpoint...');
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/license-types`);
    
    console.log('✅ License types retrieved successfully');
    console.log('📊 Available license types:', response.data);
    
    return true;
  } catch (error) {
    console.log('❌ License types retrieval failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testLicenseActivation() {
  console.log('\n🔑 Testing License Activation...');
  try {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    
    const testLicenseKey = 'PREMIUM-TEST-LICENSE-2024';
    
    const response = await axios.post(`${API_BASE_URL}/auth/activate-license`, {
      licenseKey: testLicenseKey
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ License activation successful');
    console.log('📊 Response:', {
      success: response.data.success,
      licenseType: response.data.data?.licenseType || 'Not provided',
      expiresAt: response.data.data?.expiresAt || 'Not provided'
    });
    
    return true;
  } catch (error) {
    console.log('❌ License activation failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testMyLicenses() {
  console.log('\n📜 Testing My Licenses Endpoint...');
  try {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    
    const response = await axios.get(`${API_BASE_URL}/auth/my-licenses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ My licenses retrieved successfully');
    console.log('📊 Response:', {
      success: response.data.success,
      licenseCount: response.data.data?.length || 0,
      licenses: response.data.data || []
    });
    
    return true;
  } catch (error) {
    console.log('❌ My licenses retrieval failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testPaymentEndpoints() {
  console.log('\n💳 Testing Payment System...');
  try {
    // Test payment intent creation
    const paymentData = {
      licenseType: 'premium',
      amount: 2999, // $29.99
      currency: 'usd'
    };
    
    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const response = await axios.post(`${API_BASE_URL}/payments/stripe/create-payment-intent`, paymentData, {
      headers
    });
    
    console.log('✅ Payment intent creation successful');
    console.log('📊 Response:', {
      success: response.data.success,
      clientSecret: response.data.clientSecret ? 'Present' : 'Missing',
      amount: response.data.amount || 'Not provided'
    });
    
    return true;
  } catch (error) {
    console.log('❌ Payment system test failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testDownloadWithAuth() {
  console.log('\n🎬 Testing Authenticated Download...');
  try {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    
    const downloadData = {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      format: 'mp4',
      quality: '720p'
    };
    
    const response = await axios.post(`${API_BASE_URL}/download`, downloadData, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Authenticated download successful');
    console.log('📊 Response:', {
      success: response.data.success,
      jobId: response.data.jobId || 'Not provided',
      status: response.data.status || 'Not provided'
    });
    
    return true;
  } catch (error) {
    console.log('❌ Authenticated download failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function testTokenRefresh() {
  console.log('\n🔄 Testing Token Refresh...');
  try {
    if (!authToken) {
      throw new Error('No auth token available');
    }
    
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {}, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Token refresh successful');
    console.log('📊 Response:', {
      success: response.data.success,
      newTokenProvided: !!response.data.token
    });
    
    return true;
  } catch (error) {
    console.log('❌ Token refresh failed:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runAuthPaymentTests() {
  console.log('🚀 Starting Authentication & Payment System Tests');
  console.log('=' .repeat(60));

  const results = {
    registration: false,
    login: false,
    profile: false,
    licenseTypes: false,
    licenseActivation: false,
    myLicenses: false,
    payment: false,
    authenticatedDownload: false,
    tokenRefresh: false
  };

  // Test user registration
  results.registration = await testUserRegistration();
  
  // Test user login (always try this even if registration fails)
  results.login = await testUserLogin();
  
  // Only proceed with authenticated tests if we have a token
  if (authToken) {
    results.profile = await testUserProfile();
    results.myLicenses = await testMyLicenses();
    results.licenseActivation = await testLicenseActivation();
    results.authenticatedDownload = await testDownloadWithAuth();
    results.tokenRefresh = await testTokenRefresh();
  }
  
  // Test public endpoints
  results.licenseTypes = await testLicenseTypes();
  results.payment = await testPaymentEndpoints();

  // Summary
  console.log('\n' + '=' .repeat(60));
  console.log('📋 AUTHENTICATION & PAYMENT TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`👤 User Registration: ${results.registration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔐 User Login: ${results.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`👥 Profile Access: ${results.profile ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📋 License Types: ${results.licenseTypes ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔑 License Activation: ${results.licenseActivation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`📜 My Licenses: ${results.myLicenses ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`💳 Payment System: ${results.payment ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🎬 Authenticated Download: ${results.authenticatedDownload ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🔄 Token Refresh: ${results.tokenRefresh ? '✅ PASS' : '❌ FAIL'}`);

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (authToken) {
    console.log(`\n🔑 Auth Token: ${authToken.substring(0, 20)}...`);
  }

  return results;
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAuthPaymentTests().catch(console.error);
}

module.exports = {
  runAuthPaymentTests,
  testUserRegistration,
  testUserLogin,
  testUserProfile,
  testLicenseActivation,
  testPaymentEndpoints
};
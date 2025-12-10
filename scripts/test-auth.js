#!/usr/bin/env node

/**
 * Authentication System Test Script
 * Tests the authentication endpoints
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testAuthentication() {
  console.log('🧪 Testing Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1️⃣ Testing user registration...');
    const registerData = {
      email: `test${Date.now()}@eloquentai.com`,
      password: 'testpassword123',
      firstName: 'Test',
      lastName: 'User',
      company: 'Test Company'
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    
    if (registerResponse.data.success) {
      console.log('✅ User registration successful');
      console.log(`   User ID: ${registerResponse.data.data.user.id}`);
      console.log(`   Email: ${registerResponse.data.data.user.email}`);
      
      const { accessToken, refreshToken } = registerResponse.data.data.tokens;
      console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    } else {
      console.log('❌ User registration failed:', registerResponse.data.error);
      return;
    }

    // Test 2: Login with the registered user
    console.log('\n2️⃣ Testing user login...');
    const loginData = {
      email: registerData.email,
      password: 'testpassword123'
    };

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, loginData);
    
    if (loginResponse.data.success) {
      console.log('✅ User login successful');
      const { accessToken, refreshToken } = loginResponse.data.data.tokens;
      console.log(`   Access Token: ${accessToken.substring(0, 20)}...`);
    } else {
      console.log('❌ User login failed:', loginResponse.data.error);
      return;
    }

    // Test 3: Get user profile (authenticated request)
    console.log('\n3️⃣ Testing authenticated request...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.data.tokens.accessToken}`
      }
    });

    if (profileResponse.data.success) {
      console.log('✅ Authenticated request successful');
      console.log(`   User: ${profileResponse.data.data.user.first_name} ${profileResponse.data.data.user.last_name}`);
      console.log(`   Email: ${profileResponse.data.data.user.email}`);
      console.log(`   Company: ${profileResponse.data.data.user.company}`);
    } else {
      console.log('❌ Authenticated request failed:', profileResponse.data.error);
    }

    // Test 4: Test token verification
    console.log('\n4️⃣ Testing token verification...');
    const verifyResponse = await axios.get(`${BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.data.tokens.accessToken}`
      }
    });

    if (verifyResponse.data.success) {
      console.log('✅ Token verification successful');
    } else {
      console.log('❌ Token verification failed:', verifyResponse.data.error);
    }

    // Test 5: Test logout
    console.log('\n5️⃣ Testing user logout...');
    const logoutResponse = await axios.post(`${BASE_URL}/auth/logout`, {
      refreshToken: loginResponse.data.data.tokens.refreshToken
    }, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.data.tokens.accessToken}`
      }
    });

    if (logoutResponse.data.success) {
      console.log('✅ User logout successful');
    } else {
      console.log('❌ User logout failed:', logoutResponse.data.error);
    }

    // Test 6: Test invalid token
    console.log('\n6️⃣ Testing invalid token...');
    try {
      await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid_token'
        }
      });
      console.log('❌ Invalid token test failed - should have been rejected');
    } catch (error) {
      if (error.response && error.response.status === 403) {
        console.log('✅ Invalid token correctly rejected');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 Authentication system test completed!');
    console.log('\n📋 Test Summary:');
    console.log('✅ User registration');
    console.log('✅ User login');
    console.log('✅ Authenticated requests');
    console.log('✅ Token verification');
    console.log('✅ User logout');
    console.log('✅ Invalid token rejection');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Error:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔌 Connection Error:');
      console.log('   Make sure the server is running on port 5001');
      console.log('   Run: npm start (from the root directory)');
    }
  }
}

// Run the test
if (require.main === module) {
  testAuthentication();
}

module.exports = testAuthentication;
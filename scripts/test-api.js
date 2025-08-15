#!/usr/bin/env node

/**
 * API Test Script for CodeNearby
 * Tests all the implemented API endpoints
 */

// Note: Run with node-fetch installed or use built-in fetch in Node 18+
// For Node < 18: npm install node-fetch
// For Node 18+: Use global fetch

const BASE_URL = 'http://localhost:3000';
const TEST_API_KEY = 'test_api_key_here'; // Replace with actual API key

async function testEndpoint(name, url, options = {}) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`📡 ${options.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Status: ${response.status}`);
      console.log(`📊 Response:`, JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Status: ${response.status}`);
      console.log(`💥 Error:`, JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log(`💥 Network Error:`, error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting CodeNearby API Tests');
  console.log('='.repeat(50));

  // Test 1: User Tier Information (No auth needed for testing)
  await testEndpoint(
    'Get User Tier Info',
    `${BASE_URL}/api/v1/users/tier`,
    {
      method: 'GET',
      headers: {
        'x-api-key': TEST_API_KEY
      }
    }
  );

  // Test 2: Developer Search
  await testEndpoint(
    'AI Developer Search',
    `${BASE_URL}/api/v1/developers`,
    {
      method: 'POST',
      headers: {
        'x-api-key': TEST_API_KEY
      },
      body: JSON.stringify({
        query: "Find React Native developers in San Francisco with 3+ years experience"
      })
    }
  );

  // Test 3: Profile Analysis
  await testEndpoint(
    'AI Profile Analysis',
    `${BASE_URL}/api/v1/profile`,
    {
      method: 'POST',
      headers: {
        'x-api-key': TEST_API_KEY
      },
      body: JSON.stringify({
        username: "octocat"
      })
    }
  );

  // Test 4: Repository Search (Premium feature)
  await testEndpoint(
    'AI Repository Search',
    `${BASE_URL}/api/v1/repositories`,
    {
      method: 'POST',
      headers: {
        'x-api-key': TEST_API_KEY
      },
      body: JSON.stringify({
        query: "React UI component libraries with TypeScript support"
      })
    }
  );

  // Test 5: API Key Permission Check
  await testEndpoint(
    'Check API Key Permission',
    `${BASE_URL}/api/v1/users/api-key-permission`,
    {
      method: 'GET'
    }
  );

  // Test 6: List API Keys (requires session)
  await testEndpoint(
    'List API Keys',
    `${BASE_URL}/api/v1/auth/keys`,
    {
      method: 'GET'
    }
  );

  console.log('\n🏁 API Tests Completed');
  console.log('\n📋 Test Summary:');
  console.log('- Replace TEST_API_KEY with a real API key');
  console.log('- Some endpoints require user authentication');
  console.log('- Check the API documentation at /api-docs');
  console.log('- Monitor token usage in the API dashboard');
}

// Handle command line execution
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, testEndpoint };

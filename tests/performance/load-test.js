import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');
export const requestCount = new Counter('requests');

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 20 }, // Ramp up to 20 users
    { duration: '5m', target: 20 }, // Stay at 20 users
    { duration: '2m', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    http_req_failed: ['rate<0.1'],     // Error rate must be below 10%
    errors: ['rate<0.1'],              // Custom error rate below 10%
  },
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';

// Test data
const testUsers = [
  { email: 'user1@test.com', name: 'Test User 1' },
  { email: 'user2@test.com', name: 'Test User 2' },
  { email: 'user3@test.com', name: 'Test User 3' },
];

const testTexts = [
  'This is a test text for analysis. It contains multiple sentences to test the text analysis functionality.',
  'Another test text with different content. This text is longer and contains more complex sentence structures.',
  'Short text for quick analysis.',
];

// Setup function
export function setup() {
  console.log('Starting load test setup...');
  
  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`);
  if (healthResponse.status !== 200) {
    throw new Error('Health check failed');
  }
  
  console.log('Load test setup completed');
  return { baseUrl: BASE_URL };
}

// Main test function
export default function(data) {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const text = testTexts[Math.floor(Math.random() * testTexts.length)];
  
  // Test 1: Health Check
  testHealthCheck(data.baseUrl);
  
  // Test 2: Text Upload
  testTextUpload(data.baseUrl, text);
  
  // Test 3: File Upload
  testFileUpload(data.baseUrl);
  
  // Test 4: Analytics
  testAnalytics(data.baseUrl);
  
  // Test 5: WebSocket Connection
  testWebSocket(data.baseUrl);
  
  sleep(1);
}

// Health check test
function testHealthCheck(baseUrl) {
  const response = http.get(`${baseUrl}/api/health`);
  
  const success = check(response, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
    'health check has correct content': (r) => r.json('status') === 'healthy',
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// Text upload test
function testTextUpload(baseUrl, text) {
  const payload = JSON.stringify({
    textContent: text,
    analysisType: 'text'
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(`${baseUrl}/api/upload/text`, payload, params);
  
  const success = check(response, {
    'text upload status is 200': (r) => r.status === 200,
    'text upload response time < 5s': (r) => r.timings.duration < 5000,
    'text upload returns session ID': (r) => r.json('sessionId') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  // If upload successful, test analysis
  if (success && response.json('sessionId')) {
    const sessionId = response.json('sessionId');
    testTextAnalysis(baseUrl, sessionId);
  }
}

// Text analysis test
function testTextAnalysis(baseUrl, sessionId) {
  const response = http.get(`${baseUrl}/api/analysis/${sessionId}`);
  
  const success = check(response, {
    'text analysis status is 200': (r) => r.status === 200,
    'text analysis response time < 10s': (r) => r.timings.duration < 10000,
    'text analysis returns results': (r) => r.json('success') === true,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// File upload test
function testFileUpload(baseUrl) {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileContent = 'This is a test file content for upload testing.';
  
  const payload = `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="test.txt"\r\n` +
    `Content-Type: text/plain\r\n\r\n` +
    `${fileContent}\r\n` +
    `--${boundary}--\r\n`;
  
  const params = {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
  };
  
  const response = http.post(`${baseUrl}/api/files/upload`, payload, params);
  
  const success = check(response, {
    'file upload status is 200': (r) => r.status === 200,
    'file upload response time < 3s': (r) => r.timings.duration < 3000,
    'file upload returns file ID': (r) => r.json('data.file_id') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// Analytics test
function testAnalytics(baseUrl) {
  const payload = JSON.stringify({
    event: 'page_view',
    page: '/test',
    user_id: 'test_user',
    timestamp: Date.now()
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(`${baseUrl}/api/analytics`, payload, params);
  
  const success = check(response, {
    'analytics status is 200': (r) => r.status === 200,
    'analytics response time < 1s': (r) => r.timings.duration < 1000,
    'analytics returns success': (r) => r.json('success') === true,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// WebSocket test (simplified)
function testWebSocket(baseUrl) {
  // Note: k6 doesn't have native WebSocket support in this version
  // This is a placeholder for WebSocket testing
  // In a real scenario, you'd use a different tool or k6's WebSocket support
  
  const response = http.get(`${baseUrl}/ws-health`);
  
  const success = check(response, {
    'WebSocket health status is 200': (r) => r.status === 200,
    'WebSocket health response time < 1s': (r) => r.timings.duration < 1000,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// Teardown function
export function teardown(data) {
  console.log('Load test teardown completed');
}

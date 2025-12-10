import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');
export const requestCount = new Counter('requests');
export const stressLevel = new Trend('stress_level');

// Stress test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '2m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 200 },  // Ramp up to 200 users
    { duration: '2m', target: 200 },  // Stay at 200 users
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'], // 95% of requests must complete below 5s
    http_req_failed: ['rate<0.2'],     // Error rate must be below 20%
    errors: ['rate<0.2'],              // Custom error rate below 20%
  },
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';

// Stress test data
const stressTexts = [
  'This is a very long text that will stress test the text analysis system. '.repeat(100),
  'Another stress test text with complex content. '.repeat(150),
  'Short but frequent requests. '.repeat(50),
];

// Setup function
export function setup() {
  console.log('Starting stress test setup...');
  
  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`);
  if (healthResponse.status !== 200) {
    throw new Error('Health check failed');
  }
  
  console.log('Stress test setup completed');
  return { baseUrl: BASE_URL };
}

// Main stress test function
export default function(data) {
  const text = stressTexts[Math.floor(Math.random() * stressTexts.length)];
  
  // Stress test 1: Rapid Health Checks
  stressHealthChecks(data.baseUrl);
  
  // Stress test 2: Heavy Text Analysis
  stressTextAnalysis(data.baseUrl, text);
  
  // Stress test 3: Concurrent File Uploads
  stressFileUploads(data.baseUrl);
  
  // Stress test 4: Database Stress
  stressDatabase(data.baseUrl);
  
  // Stress test 5: Memory Stress
  stressMemory(data.baseUrl);
  
  sleep(0.5); // Reduced sleep for higher stress
}

// Stress test: Rapid health checks
function stressHealthChecks(baseUrl) {
  const startTime = Date.now();
  
  for (let i = 0; i < 5; i++) {
    const response = http.get(`${baseUrl}/api/health`);
    
    const success = check(response, {
      'stress health check status is 200': (r) => r.status === 200,
      'stress health check response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  }
  
  const totalTime = Date.now() - startTime;
  stressLevel.add(totalTime);
}

// Stress test: Heavy text analysis
function stressTextAnalysis(baseUrl, text) {
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
    'stress text upload status is 200': (r) => r.status === 200,
    'stress text upload response time < 10s': (r) => r.timings.duration < 10000,
    'stress text upload returns session ID': (r) => r.json('sessionId') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  // If upload successful, stress test analysis
  if (success && response.json('sessionId')) {
    const sessionId = response.json('sessionId');
    stressAnalysisPolling(baseUrl, sessionId);
  }
}

// Stress test: Analysis polling
function stressAnalysisPolling(baseUrl, sessionId) {
  const maxAttempts = 10;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const response = http.get(`${baseUrl}/api/analysis/${sessionId}`);
    
    const success = check(response, {
      'stress analysis status is 200': (r) => r.status === 200,
      'stress analysis response time < 5s': (r) => r.timings.duration < 5000,
    });
    
    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
    
    if (response.json('status') === 'completed') {
      break;
    }
    
    attempts++;
    sleep(0.1);
  }
}

// Stress test: Concurrent file uploads
function stressFileUploads(baseUrl) {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileContent = 'Stress test file content. '.repeat(1000);
  
  const payload = `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="stress_test.txt"\r\n` +
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
    'stress file upload status is 200': (r) => r.status === 200,
    'stress file upload response time < 8s': (r) => r.timings.duration < 8000,
    'stress file upload returns file ID': (r) => r.json('data.file_id') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// Stress test: Database operations
function stressDatabase(baseUrl) {
  // Test analytics endpoint with high frequency
  for (let i = 0; i < 3; i++) {
    const payload = JSON.stringify({
      event: 'stress_test',
      page: `/stress-test-${i}`,
      user_id: `stress_user_${i}`,
      timestamp: Date.now(),
      data: {
        stress_level: 'high',
        iteration: i,
        random_data: Math.random().toString(36).substring(7)
      }
    });
    
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = http.post(`${baseUrl}/api/analytics`, payload, params);
    
    const success = check(response, {
      'stress analytics status is 200': (r) => r.status === 200,
      'stress analytics response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  }
}

// Stress test: Memory operations
function stressMemory(baseUrl) {
  // Create large payload to stress memory
  const largeData = {
    large_array: Array(1000).fill(0).map((_, i) => ({
      id: i,
      data: Math.random().toString(36).substring(7),
      timestamp: Date.now()
    })),
    metadata: {
      test_type: 'memory_stress',
      size: 'large',
      created_at: new Date().toISOString()
    }
  };
  
  const payload = JSON.stringify(largeData);
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(`${baseUrl}/api/analytics`, payload, params);
  
  const success = check(response, {
    'stress memory status is 200': (r) => r.status === 200,
    'stress memory response time < 3s': (r) => r.timings.duration < 3000,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// Teardown function
export function teardown(data) {
  console.log('Stress test teardown completed');
}

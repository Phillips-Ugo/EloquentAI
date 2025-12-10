import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');
export const requestCount = new Counter('requests');
export const spikeLevel = new Trend('spike_level');

// Spike test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Normal load
    { duration: '30s', target: 100 }, // Spike to 100 users
    { duration: '1m', target: 10 },   // Back to normal
    { duration: '30s', target: 200 }, // Spike to 200 users
    { duration: '1m', target: 10 },   // Back to normal
    { duration: '30s', target: 500 }, // Extreme spike to 500 users
    { duration: '2m', target: 10 },   // Recovery
  ],
  thresholds: {
    http_req_duration: ['p(95)<10000'], // 95% of requests must complete below 10s
    http_req_failed: ['rate<0.3'],     // Error rate must be below 30%
    errors: ['rate<0.3'],              // Custom error rate below 30%
  },
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';

// Spike test data
const spikeTexts = [
  'Spike test text for sudden load increase. '.repeat(50),
  'Another spike test with different content. '.repeat(75),
  'Quick spike test. '.repeat(25),
];

// Setup function
export function setup() {
  console.log('Starting spike test setup...');
  
  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`);
  if (healthResponse.status !== 200) {
    throw new Error('Health check failed');
  }
  
  console.log('Spike test setup completed');
  return { baseUrl: BASE_URL };
}

// Main spike test function
export default function(data) {
  const text = spikeTexts[Math.floor(Math.random() * spikeTexts.length)];
  
  // Spike test 1: Sudden Health Check Burst
  spikeHealthChecks(data.baseUrl);
  
  // Spike test 2: Text Analysis Spike
  spikeTextAnalysis(data.baseUrl, text);
  
  // Spike test 3: File Upload Spike
  spikeFileUploads(data.baseUrl);
  
  // Spike test 4: Analytics Spike
  spikeAnalytics(data.baseUrl);
  
  // Spike test 5: WebSocket Spike
  spikeWebSocket(data.baseUrl);
  
  sleep(0.1); // Minimal sleep for spike testing
}

// Spike test: Sudden health check burst
function spikeHealthChecks(baseUrl) {
  const startTime = Date.now();
  
  // Burst of health checks
  for (let i = 0; i < 10; i++) {
    const response = http.get(`${baseUrl}/api/health`);
    
    const success = check(response, {
      'spike health check status is 200': (r) => r.status === 200,
      'spike health check response time < 5s': (r) => r.timings.duration < 5000,
    });
    
    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  }
  
  const totalTime = Date.now() - startTime;
  spikeLevel.add(totalTime);
}

// Spike test: Text analysis spike
function spikeTextAnalysis(baseUrl, text) {
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
    'spike text upload status is 200': (r) => r.status === 200,
    'spike text upload response time < 15s': (r) => r.timings.duration < 15000,
    'spike text upload returns session ID': (r) => r.json('sessionId') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  // If upload successful, spike test analysis
  if (success && response.json('sessionId')) {
    const sessionId = response.json('sessionId');
    spikeAnalysisPolling(baseUrl, sessionId);
  }
}

// Spike test: Analysis polling spike
function spikeAnalysisPolling(baseUrl, sessionId) {
  const maxAttempts = 5;
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const response = http.get(`${baseUrl}/api/analysis/${sessionId}`);
    
    const success = check(response, {
      'spike analysis status is 200': (r) => r.status === 200,
      'spike analysis response time < 10s': (r) => r.timings.duration < 10000,
    });
    
    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
    
    if (response.json('status') === 'completed') {
      break;
    }
    
    attempts++;
    sleep(0.05);
  }
}

// Spike test: File upload spike
function spikeFileUploads(baseUrl) {
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileContent = 'Spike test file content. '.repeat(500);
  
  const payload = `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="spike_test.txt"\r\n` +
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
    'spike file upload status is 200': (r) => r.status === 200,
    'spike file upload response time < 12s': (r) => r.timings.duration < 12000,
    'spike file upload returns file ID': (r) => r.json('data.file_id') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
}

// Spike test: Analytics spike
function spikeAnalytics(baseUrl) {
  // Burst of analytics requests
  for (let i = 0; i < 5; i++) {
    const payload = JSON.stringify({
      event: 'spike_test',
      page: `/spike-test-${i}`,
      user_id: `spike_user_${i}`,
      timestamp: Date.now(),
      data: {
        spike_level: 'high',
        iteration: i,
        burst_data: Math.random().toString(36).substring(7)
      }
    });
    
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = http.post(`${baseUrl}/api/analytics`, payload, params);
    
    const success = check(response, {
      'spike analytics status is 200': (r) => r.status === 200,
      'spike analytics response time < 5s': (r) => r.timings.duration < 5000,
    });
    
    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  }
}

// Spike test: WebSocket spike
function spikeWebSocket(baseUrl) {
  // Burst of WebSocket health checks
  for (let i = 0; i < 3; i++) {
    const response = http.get(`${baseUrl}/ws-health`);
    
    const success = check(response, {
      'spike WebSocket health status is 200': (r) => r.status === 200,
      'spike WebSocket health response time < 3s': (r) => r.timings.duration < 3000,
    });
    
    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  }
}

// Teardown function
export function teardown(data) {
  console.log('Spike test teardown completed');
}

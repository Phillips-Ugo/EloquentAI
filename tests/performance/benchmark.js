import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');
export const requestCount = new Counter('requests');
export const throughput = new Trend('throughput');

// Benchmark test configuration
export const options = {
  stages: [
    { duration: '30s', target: 1 },   // Single user baseline
    { duration: '1m', target: 1 },    // Stay at 1 user
    { duration: '30s', target: 5 },   // Ramp to 5 users
    { duration: '1m', target: 5 },    // Stay at 5 users
    { duration: '30s', target: 10 },  // Ramp to 10 users
    { duration: '1m', target: 10 },   // Stay at 10 users
    { duration: '30s', target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(50)<500', 'p(95)<1000', 'p(99)<2000'],
    http_req_failed: ['rate<0.01'],
    errors: ['rate<0.01'],
    throughput: ['rate>10'],
  },
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'http://localhost:5001';

// Benchmark test data
const benchmarkTexts = [
  'This is a benchmark test text for performance measurement.',
  'Another benchmark text with different content for testing.',
  'Short benchmark text for quick testing.',
];

// Setup function
export function setup() {
  console.log('Starting benchmark test setup...');
  
  // Health check
  const healthResponse = http.get(`${BASE_URL}/api/health`);
  if (healthResponse.status !== 200) {
    throw new Error('Health check failed');
  }
  
  console.log('Benchmark test setup completed');
  return { baseUrl: BASE_URL };
}

// Main benchmark test function
export default function(data) {
  const text = benchmarkTexts[Math.floor(Math.random() * benchmarkTexts.length)];
  
  // Benchmark 1: Health Check Performance
  benchmarkHealthCheck(data.baseUrl);
  
  // Benchmark 2: Text Upload Performance
  benchmarkTextUpload(data.baseUrl, text);
  
  // Benchmark 3: File Upload Performance
  benchmarkFileUpload(data.baseUrl);
  
  // Benchmark 4: Analytics Performance
  benchmarkAnalytics(data.baseUrl);
  
  // Benchmark 5: Database Query Performance
  benchmarkDatabase(data.baseUrl);
  
  sleep(1);
}

// Benchmark: Health check performance
function benchmarkHealthCheck(baseUrl) {
  const startTime = Date.now();
  
  const response = http.get(`${baseUrl}/api/health`);
  
  const success = check(response, {
    'benchmark health check status is 200': (r) => r.status === 200,
    'benchmark health check response time < 100ms': (r) => r.timings.duration < 100,
    'benchmark health check response time < 50ms': (r) => r.timings.duration < 50,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  throughput.add(1000 / duration); // Requests per second
}

// Benchmark: Text upload performance
function benchmarkTextUpload(baseUrl, text) {
  const startTime = Date.now();
  
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
    'benchmark text upload status is 200': (r) => r.status === 200,
    'benchmark text upload response time < 1s': (r) => r.timings.duration < 1000,
    'benchmark text upload response time < 500ms': (r) => r.timings.duration < 500,
    'benchmark text upload returns session ID': (r) => r.json('sessionId') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  throughput.add(1000 / duration);
  
  // If upload successful, benchmark analysis
  if (success && response.json('sessionId')) {
    const sessionId = response.json('sessionId');
    benchmarkTextAnalysis(baseUrl, sessionId);
  }
}

// Benchmark: Text analysis performance
function benchmarkTextAnalysis(baseUrl, sessionId) {
  const startTime = Date.now();
  
  const response = http.get(`${baseUrl}/api/analysis/${sessionId}`);
  
  const success = check(response, {
    'benchmark text analysis status is 200': (r) => r.status === 200,
    'benchmark text analysis response time < 2s': (r) => r.timings.duration < 2000,
    'benchmark text analysis response time < 1s': (r) => r.timings.duration < 1000,
    'benchmark text analysis returns results': (r) => r.json('success') === true,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  throughput.add(1000 / duration);
}

// Benchmark: File upload performance
function benchmarkFileUpload(baseUrl) {
  const startTime = Date.now();
  
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const fileContent = 'Benchmark test file content for performance measurement.';
  
  const payload = `--${boundary}\r\n` +
    `Content-Disposition: form-data; name="file"; filename="benchmark_test.txt"\r\n` +
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
    'benchmark file upload status is 200': (r) => r.status === 200,
    'benchmark file upload response time < 500ms': (r) => r.timings.duration < 500,
    'benchmark file upload response time < 200ms': (r) => r.timings.duration < 200,
    'benchmark file upload returns file ID': (r) => r.json('data.file_id') !== undefined,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  throughput.add(1000 / duration);
}

// Benchmark: Analytics performance
function benchmarkAnalytics(baseUrl) {
  const startTime = Date.now();
  
  const payload = JSON.stringify({
    event: 'benchmark_test',
    page: '/benchmark',
    user_id: 'benchmark_user',
    timestamp: Date.now(),
    data: {
      test_type: 'performance',
      benchmark: true
    }
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = http.post(`${baseUrl}/api/analytics`, payload, params);
  
  const success = check(response, {
    'benchmark analytics status is 200': (r) => r.status === 200,
    'benchmark analytics response time < 100ms': (r) => r.timings.duration < 100,
    'benchmark analytics response time < 50ms': (r) => r.timings.duration < 50,
    'benchmark analytics returns success': (r) => r.json('success') === true,
  });
  
  errorRate.add(!success);
  responseTime.add(response.timings.duration);
  requestCount.add(1);
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  throughput.add(1000 / duration);
}

// Benchmark: Database query performance
function benchmarkDatabase(baseUrl) {
  const startTime = Date.now();
  
  // Test multiple analytics requests to benchmark database performance
  for (let i = 0; i < 3; i++) {
    const payload = JSON.stringify({
      event: 'benchmark_db_test',
      page: `/benchmark-db-${i}`,
      user_id: `benchmark_user_${i}`,
      timestamp: Date.now(),
      data: {
        test_type: 'database_performance',
        iteration: i
      }
    });
    
    const params = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    const response = http.post(`${baseUrl}/api/analytics`, payload, params);
    
    const success = check(response, {
      'benchmark database status is 200': (r) => r.status === 200,
      'benchmark database response time < 200ms': (r) => r.timings.duration < 200,
      'benchmark database response time < 100ms': (r) => r.timings.duration < 100,
    });
    
    errorRate.add(!success);
    responseTime.add(response.timings.duration);
    requestCount.add(1);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  throughput.add(3000 / duration); // 3 requests per duration
}

// Teardown function
export function teardown(data) {
  console.log('Benchmark test teardown completed');
}

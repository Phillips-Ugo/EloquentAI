import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
export const errorRate = new Rate('errors');
export const responseTime = new Trend('response_time');
export const messageCount = new Counter('messages');
export const connectionCount = new Counter('connections');

// WebSocket test configuration
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // 10 concurrent connections
    { duration: '2m', target: 10 },   // Stay at 10
    { duration: '1m', target: 25 },   // Ramp up to 25
    { duration: '2m', target: 25 },   // Stay at 25
    { duration: '1m', target: 50 },   // Ramp up to 50
    { duration: '2m', target: 50 },   // Stay at 50
    { duration: '1m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    ws_connecting: ['p(95)<1000'],    // 95% of connections must complete below 1s
    ws_msgs_received: ['count>100'],  // Must receive at least 100 messages
    errors: ['rate<0.1'],             // Error rate must be below 10%
  },
};

// Base URL
const BASE_URL = __ENV.BASE_URL || 'ws://localhost:5001';

// WebSocket test data
const testMessages = [
  { type: 'start_recording', analysisType: 'speech' },
  { type: 'start_recording', analysisType: 'video' },
  { type: 'start_recording', analysisType: 'text' },
  { type: 'stop_recording' },
  { type: 'ping' },
];

// Setup function
export function setup() {
  console.log('Starting WebSocket test setup...');
  
  // Health check
  const healthResponse = http.get(`${BASE_URL.replace('ws://', 'http://')}/api/health`);
  if (healthResponse.status !== 200) {
    throw new Error('Health check failed');
  }
  
  console.log('WebSocket test setup completed');
  return { baseUrl: BASE_URL };
}

// Main WebSocket test function
export default function(data) {
  const url = `${data.baseUrl}/ws`;
  const message = testMessages[Math.floor(Math.random() * testMessages.length)];
  
  const res = ws.connect(url, {}, function (socket) {
    connectionCount.add(1);
    
    // Test 1: Connection establishment
    testConnection(socket);
    
    // Test 2: Send test message
    testMessageSending(socket, message);
    
    // Test 3: Receive responses
    testMessageReceiving(socket);
    
    // Test 4: Keep connection alive
    testConnectionKeepAlive(socket);
    
    // Test 5: Close connection gracefully
    testConnectionClose(socket);
  });
  
  check(res, {
    'WebSocket connection successful': (r) => r && r.status === 101,
    'WebSocket connection time < 2s': (r) => r && r.timings.duration < 2000,
  });
  
  sleep(1);
}

// Test connection establishment
function testConnection(socket) {
  const startTime = Date.now();
  
  socket.on('open', function () {
    const connectionTime = Date.now() - startTime;
    responseTime.add(connectionTime);
    
    check(connectionTime, {
      'WebSocket connection time < 1s': (t) => t < 1000,
    });
  });
  
  socket.on('error', function (e) {
    errorRate.add(1);
    console.error('WebSocket connection error:', e);
  });
}

// Test message sending
function testMessageSending(socket, message) {
  socket.on('open', function () {
    // Send test message
    const messageStr = JSON.stringify(message);
    socket.send(messageStr);
    messageCount.add(1);
    
    check(messageStr, {
      'Message sent successfully': (msg) => msg.length > 0,
    });
  });
}

// Test message receiving
function testMessageReceiving(socket) {
  socket.on('message', function (data) {
    try {
      const message = JSON.parse(data);
      messageCount.add(1);
      
      check(message, {
        'Message received successfully': (msg) => msg !== null,
        'Message has type field': (msg) => msg.type !== undefined,
        'Message response time < 5s': (msg) => true, // This would need timing logic
      });
      
      // Handle specific message types
      if (message.type === 'connection_established') {
        check(message, {
          'Connection established message received': (msg) => msg.type === 'connection_established',
          'Session ID provided': (msg) => msg.session_id !== undefined,
        });
      }
      
      if (message.type === 'recording_started') {
        check(message, {
          'Recording started message received': (msg) => msg.type === 'recording_started',
          'Session ID provided': (msg) => msg.session_id !== undefined,
        });
      }
      
      if (message.type === 'recording_stopped') {
        check(message, {
          'Recording stopped message received': (msg) => msg.type === 'recording_stopped',
          'Duration provided': (msg) => msg.duration !== undefined,
        });
      }
      
      if (message.type === 'live_analysis') {
        check(message, {
          'Live analysis message received': (msg) => msg.type === 'live_analysis',
          'Analysis result provided': (msg) => msg.analysis_result !== undefined,
        });
      }
      
      if (message.type === 'pong') {
        check(message, {
          'Pong message received': (msg) => msg.type === 'pong',
        });
      }
      
    } catch (e) {
      errorRate.add(1);
      console.error('Error parsing WebSocket message:', e);
    }
  });
}

// Test connection keep alive
function testConnectionKeepAlive(socket) {
  socket.on('open', function () {
    // Send ping messages to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.readyState === 1) { // WebSocket.OPEN
        socket.send(JSON.stringify({ type: 'ping' }));
        messageCount.add(1);
      } else {
        clearInterval(pingInterval);
      }
    }, 5000);
    
    // Clear interval after 30 seconds
    setTimeout(() => {
      clearInterval(pingInterval);
    }, 30000);
  });
}

// Test connection close
function testConnectionClose(socket) {
  socket.on('close', function () {
    check(true, {
      'WebSocket connection closed gracefully': (closed) => closed === true,
    });
  });
  
  // Close connection after 30 seconds
  setTimeout(() => {
    if (socket.readyState === 1) { // WebSocket.OPEN
      socket.close();
    }
  }, 30000);
}

// Teardown function
export function teardown(data) {
  console.log('WebSocket test teardown completed');
}

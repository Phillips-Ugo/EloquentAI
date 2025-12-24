const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const uploadRoutes = require('./routes/upload');
const analysisRoutes = require('./routes/analysis');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Middleware
app.use(cors({
  origin: true, // Allow all origins for debugging
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Cache-Control', 'Pragma', 'Expires']
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/health', healthRoutes);

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ 
  server,
  path: '/ws',
  perMessageDeflate: false
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  const clientId = req.url.split('?')[1]?.split('=')[1] || `client_${Date.now()}`;
  console.log(`✅ WebSocket client connected: ${clientId}`);
  
  ws.clientId = clientId;
  ws.isAlive = true;
  
  // Handle ping/pong for connection keepalive
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`📨 Received message from ${clientId}:`, data.type || 'unknown');
      
      // Echo back or process message
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      } else if (data.type === 'video_data' || data.type === 'audio_data') {
        // Process real-time data
        ws.send(JSON.stringify({ 
          type: 'ack', 
          messageId: data.messageId,
          timestamp: Date.now() 
        }));
      } else if (data.type === 'feedback_request') {
        // Send feedback
        ws.send(JSON.stringify({
          type: 'feedback',
          message: 'Analysis is running smoothly',
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('❌ Error processing WebSocket message:', error);
    }
  });
  
  // Handle connection close
  ws.on('close', (code, reason) => {
    console.log(`🔌 WebSocket client disconnected: ${clientId} (code: ${code})`);
  });
  
  // Handle errors
  ws.on('error', (error) => {
    console.error(`❌ WebSocket error for ${clientId}:`, error);
  });
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    clientId: clientId,
    timestamp: Date.now(),
    message: 'WebSocket connection established'
  }));
});

// Keepalive ping interval
const pingInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log(`⚠️ Terminating inactive WebSocket connection: ${ws.clientId}`);
      return ws.terminate();
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // Ping every 30 seconds

// Cleanup on server shutdown
process.on('SIGTERM', () => {
  clearInterval(pingInterval);
  wss.close();
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Eloquent AI Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}/ws`);
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 Frontend: http://localhost:3000`);
  }
});

module.exports = { app, server, wss }; 
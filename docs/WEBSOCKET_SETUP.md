# WebSocket Server Setup Guide

## 🔌 Real-Time Communication Analysis Connection Fix

This guide will help you fix the connection issue in the Real-Time Communication Analysis feature.

## 🚀 Quick Start

### Option 1: Using npm scripts (Recommended)
```bash
# Start all services including WebSocket server
npm run dev

# Or start WebSocket server separately
npm run websocket
```

### Option 2: Manual startup
```bash
# Start WebSocket server directly
node server/websocket-server.js

# Or use the batch file (Windows)
start-websocket.bat
```

## 🔧 What Was Fixed

### 1. **WebSocket Server Created**
- **File**: `server/websocket-server.js`
- **Port**: 8765
- **Features**:
  - Real-time client connection management
  - Session handling
  - Simulated analysis results
  - Health check endpoint
  - Graceful error handling

### 2. **Enhanced Connection Logic**
- **File**: `client/src/components/RealTimeVideoAnalysis.js`
- **Improvements**:
  - Better error messages
  - Manual retry button
  - Connection health checks
  - Automatic reconnection logic

### 3. **Updated Package Scripts**
- **File**: `package.json`
- **New Script**: `npm run websocket`
- **Updated**: `npm run dev` now includes WebSocket server

## 📊 WebSocket Server Features

### **Connection Management**
- ✅ Client connection tracking
- ✅ Session management
- ✅ Automatic cleanup on disconnect
- ✅ Health monitoring

### **Message Handling**
- ✅ `start_session` - Begin analysis session
- ✅ `frame_data` - Process video frames
- ✅ `end_session` - End analysis session
- ✅ `ping/pong` - Connection health checks

### **Simulated Analysis**
- ✅ Real-time score generation
- ✅ Feedback suggestions
- ✅ Session summaries
- ✅ Performance metrics

## 🛠️ Troubleshooting

### **Connection Issues**

#### Problem: "Connection lost. Attempting to reconnect..."
**Solution**: 
1. Make sure WebSocket server is running: `npm run websocket`
2. Check if port 8765 is available
3. Try the "Retry Connection" button in the UI

#### Problem: "Connection error. Please check if the WebSocket server is running on port 8765"
**Solution**:
1. Start the WebSocket server: `node server/websocket-server.js`
2. Check the console for server startup messages
3. Verify the server is listening on port 8765

#### Problem: "Failed to connect to analysis server"
**Solution**:
1. Check if Node.js is installed: `node --version`
2. Install dependencies: `npm install`
3. Start the server manually: `node server/websocket-server.js`

### **Server Issues**

#### Problem: Port 8765 already in use
**Solution**:
1. Find and kill the process using port 8765:
   ```bash
   # Windows
   netstat -ano | findstr :8765
   taskkill /PID <PID> /F
   
   # macOS/Linux
   lsof -ti:8765 | xargs kill -9
   ```

#### Problem: Server won't start
**Solution**:
1. Check Node.js version: `node --version` (should be 18+)
2. Install dependencies: `npm install`
3. Check for syntax errors in the server file

## 🔍 Health Check

### **WebSocket Server Health**
Visit: `http://localhost:8765/health`

Expected response:
```json
{
  "status": "healthy",
  "clients": 0,
  "sessions": 0,
  "uptime": 123.45
}
```

### **Connection Test**
1. Open browser developer tools
2. Go to Console tab
3. Look for WebSocket connection messages:
   - ✅ "WebSocket connected successfully"
   - ❌ "WebSocket error" or "Connection error"

## 📱 Usage Instructions

### **1. Start the WebSocket Server**
```bash
npm run websocket
```

### **2. Start the Frontend**
```bash
npm run client
```

### **3. Access Real-Time Analysis**
1. Go to `http://localhost:3000`
2. Navigate to Real-Time Analysis page
3. Check connection status (should show "Connected")
4. Click "Start Analysis" to begin

### **4. Monitor the Session**
- **Connection Status**: Green dot = Connected, Red dot = Disconnected
- **Session Info**: Shows session ID, duration, frames processed
- **Live Feedback**: Real-time analysis results and suggestions
- **Scores**: Overall, posture, eye contact, and gesture scores

## 🎯 Expected Behavior

### **When Connected**
- ✅ Green connection indicator
- ✅ "Start Analysis" button enabled
- ✅ Real-time feedback appears
- ✅ Session information updates

### **When Disconnected**
- ❌ Red connection indicator
- ❌ "Start Analysis" button disabled
- ❌ Error message with retry button
- ❌ No real-time feedback

## 🔧 Development Notes

### **WebSocket Server Architecture**
- **Port**: 8765
- **Protocol**: WebSocket (ws://)
- **Message Format**: JSON
- **Client Management**: Map-based with session tracking
- **Analysis**: Simulated with realistic data

### **Client Integration**
- **Connection**: Automatic on component mount
- **Reconnection**: Automatic with 3-second delay
- **Error Handling**: User-friendly messages with retry options
- **Health Checks**: Ping/pong mechanism

## 🚀 Production Deployment

For production deployment, consider:
1. **Load Balancing**: Multiple WebSocket server instances
2. **SSL/TLS**: Use `wss://` instead of `ws://`
3. **Authentication**: Add client authentication
4. **Monitoring**: Add comprehensive logging and metrics
5. **Scaling**: Use Redis for session management across instances

## 📞 Support

If you continue to experience connection issues:
1. Check the browser console for error messages
2. Verify the WebSocket server is running
3. Test the health endpoint: `http://localhost:8765/health`
4. Try restarting both the WebSocket server and the frontend

---

**The connection issue has been fixed!** 🎉 The WebSocket server now provides a stable connection for real-time communication analysis.

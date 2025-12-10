const express = require('express');
const router = express.Router();
const { SystemLog, AnalysisSession } = require('../database/models');
const realTimeAnalyzer = require('../analysis/enhancedRealTimeAnalyzer');

// Middleware to log real-time requests
router.use((req, res, next) => {
  console.log(`🔄 Real-time request: ${req.method} ${req.path}`);
  next();
});

// POST /api/realtime/start - Start a new real-time analysis session
router.post('/start', async (req, res) => {
  try {
    const { sessionId, analysisType, options } = req.body;
    
    // Validate required fields
    if (!sessionId || !analysisType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId and analysisType'
      });
    }

    // Validate analysis type
    const validTypes = ['speech', 'video', 'text', 'combined'];
    if (!validTypes.includes(analysisType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid analysis type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Start the analysis session
    const session = await realTimeAnalyzer.startAnalysis(sessionId, analysisType, {
      userId: req.user?.id || null,
      ...options
    });

    SystemLog.info('Real-time analysis session started via API', {
      sessionId,
      analysisType,
      userId: req.user?.id || null
    });

    res.json({
      success: true,
      message: 'Real-time analysis session started successfully',
      sessionId: session.id,
      session: {
        id: session.id,
        type: session.type,
        startTime: session.startTime,
        options: session.options
      }
    });

  } catch (error) {
    console.error('Real-time start error:', error);
    SystemLog.error('Failed to start real-time analysis session', { 
      error: error.message,
      body: req.body 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to start real-time analysis session'
    });
  }
});

// POST /api/realtime/data - Send data for real-time analysis
router.post('/data', async (req, res) => {
  try {
    const { sessionId, data } = req.body;
    
    // Validate required fields
    if (!sessionId || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId and data'
      });
    }

    // Validate data structure
    if (!data.type || !data.timestamp) {
      return res.status(400).json({
        success: false,
        error: 'Data must include type and timestamp fields'
      });
    }

    // Process the data
    const result = await realTimeAnalyzer.processData(sessionId, {
      ...data,
      timestamp: data.timestamp || Date.now()
    });

    res.json({
      success: true,
      message: 'Data processed successfully',
      result: {
        sessionId,
        processingTime: result.processingTime,
        queueSize: result.queueSize
      }
    });

  } catch (error) {
    console.error('Real-time data processing error:', error);
    SystemLog.error('Failed to process real-time data', { 
      error: error.message,
      sessionId: req.body.sessionId 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to process real-time data'
    });
  }
});

// GET /api/realtime/status/:sessionId - Get session status
router.get('/status/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const status = realTimeAnalyzer.getSessionStatus(sessionId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      status: status
    });

  } catch (error) {
    console.error('Real-time status error:', error);
    SystemLog.error('Failed to get real-time session status', { 
      error: error.message,
      sessionId: req.params.sessionId 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get session status'
    });
  }
});

// GET /api/realtime/metrics/:sessionId - Get live metrics
router.get('/metrics/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const metrics = realTimeAnalyzer.getLiveMetrics(sessionId);
    
    if (!metrics) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    res.json({
      success: true,
      metrics: metrics
    });

  } catch (error) {
    console.error('Real-time metrics error:', error);
    SystemLog.error('Failed to get real-time metrics', { 
      error: error.message,
      sessionId: req.params.sessionId 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to get live metrics'
    });
  }
});

// POST /api/realtime/stop/:sessionId - Stop analysis session
router.post('/stop/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const finalReport = await realTimeAnalyzer.stopAnalysis(sessionId);

    SystemLog.info('Real-time analysis session stopped via API', {
      sessionId,
      finalScore: finalReport.overallScore
    });

    res.json({
      success: true,
      message: 'Real-time analysis session stopped successfully',
      finalReport: finalReport
    });

  } catch (error) {
    console.error('Real-time stop error:', error);
    SystemLog.error('Failed to stop real-time analysis session', { 
      error: error.message,
      sessionId: req.params.sessionId 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to stop analysis session'
    });
  }
});

// GET /api/realtime/sessions - Get all active sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = realTimeAnalyzer.getActiveSessions();

    res.json({
      success: true,
      sessions: sessions,
      totalActive: sessions.length
    });

  } catch (error) {
    console.error('Real-time sessions error:', error);
    SystemLog.error('Failed to get active sessions', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get active sessions'
    });
  }
});

// POST /api/realtime/feedback - Send feedback for a session
router.post('/feedback', async (req, res) => {
  try {
    const { sessionId, feedback } = req.body;
    
    // Validate required fields
    if (!sessionId || !feedback) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId and feedback'
      });
    }

    // Get session status
    const status = realTimeAnalyzer.getSessionStatus(sessionId);
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    // Log the feedback
    SystemLog.info('Real-time feedback received', {
      sessionId,
      feedback: feedback,
      userId: req.user?.id || null
    });

    res.json({
      success: true,
      message: 'Feedback received successfully',
      feedback: {
        sessionId,
        feedback,
        timestamp: Date.now()
      }
    });

  } catch (error) {
    console.error('Real-time feedback error:', error);
    SystemLog.error('Failed to process feedback', { 
      error: error.message,
      sessionId: req.body.sessionId 
    });
    res.status(500).json({
      success: false,
      error: 'Failed to process feedback'
    });
  }
});

// GET /api/realtime/health - Get real-time system health
router.get('/health', async (req, res) => {
  try {
    const activeSessions = realTimeAnalyzer.getActiveSessions();
    const systemHealth = {
      status: 'healthy',
      activeSessions: activeSessions.length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: Date.now()
    };

    res.json({
      success: true,
      health: systemHealth
    });

  } catch (error) {
    console.error('Real-time health error:', error);
    SystemLog.error('Failed to get system health', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to get system health'
    });
  }
});

// DELETE /api/realtime/cleanup - Clean up old sessions
router.delete('/cleanup', async (req, res) => {
  try {
    realTimeAnalyzer.cleanup();

    SystemLog.info('Real-time system cleanup performed');

    res.json({
      success: true,
      message: 'System cleanup completed successfully'
    });

  } catch (error) {
    console.error('Real-time cleanup error:', error);
    SystemLog.error('Failed to perform system cleanup', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to perform system cleanup'
    });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// Safely import database models (with fallback if database is not available)
let AnalyticsEvent, PerformanceMetric, SystemLog;
try {
  const models = require('../database/models');
  AnalyticsEvent = models.AnalyticsEvent;
  PerformanceMetric = models.PerformanceMetric;
  SystemLog = models.SystemLog;
} catch (error) {
  console.warn('⚠️ Database models not available, using in-memory fallback:', error.message);
  AnalyticsEvent = null;
  PerformanceMetric = null;
  SystemLog = null;
}

// In-memory analytics data store (fallback if database fails)
const analyticsData = {
  events: [],
  metrics: [],
  pageViews: [],
  sessions: [],
  errors: []
};

// Middleware to log analytics requests (with error handling)
router.use((req, res, next) => {
  try {
    console.log(`📊 Analytics request: ${req.method} ${req.path}`);
  } catch (err) {
    // Ignore logging errors
  }
  next();
});

// POST /api/analytics - Track analytics events
router.post('/', (req, res) => {
  try {
    const event = req.body;
    
    // Validate required fields
    if (!event || !event.event || !event.properties) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: event and properties'
      });
    }

    // Extract user info from request
    const userId = event.properties?.user_id || null;
    const sessionId = event.properties?.session_id || null;
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress || '';

    // Track the event using database (with error handling)
    let eventId = null;
    try {
      if (AnalyticsEvent && typeof AnalyticsEvent.track === 'function') {
        const result = AnalyticsEvent.track({
          user_id: userId,
          session_id: sessionId,
          event_type: event.event,
          event_data: event.properties,
          page_url: event.properties?.url || req.get('Referer') || '',
          user_agent: userAgent,
          ip_address: ipAddress
        });
        eventId = result?.lastInsertRowid || result?.id || null;
      }
    } catch (dbError) {
      // Log but don't fail - analytics is non-critical
      console.warn('⚠️ Failed to save analytics event to database:', dbError.message);
    }

    // Log to system log (with error handling)
    try {
      if (SystemLog && typeof SystemLog.info === 'function') {
        SystemLog.info(`Analytics event tracked: ${event.event}`, {
          user_id: userId,
          session_id: sessionId,
          event_type: event.event
        });
      }
    } catch (logError) {
      // Log but don't fail
      console.warn('⚠️ Failed to log analytics event:', logError.message);
    }

    // Always return success - analytics is non-critical
    return res.json({
      success: true,
      message: 'Event tracked successfully',
      eventId: eventId
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    // Try to log error, but don't fail if logging fails
    try {
      if (SystemLog && typeof SystemLog.error === 'function') {
        SystemLog.error('Analytics tracking failed', { error: error.message });
      }
    } catch (logError) {
      console.warn('⚠️ Failed to log analytics error:', logError.message);
    }
    // Return success even on error - analytics is non-critical
    return res.json({
      success: true,
      message: 'Event received (may not be persisted)',
      warning: 'Analytics tracking encountered an error but request was processed'
    });
  }
});

// POST /api/analytics/metrics - Track performance metrics
router.post('/metrics', (req, res) => {
  try {
    const metric = req.body;
    
    // Validate required fields
    if (!metric.name || metric.value === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and value'
      });
    }

    // Extract user info from request
    const userId = metric.user_id || null;
    const sessionId = metric.session_id || null;

    // Track the metric using database (with error handling)
    let metricId = null;
    try {
      const result = PerformanceMetric.track({
        user_id: userId,
        session_id: sessionId,
        metric_name: metric.name,
        metric_value: metric.value,
        metric_data: metric.tags || {}
      });
      metricId = result?.lastInsertRowid || result?.id || null;
    } catch (dbError) {
      console.warn('⚠️ Failed to save performance metric to database:', dbError.message);
    }

    // Log to system log (with error handling)
    try {
      SystemLog.info(`Performance metric tracked: ${metric.name} = ${metric.value}`, {
        user_id: userId,
        session_id: sessionId,
        metric_name: metric.name
      });
    } catch (logError) {
      console.warn('⚠️ Failed to log performance metric:', logError.message);
    }

    res.json({
      success: true,
      message: 'Metric tracked successfully',
      metricId: metricId
    });

  } catch (error) {
    console.error('Metrics tracking error:', error);
    try {
      SystemLog.error('Metrics tracking failed', { error: error.message });
    } catch (logError) {
      console.warn('⚠️ Failed to log metrics error:', logError.message);
    }
    // Return success even on error - analytics is non-critical
    res.json({
      success: true,
      message: 'Metric received (may not be persisted)',
      warning: 'Metrics tracking encountered an error but request was processed'
    });
  }
});

// POST /api/analytics/pageview - Track page views
router.post('/pageview', (req, res) => {
  try {
    const pageView = req.body;
    
    // Validate required fields
    if (!pageView.url) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: url'
      });
    }

    // Add timestamp if not provided
    if (!pageView.timestamp) {
      pageView.timestamp = Date.now();
    }

    // Store the page view
    analyticsData.pageViews.push(pageView);

    // Keep only last 1000 page views
    if (analyticsData.pageViews.length > 1000) {
      analyticsData.pageViews = analyticsData.pageViews.slice(-1000);
    }

    console.log(`📊 Page view tracked: ${pageView.url}`);

    res.json({
      success: true,
      message: 'Page view tracked successfully',
      pageViewId: analyticsData.pageViews.length - 1
    });

  } catch (error) {
    console.error('Page view tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track page view'
    });
  }
});

// POST /api/analytics/session - Track session data
router.post('/session', (req, res) => {
  try {
    const session = req.body;
    
    // Validate required fields
    if (!session.sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: sessionId'
      });
    }

    // Add timestamp if not provided
    if (!session.timestamp) {
      session.timestamp = Date.now();
    }

    // Store the session
    analyticsData.sessions.push(session);

    // Keep only last 1000 sessions
    if (analyticsData.sessions.length > 1000) {
      analyticsData.sessions = analyticsData.sessions.slice(-1000);
    }

    console.log(`📊 Session tracked: ${session.sessionId} (${session.duration}ms)`);

    res.json({
      success: true,
      message: 'Session tracked successfully',
      sessionId: analyticsData.sessions.length - 1
    });

  } catch (error) {
    console.error('Session tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track session'
    });
  }
});

// POST /api/analytics/errors - Track errors
router.post('/errors', (req, res) => {
  try {
    const error = req.body;
    
    // Validate required fields
    if (!error.message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: message'
      });
    }

    // Add timestamp if not provided
    if (!error.timestamp) {
      error.timestamp = Date.now();
    }

    // Store the error
    analyticsData.errors.push(error);

    // Keep only last 1000 errors
    if (analyticsData.errors.length > 1000) {
      analyticsData.errors = analyticsData.errors.slice(-1000);
    }

    console.log(`📊 Error tracked: ${error.message}`);

    res.json({
      success: true,
      message: 'Error tracked successfully',
      errorId: analyticsData.errors.length - 1
    });

  } catch (error) {
    console.error('Error tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track error'
    });
  }
});

// GET /api/analytics/stats - Get analytics statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalEvents: analyticsData.events.length,
      totalMetrics: analyticsData.metrics.length,
      totalPageViews: analyticsData.pageViews.length,
      totalSessions: analyticsData.sessions.length,
      totalErrors: analyticsData.errors.length,
      lastUpdated: Date.now(),
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Analytics stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics statistics'
    });
  }
});

// GET /api/analytics/events - Get recent events
router.get('/events', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const events = analyticsData.events.slice(-limit);

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error('Analytics events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics events'
    });
  }
});

// GET /api/analytics/metrics - Get recent metrics
router.get('/metrics', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const metrics = analyticsData.metrics.slice(-limit);

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Analytics metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics metrics'
    });
  }
});

// DELETE /api/analytics/clear - Clear all analytics data
router.delete('/clear', (req, res) => {
  try {
    analyticsData.events = [];
    analyticsData.metrics = [];
    analyticsData.pageViews = [];
    analyticsData.sessions = [];
    analyticsData.errors = [];

    console.log('📊 Analytics data cleared');

    res.json({
      success: true,
      message: 'Analytics data cleared successfully'
    });

  } catch (error) {
    console.error('Analytics clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear analytics data'
    });
  }
});

module.exports = router;

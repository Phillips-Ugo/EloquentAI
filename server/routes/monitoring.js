const express = require('express');
const router = express.Router();
const os = require('os');
const fs = require('fs');
const path = require('path');

// In-memory storage for monitoring data (in production, use a proper database)
const monitoringData = {
  metrics: [],
  errors: [],
  performance: [],
  system: [],
};

// Middleware to log monitoring requests
router.use((req, res, next) => {
  console.log(`📊 Monitoring request: ${req.method} ${req.path}`);
  next();
});

// POST /api/monitoring/metrics - Track performance metrics
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

    // Add timestamp if not provided
    if (!metric.timestamp) {
      metric.timestamp = Date.now();
    }

    // Add system information
    metric.system = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
    };

    // Store the metric
    monitoringData.metrics.push(metric);

    // Keep only last 1000 metrics
    if (monitoringData.metrics.length > 1000) {
      monitoringData.metrics = monitoringData.metrics.slice(-1000);
    }

    console.log(`📊 Performance metric tracked: ${metric.name} = ${metric.value}`);

    res.json({
      success: true,
      message: 'Metric tracked successfully',
      metricId: monitoringData.metrics.length - 1
    });

  } catch (error) {
    console.error('Metrics tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track performance metric'
    });
  }
});

// POST /api/monitoring/errors - Track errors
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

    // Add system information
    error.system = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // Store the error
    monitoringData.errors.push(error);

    // Keep only last 1000 errors
    if (monitoringData.errors.length > 1000) {
      monitoringData.errors = monitoringData.errors.slice(-1000);
    }

    console.log(`📊 Error tracked: ${error.message}`);

    res.json({
      success: true,
      message: 'Error tracked successfully',
      errorId: monitoringData.errors.length - 1
    });

  } catch (error) {
    console.error('Error tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track error'
    });
  }
});

// POST /api/monitoring/performance - Track performance data
router.post('/performance', (req, res) => {
  try {
    const performance = req.body;
    
    // Validate required fields
    if (!performance.type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: type'
      });
    }

    // Add timestamp if not provided
    if (!performance.timestamp) {
      performance.timestamp = Date.now();
    }

    // Add system information
    performance.system = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: os.cpus(),
    };

    // Store the performance data
    monitoringData.performance.push(performance);

    // Keep only last 1000 performance entries
    if (monitoringData.performance.length > 1000) {
      monitoringData.performance = monitoringData.performance.slice(-1000);
    }

    console.log(`📊 Performance data tracked: ${performance.type}`);

    res.json({
      success: true,
      message: 'Performance data tracked successfully',
      performanceId: monitoringData.performance.length - 1
    });

  } catch (error) {
    console.error('Performance tracking error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track performance data'
    });
  }
});

// GET /api/monitoring/health - Get system health status
router.get('/health', (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: Date.now(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: {
        loadavg: os.loadavg(),
        cpus: os.cpus().length,
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
      },
      monitoring: {
        totalMetrics: monitoringData.metrics.length,
        totalErrors: monitoringData.errors.length,
        totalPerformance: monitoringData.performance.length,
      }
    };

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system health'
    });
  }
});

// GET /api/monitoring/stats - Get monitoring statistics
router.get('/stats', (req, res) => {
  try {
    const stats = {
      totalMetrics: monitoringData.metrics.length,
      totalErrors: monitoringData.errors.length,
      totalPerformance: monitoringData.performance.length,
      lastUpdated: Date.now(),
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
      }
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Monitoring stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitoring statistics'
    });
  }
});

// GET /api/monitoring/metrics - Get recent metrics
router.get('/metrics', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type;
    
    let metrics = monitoringData.metrics;
    
    // Filter by type if specified
    if (type) {
      metrics = metrics.filter(m => m.name === type);
    }
    
    // Get recent metrics
    metrics = metrics.slice(-limit);

    res.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Monitoring metrics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitoring metrics'
    });
  }
});

// GET /api/monitoring/errors - Get recent errors
router.get('/errors', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const errors = monitoringData.errors.slice(-limit);

    res.json({
      success: true,
      data: errors
    });

  } catch (error) {
    console.error('Monitoring errors error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitoring errors'
    });
  }
});

// GET /api/monitoring/performance - Get recent performance data
router.get('/performance', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const type = req.query.type;
    
    let performance = monitoringData.performance;
    
    // Filter by type if specified
    if (type) {
      performance = performance.filter(p => p.type === type);
    }
    
    // Get recent performance data
    performance = performance.slice(-limit);

    res.json({
      success: true,
      data: performance
    });

  } catch (error) {
    console.error('Monitoring performance error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monitoring performance data'
    });
  }
});

// GET /api/monitoring/system - Get system information
router.get('/system', (req, res) => {
  try {
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: {
        loadavg: os.loadavg(),
        cpus: os.cpus(),
      },
      network: os.networkInterfaces(),
      hostname: os.hostname(),
      userInfo: os.userInfo(),
    };

    res.json({
      success: true,
      data: systemInfo
    });

  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get system information'
    });
  }
});

// DELETE /api/monitoring/clear - Clear all monitoring data
router.delete('/clear', (req, res) => {
  try {
    monitoringData.metrics = [];
    monitoringData.errors = [];
    monitoringData.performance = [];
    monitoringData.system = [];

    console.log('📊 Monitoring data cleared');

    res.json({
      success: true,
      message: 'Monitoring data cleared successfully'
    });

  } catch (error) {
    console.error('Monitoring clear error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear monitoring data'
    });
  }
});

// GET /api/monitoring/export - Export monitoring data
router.get('/export', (req, res) => {
  try {
    const exportData = {
      metrics: monitoringData.metrics,
      errors: monitoringData.errors,
      performance: monitoringData.performance,
      system: monitoringData.system,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    };

    res.json({
      success: true,
      data: exportData
    });

  } catch (error) {
    console.error('Monitoring export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export monitoring data'
    });
  }
});

module.exports = router;

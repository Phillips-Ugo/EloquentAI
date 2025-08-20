const express = require('express');
const axios = require('axios');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        server: 'running',
        speech_service: 'unknown',
        video_service: 'unknown'
      }
    };

    // Check Python services
    try {
      await axios.get('http://localhost:8001/health', { timeout: 2000 });
      healthStatus.services.speech_service = 'running';
    } catch (error) {
      healthStatus.services.speech_service = 'stopped';
    }

    try {
      await axios.get('http://localhost:8002/health', { timeout: 2000 });
      healthStatus.services.video_service = 'running';
    } catch (error) {
      healthStatus.services.video_service = 'stopped';
    }

    // Check disk space
    const uploadsDir = path.join(__dirname, '../uploads');
    const sessionsDir = path.join(__dirname, '../sessions');
    
    try {
      await fs.ensureDir(uploadsDir);
      await fs.ensureDir(sessionsDir);
      healthStatus.storage = {
        uploads_dir: 'accessible',
        sessions_dir: 'accessible'
      };
    } catch (error) {
      healthStatus.storage = {
        uploads_dir: 'error',
        sessions_dir: 'error'
      };
      healthStatus.status = 'degraded';
    }

    res.json({
      success: true,
      data: healthStatus
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      node_version: process.version,
      platform: process.platform,
      services: {},
      storage: {},
      statistics: {}
    };

    // Check Python services with detailed info
    const services = [
      { name: 'speech_service', port: 8001 },
      { name: 'video_service', port: 8002 }
    ];

    for (const service of services) {
      try {
        const response = await axios.get(`http://localhost:${service.port}/health`, { timeout: 2000 });
        detailedHealth.services[service.name] = {
          status: 'running',
          port: service.port,
          details: response.data
        };
      } catch (error) {
        detailedHealth.services[service.name] = {
          status: 'stopped',
          port: service.port,
          error: error.message
        };
        detailedHealth.status = 'degraded';
      }
    }

    // Check storage and get statistics
    const uploadsDir = path.join(__dirname, '../uploads');
    const sessionsDir = path.join(__dirname, '../sessions');
    
    try {
      await fs.ensureDir(uploadsDir);
      await fs.ensureDir(sessionsDir);
      
      const uploadFiles = await fs.readdir(uploadsDir);
      const sessionFiles = await fs.readdir(sessionsDir);
      
      detailedHealth.storage = {
        uploads_dir: {
          status: 'accessible',
          path: uploadsDir,
          file_count: uploadFiles.length
        },
        sessions_dir: {
          status: 'accessible',
          path: sessionsDir,
          file_count: sessionFiles.length
        }
      };

      // Get session statistics
      let completedSessions = 0;
      let failedSessions = 0;
      let processingSessions = 0;

      for (const sessionFile of sessionFiles) {
        if (sessionFile.endsWith('.json')) {
          try {
            const session = await fs.readJson(path.join(sessionsDir, sessionFile));
            switch (session.status) {
              case 'completed':
                completedSessions++;
                break;
              case 'failed':
                failedSessions++;
                break;
              case 'processing':
                processingSessions++;
                break;
            }
          } catch (error) {
            console.error(`Error reading session file ${sessionFile}:`, error);
          }
        }
      }

      detailedHealth.statistics = {
        total_sessions: sessionFiles.length,
        completed_sessions: completedSessions,
        failed_sessions: failedSessions,
        processing_sessions: processingSessions,
        success_rate: sessionFiles.length > 0 ? (completedSessions / sessionFiles.length * 100).toFixed(2) + '%' : '0%'
      };

    } catch (error) {
      detailedHealth.storage = {
        uploads_dir: { status: 'error', error: error.message },
        sessions_dir: { status: 'error', error: error.message }
      };
      detailedHealth.status = 'degraded';
    }

    res.json({
      success: true,
      data: detailedHealth
    });

  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Detailed health check failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router; 
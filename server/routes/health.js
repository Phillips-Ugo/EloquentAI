const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

const router = express.Router();

// Basic health check
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Eloquent AI Backend'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Detailed health check including Python verification
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Eloquent AI Backend',
      checks: {}
    };

    // Check Python availability
    try {
      const pythonCmd = process.env.PYTHON_CMD || 'python3';
      const pythonCheck = await new Promise((resolve, reject) => {
        const proc = spawn(pythonCmd, ['--version']);
        let output = '';
        proc.stdout.on('data', (data) => output += data.toString());
        proc.on('close', (code) => {
          if (code === 0) resolve(output.trim());
          else reject(new Error(`Python check failed with code ${code}`));
        });
        proc.on('error', reject);
      });
      health.checks.python = {
        available: true,
        version: pythonCheck,
        command: pythonCmd
      };
    } catch (error) {
      health.checks.python = {
        available: false,
        error: error.message
      };
      health.success = false;
      health.status = 'degraded';
    }

    // Check Python dependencies
    try {
      const pythonCmd = process.env.PYTHON_CMD || 'python3';
      const depsCheck = await new Promise((resolve, reject) => {
        const proc = spawn(pythonCmd, ['-c', 'import openai; import json; import os; print("OK")']);
        let errorOutput = '';
        proc.stderr.on('data', (data) => errorOutput += data.toString());
        proc.on('close', (code) => {
          if (code === 0) resolve(true);
          else reject(new Error(`Dependencies check failed: ${errorOutput}`));
        });
        proc.on('error', reject);
      });
      health.checks.pythonDependencies = {
        available: true,
        openai: true
      };
    } catch (error) {
      health.checks.pythonDependencies = {
        available: false,
        error: error.message
      };
      health.success = false;
      health.status = 'degraded';
    }

    // Check OpenAI API key
    health.checks.openaiKey = {
      configured: !!process.env.OPENAI_API_KEY,
      length: process.env.OPENAI_API_KEY?.length || 0
    };
    if (!process.env.OPENAI_API_KEY) {
      health.success = false;
      health.status = 'degraded';
    }

    // Check script files exist
    const scriptPath = path.join(__dirname, '../../ai-services/text_analyzer.py');
    health.checks.scripts = {
      textAnalyzer: await fs.pathExists(scriptPath),
      path: scriptPath
    };
    if (!await fs.pathExists(scriptPath)) {
      health.success = false;
      health.status = 'degraded';
    }

    // Check sessions directory
    const sessionsDir = path.join(__dirname, '../sessions');
    health.checks.directories = {
      sessions: await fs.pathExists(sessionsDir),
      uploads: await fs.pathExists(path.join(__dirname, '../uploads'))
    };

    const statusCode = health.success ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;

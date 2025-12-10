const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const aiService = require('../services/aiService');
const authService = require('../auth/enterpriseAuth');
const { User, Company, Team, AuditLog, Integration, Subscription } = require('../database/models');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB enterprise limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/aac', 'audio/flac',
      'video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska',
      'text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload audio, video, or text files.'), false);
    }
  }
});

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Middleware for audit logging
const auditLog = (action, resourceType = null) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action
      AuditLog.create({
        id: uuidv4(),
        userId: req.user?.userId,
        companyId: req.user?.company,
        action,
        resourceType,
        resourceId: req.params.id || req.body.id,
        details: JSON.stringify({ 
          method: req.method, 
          url: req.url, 
          statusCode: res.statusCode,
          body: req.method !== 'GET' ? req.body : undefined
        }),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      }).catch(err => console.error('Audit log error:', err));
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Company Management Routes
router.post('/companies', [
  body('name').notEmpty().withMessage('Company name is required'),
  body('domain').isEmail().withMessage('Valid domain is required'),
  body('industry').optional().isString(),
  body('size').optional().isIn(['startup', 'small', 'medium', 'large', 'enterprise'])
], authenticateToken, auditLog('company.create', 'company'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, domain, industry, size } = req.body;
    
    const company = await Company.create({
      id: uuidv4(),
      name,
      domain,
      industry,
      size,
      subscriptionPlan: 'professional',
      subscriptionStatus: 'active'
    });

    res.status(201).json({
      success: true,
      company,
      message: 'Company created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/companies/:id', authenticateToken, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    // Get company stats
    const stats = await Company.getStats(req.params.id);
    
    res.json({
      success: true,
      company: { ...company, stats }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Team Management Routes
router.post('/teams', [
  body('name').notEmpty().withMessage('Team name is required'),
  body('companyId').notEmpty().withMessage('Company ID is required'),
  body('description').optional().isString()
], authenticateToken, auditLog('team.create', 'team'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, companyId, description } = req.body;
    
    const team = await Team.create({
      id: uuidv4(),
      name,
      companyId,
      description,
      settings: {}
    });

    res.status(201).json({
      success: true,
      team,
      message: 'Team created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/companies/:companyId/teams', authenticateToken, async (req, res) => {
  try {
    const teams = await Team.findByCompany(req.params.companyId);
    
    res.json({
      success: true,
      teams
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/teams/:teamId/members', [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('role').optional().isIn(['member', 'lead', 'admin'])
], authenticateToken, auditLog('team.add_member', 'team'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, role = 'member' } = req.body;
    
    await Team.addMember(req.params.teamId, userId, role);

    res.json({
      success: true,
      message: 'Team member added successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced Analysis Routes with Real AI
router.post('/analyze/text', [
  body('text').notEmpty().withMessage('Text content is required'),
  body('options').optional().isObject()
], authenticateToken, auditLog('analysis.create', 'analysis'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, options = {} } = req.body;
    
    // Perform real AI analysis
    const analysis = await aiService.analyzeText(text, {
      ...options,
      userId: req.user.userId,
      companyId: req.user.company
    });

    // Generate insights
    const insights = await aiService.generateInsights(analysis, 'comprehensive');

    res.json({
      success: true,
      analysis,
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze/audio', upload.single('audio'), authenticateToken, auditLog('analysis.create', 'analysis'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    // Transcribe audio
    const transcription = await aiService.transcribeAudio(req.file.path, {
      language: req.body.language || 'en-US'
    });

    // Analyze speech
    const analysis = await aiService.analyzeSpeech(transcription, {
      fileSize: req.file.size,
      duration: transcription.duration
    });

    // Generate insights
    const insights = await aiService.generateInsights(analysis, 'speech');

    // Clean up uploaded file
    await fs.remove(req.file.path);

    res.json({
      success: true,
      transcription,
      analysis,
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await fs.remove(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze/video', upload.single('video'), authenticateToken, auditLog('analysis.create', 'analysis'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Video file is required' });
    }

    // Analyze video (placeholder for real video AI integration)
    const analysis = await aiService.analyzeVideo(req.file.path, {
      fileSize: req.file.size,
      duration: req.body.duration
    });

    // Generate insights
    const insights = await aiService.generateInsights(analysis, 'video');

    // Clean up uploaded file
    await fs.remove(req.file.path);

    res.json({
      success: true,
      analysis,
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      await fs.remove(req.file.path);
    }
    res.status(500).json({ error: error.message });
  }
});

// Integration Management Routes
router.post('/integrations', [
  body('name').notEmpty().withMessage('Integration name is required'),
  body('type').notEmpty().withMessage('Integration type is required'),
  body('config').isObject().withMessage('Configuration is required')
], authenticateToken, auditLog('integration.create', 'integration'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, type, config } = req.body;
    
    const integration = await Integration.create({
      id: uuidv4(),
      companyId: req.user.company,
      name,
      type,
      config: JSON.stringify(config),
      status: 'active'
    });

    res.status(201).json({
      success: true,
      integration,
      message: 'Integration created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/integrations', authenticateToken, async (req, res) => {
  try {
    const integrations = await Integration.findByCompany(req.user.company);
    
    res.json({
      success: true,
      integrations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/integrations/:id/test', authenticateToken, auditLog('integration.test', 'integration'), async (req, res) => {
  try {
    const integration = await Integration.findById(req.params.id);
    
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    // Test integration connection
    const testResult = await Integration.testConnection(req.params.id);

    res.json({
      success: true,
      testResult,
      message: 'Integration test completed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Subscription Management Routes
router.get('/subscriptions', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findByCompany(req.user.company);
    const usage = await Subscription.getUsage(req.user.company);
    
    res.json({
      success: true,
      subscription,
      usage
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/subscriptions/upgrade', [
  body('plan').isIn(['professional', 'enterprise', 'custom']).withMessage('Valid plan required'),
  body('billingCycle').optional().isIn(['monthly', 'yearly'])
], authenticateToken, auditLog('subscription.upgrade', 'subscription'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { plan, billingCycle = 'monthly' } = req.body;
    
    // Calculate pricing based on plan
    const pricing = {
      professional: { monthly: 99, yearly: 990 },
      enterprise: { monthly: 299, yearly: 2990 },
      custom: { monthly: 0, yearly: 0 }
    };

    const price = pricing[plan][billingCycle];
    
    await Subscription.update(req.user.company, {
      plan,
      billingCycle,
      price,
      nextBillingDate: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000)
    });

    res.json({
      success: true,
      message: 'Subscription upgraded successfully',
      newPlan: plan,
      price
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics Routes
router.get('/analytics/company', authenticateToken, async (req, res) => {
  try {
    const companyId = req.user.company;
    const { startDate, endDate } = req.query;
    
    // Get company analytics
    const stats = await Company.getStats(companyId);
    const users = await Company.getUsers(companyId);
    
    // Get recent audit logs
    const auditLogs = await AuditLog.findByCompany(companyId, 50);
    
    res.json({
      success: true,
      analytics: {
        company: stats,
        users: users.length,
        recentActivity: auditLogs,
        timeRange: { startDate, endDate }
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/analytics/team/:teamId', authenticateToken, async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const members = await Team.getMembers(req.params.teamId);
    
    res.json({
      success: true,
      analytics: {
        team,
        memberCount: members.length,
        members
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export functionality
router.post('/export/analytics', authenticateToken, auditLog('export.create', 'analytics'), async (req, res) => {
  try {
    const { format = 'json', dateRange } = req.body;
    const companyId = req.user.company;
    
    // Get analytics data
    const stats = await Company.getStats(companyId);
    const auditLogs = await AuditLog.findByCompany(companyId, 1000);
    
    let exportData;
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'Date,Action,User,Details\n';
      const csvRows = auditLogs.map(log => 
        `${log.timestamp},${log.action},${log.user_id || 'System'},${log.details}`
      ).join('\n');
      
      exportData = csvHeaders + csvRows;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.csv`);
    } else {
      exportData = JSON.stringify({
        company: stats,
        auditLogs,
        exportedAt: new Date().toISOString()
      }, null, 2);
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=analytics-${Date.now()}.json`);
    }
    
    res.send(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Management Routes
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await User.findByCompany(req.user.company);
    
    // Remove sensitive information
    const safeUsers = users.map(user => {
      const { password, reset_token, ...safeUser } = user;
      return safeUser;
    });
    
    res.json({
      success: true,
      users: safeUsers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/users/:id/role', [
  body('role').isIn(['admin', 'manager', 'user', 'viewer']).withMessage('Valid role required')
], authenticateToken, authService.checkRole(['admin', 'manager']), auditLog('user.role_change', 'user'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { role } = req.body;
    
    await User.assignRole(req.params.id, role);

    res.json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/users/:id', authenticateToken, authService.checkRole(['admin']), auditLog('user.delete', 'user'), async (req, res) => {
  try {
    await User.deactivateUser(req.params.id);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

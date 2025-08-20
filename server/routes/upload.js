const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');

const router = express.Router();

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

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/flac',
    'video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm', 'video/mkv',
    'text/plain', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio, video, and text files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 1
  }
});

// File upload endpoint
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Determine file type
    const isAudio = req.file.mimetype.startsWith('audio/');
    const isVideo = req.file.mimetype.startsWith('video/');
    const isText = req.file.mimetype.startsWith('text/') || 
                   req.file.mimetype.includes('pdf') || 
                   req.file.mimetype.includes('word');

    if (!isAudio && !isVideo && !isText) {
      // Clean up invalid file
      await fs.remove(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only audio, video, and text files are allowed.'
      });
    }

    // Determine analysis type
    let analysisType = req.body.analysisType || 'auto';
    if (analysisType === 'auto') {
      // Only auto-determine if no specific analysis type was requested
      if (isAudio) analysisType = 'speech';
      else if (isVideo) analysisType = 'video';
      else if (isText) analysisType = 'text';
    } else if (analysisType === 'speech' && isVideo) {
      // User specifically requested speech analysis for video file
      // Keep it as 'speech' to extract and analyze audio only
      analysisType = 'speech';
    }

    // Create analysis session
    const analysisId = uuidv4();
    const sessionData = {
      id: analysisId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type: analysisType,
      uploadMode: 'file',
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    // Store session data
    const sessionsDir = path.join(__dirname, '../sessions');
    await fs.ensureDir(sessionsDir);
    await fs.writeJson(path.join(sessionsDir, `${analysisId}.json`), sessionData);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        analysisId,
        filename: req.file.originalname,
        size: req.file.size,
        type: analysisType,
        uploadMode: 'file'
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Text upload endpoint
router.post('/text', [
  body('textContent')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Text content must be between 10 and 10,000 characters'),
  body('analysisType')
    .optional()
    .isIn(['speech', 'text'])
    .withMessage('Analysis type must be either "speech" or "text"')
], async (req, res) => {
  try {
    console.log('Text upload request received:', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.url
    });
    
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { textContent, analysisType = 'text' } = req.body;

    if (!textContent || textContent.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Text content is required and must be at least 10 characters long'
      });
    }

    // Create analysis session for text
    const analysisId = uuidv4();
    const sessionData = {
      id: analysisId,
      textContent: textContent.trim(),
      type: analysisType,
      uploadMode: 'text',
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    // Store session data
    const sessionsDir = path.join(__dirname, '../sessions');
    await fs.ensureDir(sessionsDir);
    await fs.writeJson(path.join(sessionsDir, `${analysisId}.json`), sessionData);

    res.json({
      success: true,
      message: 'Text uploaded successfully',
      data: {
        analysisId,
        textLength: textContent.length,
        wordCount: textContent.split(/\s+/).length,
        type: analysisType,
        uploadMode: 'text'
      }
    });

  } catch (error) {
    console.error('Text upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Text upload failed',
      error: error.message
    });
  }
});

// Legacy upload endpoint (for backward compatibility)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    // Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Determine file type
    const isAudio = req.file.mimetype.startsWith('audio/');
    const isVideo = req.file.mimetype.startsWith('video/');

    if (!isAudio && !isVideo) {
      // Clean up invalid file
      await fs.remove(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only audio and video files are allowed.'
      });
    }

    // Create analysis session
    const analysisId = uuidv4();
    const fileInfo = {
      id: analysisId,
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      mimetype: req.file.mimetype,
      type: isAudio ? 'speech' : 'video',
      uploadMode: 'file',
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    // Store file info
    const sessionsDir = path.join(__dirname, '../sessions');
    await fs.ensureDir(sessionsDir);
    await fs.writeJson(path.join(sessionsDir, `${analysisId}.json`), fileInfo);

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        analysisId,
        filename: req.file.originalname,
        size: req.file.size,
        type: fileInfo.type,
        uploadMode: 'file'
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up file on error
    if (req.file && req.file.path) {
      try {
        await fs.remove(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

// Get upload status
router.get('/:analysisId', async (req, res) => {
  try {
    const { analysisId } = req.params;
    const sessionPath = path.join(__dirname, '../sessions', `${analysisId}.json`);
    
    if (!await fs.pathExists(sessionPath)) {
      return res.status(404).json({
        success: false,
        message: 'Upload session not found'
      });
    }

    const session = await fs.readJson(sessionPath);
    
    res.json({
      success: true,
      data: {
        analysisId,
        status: session.status,
        type: session.type,
        uploadMode: session.uploadMode,
        createdAt: session.createdAt,
        uploadedAt: session.uploadedAt
      }
    });

  } catch (error) {
    console.error('Error getting upload status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get upload status',
      error: error.message
    });
  }
});

module.exports = router; 
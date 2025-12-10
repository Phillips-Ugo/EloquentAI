const express = require('express');
const router = express.Router();
const fileManager = require('../storage/fileManager');
const { SystemLog, FileUpload } = require('../database/models');
const path = require('path');

// Middleware to log file requests
router.use((req, res, next) => {
  console.log(`📁 File request: ${req.method} ${req.path}`);
  next();
});

// POST /api/files/upload - Upload file
router.post('/upload', fileManager.upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Extract user info from request (you'd get this from authentication)
    const userId = req.body.user_id || null;
    const sessionId = req.body.session_id || null;

    // Store file metadata in database
    const fileData = await fileManager.storeFileMetadata(req.file, userId, sessionId);

    SystemLog.info('File uploaded successfully', {
      file_id: fileData.id,
      original_name: req.file.originalname,
      file_size: req.file.size,
      user_id: userId
    });

    res.json({
      success: true,
      data: {
        file_id: fileData.id,
        original_name: req.file.originalname,
        stored_name: req.file.filename,
        file_size: req.file.size,
        file_type: req.file.mimetype,
        file_path: req.file.path,
        upload_date: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    SystemLog.error('File upload failed', { error: error.message });
    
    // Clean up uploaded file if database storage failed
    if (req.file) {
      try {
        await require('fs-extra').remove(req.file.path);
      } catch (cleanupError) {
        SystemLog.error('Failed to cleanup uploaded file', { error: cleanupError.message });
      }
    }

    res.status(500).json({
      success: false,
      error: 'File upload failed'
    });
  }
});

// GET /api/files/:id - Get file information
router.get('/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await fileManager.getFileById(fileId);

    // Get additional file info
    const fileInfo = await fileManager.getFileInfo(file.file_path);

    res.json({
      success: true,
      data: {
        id: file.id,
        original_name: file.original_name,
        stored_name: file.stored_name,
        file_size: file.file_size,
        file_type: file.file_type,
        upload_date: file.created_at,
        file_info: fileInfo
      }
    });

  } catch (error) {
    console.error('Get file error:', error);
    SystemLog.error('Failed to get file', { file_id: req.params.id, error: error.message });
    
    res.status(404).json({
      success: false,
      error: 'File not found'
    });
  }
});

// GET /api/files/user/:userId - Get user files
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;
    
    const files = await fileManager.getUserFiles(userId, limit);

    res.json({
      success: true,
      data: files.map(file => ({
        id: file.id,
        original_name: file.original_name,
        file_size: file.file_size,
        file_type: file.file_type,
        upload_date: file.created_at,
        upload_status: file.upload_status
      }))
    });

  } catch (error) {
    console.error('Get user files error:', error);
    SystemLog.error('Failed to get user files', { user_id: req.params.userId, error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get user files'
    });
  }
});

// POST /api/files/:id/process - Move file to processed directory
router.post('/:id/process', async (req, res) => {
  try {
    const fileId = req.params.id;
    const newPath = await fileManager.moveToProcessed(fileId);

    SystemLog.info('File moved to processed', { file_id: fileId });

    res.json({
      success: true,
      message: 'File moved to processed directory',
      data: {
        file_id: fileId,
        new_path: newPath
      }
    });

  } catch (error) {
    console.error('Process file error:', error);
    SystemLog.error('Failed to process file', { file_id: req.params.id, error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to process file'
    });
  }
});

// POST /api/files/:id/archive - Archive file
router.post('/:id/archive', async (req, res) => {
  try {
    const fileId = req.params.id;
    const archivePath = await fileManager.archiveFile(fileId);

    SystemLog.info('File archived', { file_id: fileId });

    res.json({
      success: true,
      message: 'File archived successfully',
      data: {
        file_id: fileId,
        archive_path: archivePath
      }
    });

  } catch (error) {
    console.error('Archive file error:', error);
    SystemLog.error('Failed to archive file', { file_id: req.params.id, error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to archive file'
    });
  }
});

// DELETE /api/files/:id - Delete file
router.delete('/:id', async (req, res) => {
  try {
    const fileId = req.params.id;
    await fileManager.deleteFile(fileId);

    SystemLog.info('File deleted', { file_id: fileId });

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    SystemLog.error('Failed to delete file', { file_id: req.params.id, error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
});

// GET /api/files/stats - Get storage statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await fileManager.getStorageStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get storage stats error:', error);
    SystemLog.error('Failed to get storage stats', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to get storage statistics'
    });
  }
});

// POST /api/files/cleanup - Manual cleanup
router.post('/cleanup', async (req, res) => {
  try {
    const cleanedCount = await fileManager.cleanupTempFiles();

    res.json({
      success: true,
      message: 'Cleanup completed',
      data: {
        cleaned_files: cleanedCount
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    SystemLog.error('Failed to cleanup files', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup files'
    });
  }
});

// GET /api/files/:id/download - Download file
router.get('/:id/download', async (req, res) => {
  try {
    const fileId = req.params.id;
    const file = await fileManager.getFileById(fileId);

    // Check if file exists
    const fs = require('fs-extra');
    if (!await fs.pathExists(file.file_path)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on disk'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.file_type);
    res.setHeader('Content-Length', file.file_size);

    // Stream file to client
    const fileStream = require('fs').createReadStream(file.file_path);
    fileStream.pipe(res);

    SystemLog.info('File download started', { file_id: fileId, original_name: file.original_name });

  } catch (error) {
    console.error('Download file error:', error);
    SystemLog.error('Failed to download file', { file_id: req.params.id, error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

// POST /api/files/validate - Validate file
router.post('/validate', async (req, res) => {
  try {
    const { file_path, expected_hash } = req.body;

    if (!file_path) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }

    const isValid = expected_hash ? 
      await fileManager.validateFile(file_path, expected_hash) : 
      true;

    const fileInfo = await fileManager.getFileInfo(file_path);
    const fileHash = await fileManager.generateFileHash(file_path);

    res.json({
      success: true,
      data: {
        is_valid: isValid,
        file_info: fileInfo,
        file_hash: fileHash
      }
    });

  } catch (error) {
    console.error('Validate file error:', error);
    SystemLog.error('Failed to validate file', { error: error.message });
    
    res.status(500).json({
      success: false,
      error: 'Failed to validate file'
    });
  }
});

module.exports = router;

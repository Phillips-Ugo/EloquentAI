const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const { FileUpload, SystemLog } = require('../database/models');

class FileManager {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.tempDir = path.join(__dirname, '../../temp');
    this.maxFileSize = 100 * 1024 * 1024; // 100MB
    this.allowedTypes = {
      audio: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/ogg', 'audio/aac', 'audio/flac'],
      video: ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-flv', 'video/webm', 'video/x-matroska'],
      text: ['text/plain', 'text/csv', 'application/json', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };
    
    this.initializeDirectories();
    this.setupMulter();
  }

  initializeDirectories() {
    // Create necessary directories
    fs.ensureDirSync(this.uploadDir);
    fs.ensureDirSync(this.tempDir);
    fs.ensureDirSync(path.join(this.uploadDir, 'audio'));
    fs.ensureDirSync(path.join(this.uploadDir, 'video'));
    fs.ensureDirSync(path.join(this.uploadDir, 'text'));
    fs.ensureDirSync(path.join(this.uploadDir, 'processed'));
    fs.ensureDirSync(path.join(this.uploadDir, 'archived'));
    
    SystemLog.info('File storage directories initialized', {
      upload_dir: this.uploadDir,
      temp_dir: this.tempDir
    });
  }

  setupMulter() {
    // Configure multer for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const fileType = this.getFileType(file.mimetype);
        const uploadPath = path.join(this.uploadDir, fileType);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
        cb(null, filename);
      }
    });

    // File filter
    const fileFilter = (req, file, cb) => {
      const fileType = this.getFileType(file.mimetype);
      if (fileType && this.allowedTypes[fileType].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
      }
    };

    this.upload = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: 1
      }
    });
  }

  getFileType(mimetype) {
    if (this.allowedTypes.audio.includes(mimetype)) return 'audio';
    if (this.allowedTypes.video.includes(mimetype)) return 'video';
    if (this.allowedTypes.text.includes(mimetype)) return 'text';
    return null;
  }

  // Generate file hash for integrity checking
  async generateFileHash(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256');
      hash.update(fileBuffer);
      return hash.digest('hex');
    } catch (error) {
      SystemLog.error('Failed to generate file hash', { file_path: filePath, error: error.message });
      throw error;
    }
  }

  // Validate file integrity
  async validateFile(filePath, expectedHash) {
    try {
      const actualHash = await this.generateFileHash(filePath);
      return actualHash === expectedHash;
    } catch (error) {
      SystemLog.error('Failed to validate file', { file_path: filePath, error: error.message });
      return false;
    }
  }

  // Store file metadata in database
  async storeFileMetadata(fileData, userId = null, sessionId = null) {
    try {
      const fileHash = await this.generateFileHash(fileData.path);
      
      const uploadData = {
        user_id: userId,
        session_id: sessionId,
        original_name: fileData.originalname,
        stored_name: fileData.filename,
        file_path: fileData.path,
        file_size: fileData.size,
        file_type: fileData.mimetype,
        file_hash: fileHash
      };

      const result = await FileUpload.create(uploadData);
      
      SystemLog.info('File metadata stored', {
        file_id: result.lastInsertRowid,
        original_name: fileData.originalname,
        file_size: fileData.size,
        user_id: userId
      });

      return {
        id: result.lastInsertRowid,
        ...uploadData
      };
    } catch (error) {
      SystemLog.error('Failed to store file metadata', { error: error.message });
      throw error;
    }
  }

  // Get file by ID
  async getFileById(fileId) {
    try {
      const file = await FileUpload.findById(fileId);
      if (!file) {
        throw new Error('File not found');
      }
      return file;
    } catch (error) {
      SystemLog.error('Failed to get file by ID', { file_id: fileId, error: error.message });
      throw error;
    }
  }

  // Get user files
  async getUserFiles(userId, limit = 50) {
    try {
      const files = await FileUpload.findByUserId(userId, limit);
      return files;
    } catch (error) {
      SystemLog.error('Failed to get user files', { user_id: userId, error: error.message });
      throw error;
    }
  }

  // Move file to processed directory
  async moveToProcessed(fileId) {
    try {
      const file = await this.getFileById(fileId);
      const processedDir = path.join(this.uploadDir, 'processed');
      const newPath = path.join(processedDir, file.stored_name);
      
      await fs.move(file.file_path, newPath);
      
      // Update database with new path
      // Note: You'd need to add an update method to FileUpload model
      
      SystemLog.info('File moved to processed directory', {
        file_id: fileId,
        new_path: newPath
      });
      
      return newPath;
    } catch (error) {
      SystemLog.error('Failed to move file to processed', { file_id: fileId, error: error.message });
      throw error;
    }
  }

  // Archive old files
  async archiveFile(fileId) {
    try {
      const file = await this.getFileById(fileId);
      const archiveDir = path.join(this.uploadDir, 'archived');
      const newPath = path.join(archiveDir, file.stored_name);
      
      await fs.move(file.file_path, newPath);
      
      SystemLog.info('File archived', {
        file_id: fileId,
        archive_path: newPath
      });
      
      return newPath;
    } catch (error) {
      SystemLog.error('Failed to archive file', { file_id: fileId, error: error.message });
      throw error;
    }
  }

  // Delete file
  async deleteFile(fileId) {
    try {
      const file = await this.getFileById(fileId);
      
      // Check if file exists
      if (await fs.pathExists(file.file_path)) {
        await fs.remove(file.file_path);
      }
      
      // Delete from database
      // Note: You'd need to add a delete method to FileUpload model
      
      SystemLog.info('File deleted', {
        file_id: fileId,
        file_path: file.file_path
      });
      
      return true;
    } catch (error) {
      SystemLog.error('Failed to delete file', { file_id: fileId, error: error.message });
      throw error;
    }
  }

  // Clean up temporary files
  async cleanupTempFiles() {
    try {
      const tempFiles = await fs.readdir(this.tempDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      let cleanedCount = 0;
      
      for (const file of tempFiles) {
        const filePath = path.join(this.tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.remove(filePath);
          cleanedCount++;
        }
      }
      
      SystemLog.info('Temporary files cleaned up', { cleaned_count: cleanedCount });
      return cleanedCount;
    } catch (error) {
      SystemLog.error('Failed to cleanup temp files', { error: error.message });
      throw error;
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const stats = {
        total_files: 0,
        total_size: 0,
        by_type: {
          audio: { count: 0, size: 0 },
          video: { count: 0, size: 0 },
          text: { count: 0, size: 0 }
        }
      };

      // Get all files from database
      // Note: You'd need to add a method to get all files
      
      return stats;
    } catch (error) {
      SystemLog.error('Failed to get storage stats', { error: error.message });
      throw error;
    }
  }

  // Validate file size
  validateFileSize(fileSize) {
    return fileSize <= this.maxFileSize;
  }

  // Get file extension
  getFileExtension(filename) {
    return path.extname(filename).toLowerCase();
  }

  // Check if file type is allowed
  isAllowedFileType(mimetype) {
    return Object.values(this.allowedTypes).flat().includes(mimetype);
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      SystemLog.error('Failed to get file info', { file_path: filePath, error: error.message });
      throw error;
    }
  }

  // Create file thumbnail (for video files)
  async createThumbnail(filePath, outputPath) {
    try {
      // This would require ffmpeg or similar tool
      // For now, we'll just return a placeholder
      SystemLog.info('Thumbnail creation requested', { file_path: filePath, output_path: outputPath });
      return outputPath;
    } catch (error) {
      SystemLog.error('Failed to create thumbnail', { file_path: filePath, error: error.message });
      throw error;
    }
  }

  // Schedule cleanup tasks
  scheduleCleanup() {
    // Run cleanup every hour
    setInterval(() => {
      this.cleanupTempFiles().catch(error => {
        SystemLog.error('Scheduled cleanup failed', { error: error.message });
      });
    }, 60 * 60 * 1000); // 1 hour
  }
}

// Create singleton instance
const fileManager = new FileManager();

// Schedule cleanup tasks
fileManager.scheduleCleanup();

module.exports = fileManager;

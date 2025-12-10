#!/usr/bin/env node

const cron = require('node-cron');
const backupManager = require('../server/backup/backupManager');
const disasterRecovery = require('../server/backup/disasterRecovery');
const { SystemLog } = require('../server/database/models');

class BackupScheduler {
  constructor() {
    this.tasks = new Map();
    this.isRunning = false;
    
    this.initialize();
  }

  async initialize() {
    try {
      SystemLog.info('Backup scheduler initializing');
      
      // Schedule daily full backup at 2 AM
      this.scheduleTask('daily-full-backup', '0 2 * * *', async () => {
        await this.executeDailyBackup();
      });
      
      // Schedule hourly incremental backup
      this.scheduleTask('hourly-incremental-backup', '0 * * * *', async () => {
        await this.executeIncrementalBackup();
      });
      
      // Schedule weekly backup cleanup on Sundays at 3 AM
      this.scheduleTask('weekly-cleanup', '0 3 * * 0', async () => {
        await this.executeBackupCleanup();
      });
      
      // Schedule monthly disaster recovery test on 1st at 4 AM
      this.scheduleTask('monthly-dr-test', '0 4 1 * *', async () => {
        await this.executeDisasterRecoveryTest();
      });
      
      // Schedule system health monitoring every 5 minutes
      this.scheduleTask('health-monitoring', '*/5 * * * *', async () => {
        await this.monitorSystemHealth();
      });
      
      this.isRunning = true;
      SystemLog.info('Backup scheduler initialized successfully');
      
    } catch (error) {
      SystemLog.error('Failed to initialize backup scheduler', { error: error.message });
      throw error;
    }
  }

  scheduleTask(name, schedule, task) {
    try {
      const cronTask = cron.schedule(schedule, async () => {
        try {
          SystemLog.info(`Executing scheduled task: ${name}`);
          await task();
          SystemLog.info(`Scheduled task completed: ${name}`);
        } catch (error) {
          SystemLog.error(`Scheduled task failed: ${name}`, { error: error.message });
        }
      }, {
        scheduled: false,
        timezone: 'UTC'
      });
      
      this.tasks.set(name, cronTask);
      cronTask.start();
      
      SystemLog.info(`Scheduled task: ${name} with schedule: ${schedule}`);
      
    } catch (error) {
      SystemLog.error(`Failed to schedule task: ${name}`, { error: error.message });
    }
  }

  async executeDailyBackup() {
    try {
      SystemLog.info('Starting daily full backup');
      
      const result = await backupManager.createFullBackup({
        type: 'daily',
        compression: 'gzip',
        encryption: true
      });
      
      SystemLog.info('Daily full backup completed', {
        backup_id: result.backupId,
        size: result.size
      });
      
      // Send notification
      await this.sendBackupNotification('daily', result);
      
    } catch (error) {
      SystemLog.error('Daily full backup failed', { error: error.message });
      await this.sendBackupNotification('daily', null, error);
    }
  }

  async executeIncrementalBackup() {
    try {
      SystemLog.info('Starting hourly incremental backup');
      
      // Get last backup ID
      const lastBackupId = await this.getLastBackupId();
      if (!lastBackupId) {
        SystemLog.warn('No previous backup found, creating full backup instead');
        await this.executeDailyBackup();
        return;
      }
      
      const result = await backupManager.createIncrementalBackup(lastBackupId, {
        type: 'incremental',
        compression: 'gzip',
        encryption: true
      });
      
      SystemLog.info('Hourly incremental backup completed', {
        backup_id: result.backupId,
        size: result.size
      });
      
    } catch (error) {
      SystemLog.error('Hourly incremental backup failed', { error: error.message });
    }
  }

  async executeBackupCleanup() {
    try {
      SystemLog.info('Starting weekly backup cleanup');
      
      const result = await backupManager.cleanupOldBackups();
      
      SystemLog.info('Weekly backup cleanup completed', result);
      
    } catch (error) {
      SystemLog.error('Weekly backup cleanup failed', { error: error.message });
    }
  }

  async executeDisasterRecoveryTest() {
    try {
      SystemLog.info('Starting monthly disaster recovery test');
      
      // Create a test recovery plan
      const plan = await disasterRecovery.createRecoveryPlan('server_failure', {
        testMode: true
      });
      
      // Execute simulation test
      const test = await disasterRecovery.testRecovery(plan.id, 'simulation');
      
      SystemLog.info('Monthly disaster recovery test completed', {
        test_id: test.id,
        success_rate: test.metrics.successRate
      });
      
    } catch (error) {
      SystemLog.error('Monthly disaster recovery test failed', { error: error.message });
    }
  }

  async monitorSystemHealth() {
    try {
      const health = await disasterRecovery.monitorSystemHealth();
      
      if (health.overall === 'critical') {
        SystemLog.error('Critical system health detected', { health: health });
        await this.triggerEmergencyResponse(health);
      }
      
    } catch (error) {
      SystemLog.error('System health monitoring failed', { error: error.message });
    }
  }

  async getLastBackupId() {
    try {
      // This would typically query the backup index
      // For now, return a placeholder
      return 'last-backup-id';
    } catch (error) {
      SystemLog.error('Failed to get last backup ID', { error: error.message });
      return null;
    }
  }

  async sendBackupNotification(type, result, error = null) {
    try {
      const notification = {
        type: 'backup',
        backupType: type,
        timestamp: new Date().toISOString(),
        success: !error,
        result: result,
        error: error?.message
      };
      
      // Send to monitoring system
      SystemLog.info('Backup notification sent', notification);
      
      // Send email notification if configured
      if (process.env.BACKUP_NOTIFICATION_EMAIL) {
        await this.sendEmailNotification(notification);
      }
      
    } catch (error) {
      SystemLog.error('Failed to send backup notification', { error: error.message });
    }
  }

  async sendEmailNotification(notification) {
    try {
      const emailService = require('../server/notifications/emailService');
      
      const subject = `Backup ${notification.success ? 'Success' : 'Failure'} - ${notification.backupType}`;
      const data = {
        backupType: notification.backupType,
        success: notification.success,
        timestamp: notification.timestamp,
        result: notification.result,
        error: notification.error
      };
      
      await emailService.sendEmail(
        process.env.BACKUP_NOTIFICATION_EMAIL,
        subject,
        'system-alert',
        data
      );
      
    } catch (error) {
      SystemLog.error('Failed to send email notification', { error: error.message });
    }
  }

  async triggerEmergencyResponse(health) {
    try {
      SystemLog.error('Triggering emergency response', { health: health });
      
      // Create disaster recovery plan
      const plan = await disasterRecovery.createRecoveryPlan('system_failure', {
        emergency: true
      });
      
      // Execute recovery
      const recovery = await disasterRecovery.executeRecovery(plan);
      
      SystemLog.info('Emergency response completed', {
        recovery_id: recovery.id,
        status: recovery.status
      });
      
    } catch (error) {
      SystemLog.error('Emergency response failed', { error: error.message });
    }
  }

  stop() {
    try {
      for (const [name, task] of this.tasks) {
        task.stop();
        SystemLog.info(`Stopped scheduled task: ${name}`);
      }
      
      this.tasks.clear();
      this.isRunning = false;
      
      SystemLog.info('Backup scheduler stopped');
      
    } catch (error) {
      SystemLog.error('Failed to stop backup scheduler', { error: error.message });
    }
  }

  getStatus() {
    return {
      running: this.isRunning,
      tasks: Array.from(this.tasks.keys()),
      uptime: process.uptime()
    };
  }
}

// Create and start scheduler
const scheduler = new BackupScheduler();

// Handle graceful shutdown
process.on('SIGINT', () => {
  SystemLog.info('Received SIGINT, shutting down backup scheduler');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  SystemLog.info('Received SIGTERM, shutting down backup scheduler');
  scheduler.stop();
  process.exit(0);
});

// Export for testing
module.exports = scheduler;

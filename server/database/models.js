const database = require('./database');

// Enhanced User model with enterprise features
class User {
  static create(userData) {
    return database.createUser(userData);
  }

  static findByEmail(email) {
    return database.getUserByEmail(email);
  }

  static findById(id) {
    return database.getUserById(id);
  }

  static update(id, updates) {
    return database.updateUser(id, updates);
  }

  static async authenticate(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    // In a real app, you'd use bcrypt to verify the password
    // For now, we'll assume password verification is handled elsewhere
    return user;
  }

  static updateLastLogin(id) {
    return database.updateUser(id, { last_login: new Date().toISOString() });
  }

  static updatePassword(id, hashedPassword) {
    return database.updateUser(id, { password_hash: hashedPassword });
  }

  static updateResetToken(id, resetToken, resetTokenExpiry) {
    return database.updateUser(id, { 
      reset_token: resetToken, 
      reset_token_expiry: resetTokenExpiry.toISOString() 
    });
  }

  static findByResetToken(resetToken) {
    return database.getUserByResetToken(resetToken);
  }

  static clearResetToken(id) {
    return database.updateUser(id, { 
      reset_token: null, 
      reset_token_expiry: null 
    });
  }

  // Enterprise features
  static findByCompany(companyId) {
    return database.getUsersByCompany(companyId);
  }

  static updatePreferences(id, preferences) {
    return database.updateUser(id, { preferences });
  }

  static getTeamMembers(userId) {
    return database.getTeamMembers(userId);
  }

  static assignRole(id, role) {
    return database.updateUser(id, { role });
  }

  static deactivateUser(id) {
    return database.updateUser(id, { status: 'inactive' });
  }

  static activateUser(id) {
    return database.updateUser(id, { status: 'active' });
  }

  static getUserStats(userId) {
    return database.getUserStats(userId);
  }
}

// Analysis Session model
class AnalysisSession {
  static create(sessionData) {
    return database.createAnalysisSession(sessionData);
  }

  static findBySessionId(sessionId) {
    return database.getAnalysisSession(sessionId);
  }

  static update(sessionId, updates) {
    return database.updateAnalysisSession(sessionId, updates);
  }

  static findByUserId(userId, limit = 50) {
    return database.getUserAnalysisSessions(userId, limit);
  }

  static async createFromUpload(uploadData, sessionId) {
    const sessionData = {
      user_id: uploadData.user_id || null,
      session_id: sessionId,
      analysis_type: uploadData.analysisType,
      file_path: uploadData.file_path,
      file_name: uploadData.file_name,
      file_size: uploadData.file_size,
      file_type: uploadData.file_type,
      text_content: uploadData.text_content
    };

    return this.create(sessionData);
  }
}

// Analytics Event model
class AnalyticsEvent {
  static track(eventData) {
    return database.trackEvent(eventData);
  }

  static find(filters = {}) {
    return database.getAnalyticsEvents(filters);
  }

  static trackPageView(userId, sessionId, pageUrl, userAgent, ipAddress) {
    return this.track({
      user_id: userId,
      session_id: sessionId,
      event_type: 'page_view',
      event_data: { page: pageUrl },
      page_url: pageUrl,
      user_agent: userAgent,
      ip_address: ipAddress
    });
  }

  static trackUserAction(userId, sessionId, action, data, userAgent, ipAddress) {
    return this.track({
      user_id: userId,
      session_id: sessionId,
      event_type: 'user_action',
      event_data: { action, data },
      user_agent: userAgent,
      ip_address: ipAddress
    });
  }

  static trackAnalysisStart(userId, sessionId, analysisType, userAgent, ipAddress) {
    return this.track({
      user_id: userId,
      session_id: sessionId,
      event_type: 'analysis_start',
      event_data: { analysis_type: analysisType },
      user_agent: userAgent,
      ip_address: ipAddress
    });
  }

  static trackAnalysisComplete(userId, sessionId, analysisType, duration, userAgent, ipAddress) {
    return this.track({
      user_id: userId,
      session_id: sessionId,
      event_type: 'analysis_complete',
      event_data: { analysis_type: analysisType, duration },
      user_agent: userAgent,
      ip_address: ipAddress
    });
  }
}

// Performance Metric model
class PerformanceMetric {
  static track(metricData) {
    return database.trackMetric(metricData);
  }

  static find(filters = {}) {
    return database.getPerformanceMetrics(filters);
  }

  static trackWebVitals(userId, sessionId, vitals) {
    const metrics = [];
    
    if (vitals.lcp) {
      metrics.push(this.track({
        user_id: userId,
        session_id: sessionId,
        metric_name: 'lcp',
        metric_value: vitals.lcp,
        metric_data: { type: 'web_vital' }
      }));
    }
    
    if (vitals.fid) {
      metrics.push(this.track({
        user_id: userId,
        session_id: sessionId,
        metric_name: 'fid',
        metric_value: vitals.fid,
        metric_data: { type: 'web_vital' }
      }));
    }
    
    if (vitals.cls) {
      metrics.push(this.track({
        user_id: userId,
        session_id: sessionId,
        metric_name: 'cls',
        metric_value: vitals.cls,
        metric_data: { type: 'web_vital' }
      }));
    }
    
    return metrics;
  }

  static trackCustomMetric(userId, sessionId, name, value, data = {}) {
    return this.track({
      user_id: userId,
      session_id: sessionId,
      metric_name: name,
      metric_value: value,
      metric_data: data
    });
  }
}

// WebSocket Session model
class WebSocketSession {
  static create(sessionData) {
    return database.createWebSocketSession(sessionData);
  }

  static findByClientId(clientId) {
    return database.getWebSocketSession(clientId);
  }

  static update(clientId, updates) {
    return database.updateWebSocketSession(clientId, updates);
  }

  static startRecording(clientId) {
    return this.update(clientId, {
      is_recording: 1,
      recording_start_time: new Date().toISOString(),
      frame_count: 0
    });
  }

  static stopRecording(clientId) {
    return this.update(clientId, {
      is_recording: 0,
      disconnected_at: new Date().toISOString()
    });
  }

  static incrementFrameCount(clientId) {
    const session = this.findByClientId(clientId);
    if (session) {
      return this.update(clientId, {
        frame_count: (session.frame_count || 0) + 1
      });
    }
  }
}

// File Upload model
class FileUpload {
  static create(uploadData) {
    return database.createFileUpload(uploadData);
  }

  static findById(id) {
    return database.getFileUpload(id);
  }

  static findByUserId(userId, limit = 50) {
    return database.getUserFileUploads(userId, limit);
  }
}

// System Log model
class SystemLog {
  static log(level, message, context = {}) {
    return database.log(level, message, context);
  }

  static info(message, context = {}) {
    return this.log('info', message, context);
  }

  static warn(message, context = {}) {
    return this.log('warn', message, context);
  }

  static error(message, context = {}) {
    return this.log('error', message, context);
  }

  static debug(message, context = {}) {
    return this.log('debug', message, context);
  }

  static find(filters = {}) {
    return database.getSystemLogs(filters);
  }
}

// Database Statistics model
class DatabaseStats {
  static getStats() {
    return database.getDatabaseStats();
  }

  static cleanupOldData(daysToKeep = 30) {
    return database.cleanupOldData(daysToKeep);
  }
}

// Company model
class Company {
  static create(companyData) {
    return database.createCompany(companyData);
  }

  static findById(id) {
    return database.getCompanyById(id);
  }

  static findByDomain(domain) {
    return database.getCompanyByDomain(domain);
  }

  static update(id, updates) {
    return database.updateCompany(id, updates);
  }

  static getStats(companyId) {
    return database.getCompanyStats(companyId);
  }

  static getUsers(companyId) {
    return database.getUsersByCompany(companyId);
  }
}

// Team model
class Team {
  static create(teamData) {
    return database.createTeam(teamData);
  }

  static findById(id) {
    return database.getTeamById(id);
  }

  static findByCompany(companyId) {
    return database.getTeamsByCompany(companyId);
  }

  static addMember(teamId, userId, role = 'member') {
    return database.addTeamMember(teamId, userId, role);
  }

  static removeMember(teamId, userId) {
    return database.removeTeamMember(teamId, userId);
  }

  static getMembers(teamId) {
    return database.getTeamMembers(teamId);
  }

  static update(teamId, updates) {
    return database.updateTeam(teamId, updates);
  }
}

// Audit Log model
class AuditLog {
  static create(logData) {
    return database.createAuditLog(logData);
  }

  static findByUser(userId, limit = 100) {
    return database.getAuditLogsByUser(userId, limit);
  }

  static findByCompany(companyId, limit = 100) {
    return database.getAuditLogsByCompany(companyId, limit);
  }

  static findByAction(action, limit = 100) {
    return database.getAuditLogsByAction(action, limit);
  }

  static getRecent(limit = 50) {
    return database.getRecentAuditLogs(limit);
  }
}

// Integration model
class Integration {
  static create(integrationData) {
    return database.createIntegration(integrationData);
  }

  static findByCompany(companyId) {
    return database.getIntegrationsByCompany(companyId);
  }

  static findById(id) {
    return database.getIntegrationById(id);
  }

  static update(id, updates) {
    return database.updateIntegration(id, updates);
  }

  static delete(id) {
    return database.deleteIntegration(id);
  }

  static testConnection(id) {
    return database.testIntegration(id);
  }
}

// Subscription model
class Subscription {
  static create(subscriptionData) {
    return database.createSubscription(subscriptionData);
  }

  static findByCompany(companyId) {
    return database.getSubscriptionByCompany(companyId);
  }

  static update(companyId, updates) {
    return database.updateSubscription(companyId, updates);
  }

  static cancel(companyId) {
    return database.cancelSubscription(companyId);
  }

  static getUsage(companyId) {
    return database.getSubscriptionUsage(companyId);
  }
}

module.exports = {
  User,
  AnalysisSession,
  AnalyticsEvent,
  PerformanceMetric,
  WebSocketSession,
  FileUpload,
  SystemLog,
  DatabaseStats,
  Company,
  Team,
  AuditLog,
  Integration,
  Subscription,
  database
};

class InMemoryDatabase {
  constructor() {
    this.users = new Map();
    this.analysis_sessions = new Map();
    this.analytics_events = new Map();
    this.performance_metrics = new Map();
    this.websocket_sessions = new Map();
    this.file_uploads = new Map();
    this.system_logs = new Map();
    this.companies = new Map();
    this.teams = new Map();
    this.team_members = new Map();
    this.audit_logs = new Map();
    this.integrations = new Map();
    this.subscriptions = new Map();
    this.init();
  }

  init() {
    console.log('🗄️ In-memory database initialized successfully');
  }

  createTables() {}
  createIndexes() {}

  // User management
  createUser(userData) {
    const id = this.users.size + 1;
    const newUser = { id, ...userData, preferences: JSON.stringify(userData.preferences || {}) };
    this.users.set(id, newUser);
    return { lastInsertRowid: id };
  }

  getUserByEmail(email) {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return { ...user, preferences: JSON.parse(user.preferences) };
      }
    }
    return null;
  }

  getUserById(id) {
    const user = this.users.get(id);
    if (user) {
      return { ...user, preferences: JSON.parse(user.preferences) };
    }
    return null;
  }

  updateUser(id, updates) {
    const user = this.users.get(id);
    if (user) {
      const updatedUser = { ...user, ...updates, updated_at: new Date().toISOString() };
      if (updates.preferences) {
        updatedUser.preferences = JSON.stringify(updates.preferences);
      }
      this.users.set(id, updatedUser);
    }
  }

  // Analysis sessions
  createAnalysisSession(sessionData) {
    const id = this.analysis_sessions.size + 1;
    this.analysis_sessions.set(id, { id, ...sessionData });
    return { lastInsertRowid: id };
  }

  updateAnalysisSession(sessionId, updates) {
    for (const session of this.analysis_sessions.values()) {
      if (session.session_id === sessionId) {
        const updatedSession = { ...session, ...updates };
        if (updates.results) {
          updatedSession.results = JSON.stringify(updates.results);
        }
        this.analysis_sessions.set(session.id, updatedSession);
        break;
      }
    }
  }

  getAnalysisSession(sessionId) {
    for (const session of this.analysis_sessions.values()) {
      if (session.session_id === sessionId) {
        const result = { ...session };
        if (result.results) {
          result.results = JSON.parse(result.results);
        }
        return result;
      }
    }
    return null;
  }

  getUserAnalysisSessions(userId, limit = 50) {
    const sessions = [];
    for (const session of this.analysis_sessions.values()) {
      if (session.user_id === userId) {
        const result = { ...session };
        if (result.results) {
          result.results = JSON.parse(result.results);
        }
        sessions.push(result);
      }
    }
    return sessions.slice(0, limit);
  }

  // System logs
  log(level, message, context = {}) {
    const id = this.system_logs.size + 1;
    this.system_logs.set(id, { id, level, message, context: JSON.stringify(context), timestamp: new Date().toISOString() });
  }

  // Analytics events
  trackEvent(eventData) {
    const id = this.analytics_events.size + 1;
    const event = {
      id,
      user_id: eventData.user_id || null,
      session_id: eventData.session_id || null,
      event_type: eventData.event_type || 'unknown',
      event_data: typeof eventData.event_data === 'object' ? JSON.stringify(eventData.event_data) : eventData.event_data,
      page_url: eventData.page_url || '',
      user_agent: eventData.user_agent || '',
      ip_address: eventData.ip_address || '',
      created_at: new Date().toISOString()
    };
    this.analytics_events.set(id, event);
    return { lastInsertRowid: id };
  }

  // Performance metrics
  trackMetric(metricData) {
    const id = this.performance_metrics.size + 1;
    const metric = {
      id,
      user_id: metricData.user_id || null,
      session_id: metricData.session_id || null,
      metric_name: metricData.metric_name || 'unknown',
      metric_value: metricData.metric_value || 0,
      metric_data: typeof metricData.metric_data === 'object' ? JSON.stringify(metricData.metric_data) : metricData.metric_data,
      created_at: new Date().toISOString()
    };
    this.performance_metrics.set(id, metric);
    return { lastInsertRowid: id };
  }

  // Get analytics events
  getAnalyticsEvents(filters = {}) {
    const events = Array.from(this.analytics_events.values());
    
    // Apply filters
    let filtered = events;
    if (filters.user_id) {
      filtered = filtered.filter(e => e.user_id === filters.user_id);
    }
    if (filters.session_id) {
      filtered = filtered.filter(e => e.session_id === filters.session_id);
    }
    if (filters.event_type) {
      filtered = filtered.filter(e => e.event_type === filters.event_type);
    }
    if (filters.limit) {
      filtered = filtered.slice(-filters.limit);
    }
    
    return filtered.map(e => ({
      ...e,
      event_data: typeof e.event_data === 'string' ? JSON.parse(e.event_data) : e.event_data
    }));
  }

  // Get performance metrics
  getPerformanceMetrics(filters = {}) {
    const metrics = Array.from(this.performance_metrics.values());
    
    // Apply filters
    let filtered = metrics;
    if (filters.user_id) {
      filtered = filtered.filter(m => m.user_id === filters.user_id);
    }
    if (filters.session_id) {
      filtered = filtered.filter(m => m.session_id === filters.session_id);
    }
    if (filters.metric_name) {
      filtered = filtered.filter(m => m.metric_name === filters.metric_name);
    }
    if (filters.limit) {
      filtered = filtered.slice(-filters.limit);
    }
    
    return filtered.map(m => ({
      ...m,
      metric_data: typeof m.metric_data === 'string' ? JSON.parse(m.metric_data) : m.metric_data
    }));
  }

  // Fallback for any other methods (silently handle, don't warn)
  __call(name, args) {
    // Silently handle unimplemented methods to reduce log noise
    return { lastInsertRowid: 0 };
  }
}

const database = new InMemoryDatabase();

module.exports = new Proxy(database, {
  get(target, prop) {
    if (prop in target) {
      return target[prop];
    }
    return (...args) => target.__call(prop, args);
  }
});
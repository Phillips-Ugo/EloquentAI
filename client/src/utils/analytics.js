// Analytics and A/B Testing Framework

class Analytics {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.events = [];
    this.experiments = new Map();
    this.isEnabled = true;
    this.endpoint = '/api/analytics';
    
    this.init();
  }

  init() {
    // Load existing experiments
    this.loadExperiments();
    
    // Delay initial tracking to allow server to start
    setTimeout(() => {
      // Track page view
      this.track('page_view', {
        page: window.location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        timestamp: Date.now()
      });

      // Track session start
      this.track('session_start', {
        session_id: this.sessionId,
        timestamp: Date.now()
      });
    }, 2000); // 2 second delay

    // Set up automatic tracking
    this.setupAutomaticTracking();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    let userId = localStorage.getItem('eloquent_ai_user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('eloquent_ai_user_id', userId);
    }
    return userId;
  }

  // Event tracking
  track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const event = {
      event: eventName,
      properties: {
        ...properties,
        user_id: this.userId,
        session_id: this.sessionId,
        timestamp: Date.now(),
        url: window.location.href,
        page: window.location.pathname
      }
    };

    this.events.push(event);
    
    // Send to analytics service
    this.sendEvent(event);
    
    // Log for debugging
    console.log('Analytics Event:', event);
  }

  // Send event to analytics service
  async sendEvent(event) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      });
      
      if (!response.ok) {
        throw new Error(`Analytics request failed: ${response.status}`);
      }
    } catch (error) {
      console.warn('Analytics event failed to send (this is normal during development):', error.message);
      // Store for retry later
      this.storeFailedEvent(event);
    }
  }

  // Store failed events for retry
  storeFailedEvent(event) {
    const failedEvents = JSON.parse(localStorage.getItem('eloquent_ai_failed_events') || '[]');
    failedEvents.push(event);
    localStorage.setItem('eloquent_ai_failed_events', JSON.stringify(failedEvents));
  }

  // Retry failed events
  async retryFailedEvents() {
    const failedEvents = JSON.parse(localStorage.getItem('eloquent_ai_failed_events') || '[]');
    if (failedEvents.length === 0) return;

    for (const event of failedEvents) {
      try {
        await this.sendEvent(event);
      } catch (error) {
        console.error('Failed to retry event:', error);
        break;
      }
    }

    localStorage.removeItem('eloquent_ai_failed_events');
  }

  // A/B Testing
  createExperiment(name, variants, trafficAllocation = 1.0) {
    const experiment = {
      name,
      variants,
      trafficAllocation,
      startDate: Date.now(),
      isActive: true
    };

    this.experiments.set(name, experiment);
    this.saveExperiments();
    
    return experiment;
  }

  getVariant(experimentName) {
    const experiment = this.experiments.get(experimentName);
    if (!experiment || !experiment.isActive) {
      return null;
    }

    // Check if user already has a variant assigned
    const storedVariant = localStorage.getItem(`experiment_${experimentName}`);
    if (storedVariant) {
      return storedVariant;
    }

    // Assign variant based on user ID hash
    const hash = this.hashString(this.userId + experimentName);
    const variantIndex = Math.floor(hash * experiment.variants.length);
    const variant = experiment.variants[variantIndex];

    // Store the variant
    localStorage.setItem(`experiment_${experimentName}`, variant);
    
    // Track experiment assignment
    this.track('experiment_assigned', {
      experiment_name: experimentName,
      variant: variant,
      timestamp: Date.now()
    });

    return variant;
  }

  // Hash function for consistent variant assignment
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  // Track experiment conversion
  trackConversion(experimentName, conversionType, value = 1) {
    const variant = localStorage.getItem(`experiment_${experimentName}`);
    if (!variant) return;

    this.track('experiment_conversion', {
      experiment_name: experimentName,
      variant: variant,
      conversion_type: conversionType,
      value: value,
      timestamp: Date.now()
    });
  }

  // Save experiments to localStorage
  saveExperiments() {
    const experimentsData = Array.from(this.experiments.entries());
    localStorage.setItem('eloquent_ai_experiments', JSON.stringify(experimentsData));
  }

  // Load experiments from localStorage
  loadExperiments() {
    const experimentsData = JSON.parse(localStorage.getItem('eloquent_ai_experiments') || '[]');
    this.experiments = new Map(experimentsData);
  }

  // Set up automatic tracking
  setupAutomaticTracking() {
    // Track clicks on buttons and links
    document.addEventListener('click', (event) => {
      const element = event.target.closest('button, a, [data-track]');
      if (element) {
        const trackData = element.dataset.track;
        if (trackData) {
          this.track('click', {
            element: trackData,
            text: element.textContent?.trim(),
            href: element.href,
            class: element.className
          });
        }
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target;
      if (form.dataset.track) {
        this.track('form_submit', {
          form: form.dataset.track,
          action: form.action,
          method: form.method
        });
      }
    });

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.track('page_visibility_change', {
        hidden: document.hidden,
        timestamp: Date.now()
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', this.throttle(() => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.track('scroll_depth', {
          depth: scrollDepth,
          page: window.location.pathname
        });
      }
    }, 1000));

    // Track time on page
    this.trackTimeOnPage();
  }

  // Track time spent on page
  trackTimeOnPage() {
    const startTime = Date.now();
    
    window.addEventListener('beforeunload', () => {
      const timeOnPage = Date.now() - startTime;
      this.track('time_on_page', {
        duration: timeOnPage,
        page: window.location.pathname
      });
    });
  }

  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // User properties
  setUserProperties(properties) {
    this.track('user_properties_set', properties);
  }

  // Identify user
  identify(userId, properties = {}) {
    this.userId = userId;
    localStorage.setItem('eloquent_ai_user_id', userId);
    this.track('user_identified', {
      user_id: userId,
      properties: properties
    });
  }

  // Track custom events
  trackCustom(eventName, properties = {}) {
    this.track(eventName, properties);
  }

  // Get analytics data
  getAnalyticsData() {
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      events: this.events,
      experiments: Array.from(this.experiments.entries())
    };
  }

  // Enable/disable analytics
  setEnabled(enabled) {
    this.isEnabled = enabled;
    localStorage.setItem('eloquent_ai_analytics_enabled', enabled.toString());
  }

  // Check if analytics is enabled
  isAnalyticsEnabled() {
    return localStorage.getItem('eloquent_ai_analytics_enabled') !== 'false';
  }
}

// Create global analytics instance
const analytics = new Analytics();

// Export analytics functions
export const track = (eventName, properties) => analytics.track(eventName, properties);
export const trackCustom = (eventName, properties) => analytics.trackCustom(eventName, properties);
export const identify = (userId, properties) => analytics.identify(userId, properties);
export const setUserProperties = (properties) => analytics.setUserProperties(properties);
export const createExperiment = (name, variants, trafficAllocation) => analytics.createExperiment(name, variants, trafficAllocation);
export const getVariant = (experimentName) => analytics.getVariant(experimentName);
export const trackConversion = (experimentName, conversionType, value) => analytics.trackConversion(experimentName, conversionType, value);
export const setAnalyticsEnabled = (enabled) => analytics.setEnabled(enabled);
export const isAnalyticsEnabled = () => analytics.isAnalyticsEnabled();

// Predefined tracking functions
export const trackPageView = (page) => track('page_view', { page });
export const trackButtonClick = (buttonName, properties = {}) => track('button_click', { button_name: buttonName, ...properties });
export const trackFormSubmit = (formName, properties = {}) => track('form_submit', { form_name: formName, ...properties });
export const trackFileUpload = (fileType, fileSize, properties = {}) => track('file_upload', { file_type: fileType, file_size: fileSize, ...properties });
export const trackAnalysisStart = (analysisType, properties = {}) => track('analysis_start', { analysis_type: analysisType, ...properties });
export const trackAnalysisComplete = (analysisType, duration, properties = {}) => track('analysis_complete', { analysis_type: analysisType, duration, ...properties });
export const trackError = (errorType, errorMessage, properties = {}) => track('error', { error_type: errorType, error_message: errorMessage, ...properties });

export default analytics;

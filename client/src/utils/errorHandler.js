// Global error handling utilities
import React from 'react';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTHENTICATION_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error classification
export const classifyError = (error) => {
  if (!error) return { type: ERROR_TYPES.UNKNOWN, severity: ERROR_SEVERITY.MEDIUM };

  // Network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
    return { type: ERROR_TYPES.NETWORK, severity: ERROR_SEVERITY.HIGH };
  }

  // HTTP status code errors
  if (error.response?.status) {
    const status = error.response.status;
    
    if (status === 401) {
      return { type: ERROR_TYPES.AUTHENTICATION, severity: ERROR_SEVERITY.HIGH };
    }
    if (status === 403) {
      return { type: ERROR_TYPES.AUTHORIZATION, severity: ERROR_SEVERITY.HIGH };
    }
    if (status === 404) {
      return { type: ERROR_TYPES.NOT_FOUND, severity: ERROR_SEVERITY.MEDIUM };
    }
    if (status >= 500) {
      return { type: ERROR_TYPES.SERVER, severity: ERROR_SEVERITY.CRITICAL };
    }
    if (status >= 400) {
      return { type: ERROR_TYPES.CLIENT, severity: ERROR_SEVERITY.MEDIUM };
    }
  }

  // Validation errors
  if (error.name === 'ValidationError' || error.message?.includes('validation')) {
    return { type: ERROR_TYPES.VALIDATION, severity: ERROR_SEVERITY.LOW };
  }

  // Default classification
  return { type: ERROR_TYPES.UNKNOWN, severity: ERROR_SEVERITY.MEDIUM };
};

// User-friendly error messages
export const getUserFriendlyMessage = (error, type) => {
  const messages = {
    [ERROR_TYPES.NETWORK]: 'Unable to connect to the server. Please check your internet connection and try again.',
    [ERROR_TYPES.AUTHENTICATION]: 'Your session has expired. Please log in again.',
    [ERROR_TYPES.AUTHORIZATION]: 'You don\'t have permission to perform this action.',
    [ERROR_TYPES.NOT_FOUND]: 'The requested resource was not found.',
    [ERROR_TYPES.SERVER]: 'Our servers are experiencing issues. Please try again later.',
    [ERROR_TYPES.VALIDATION]: 'Please check your input and try again.',
    [ERROR_TYPES.CLIENT]: 'There was an issue with your request. Please try again.',
    [ERROR_TYPES.UNKNOWN]: 'An unexpected error occurred. Please try again.'
  };

  return messages[type] || messages[ERROR_TYPES.UNKNOWN];
};

// Error reporting
export const reportError = async (error, context = {}) => {
  const errorReport = {
    message: error.message,
    stack: error.stack,
    type: classifyError(error).type,
    severity: classifyError(error).severity,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    context: {
      userId: context.userId,
      sessionId: context.sessionId,
      action: context.action,
      component: context.component,
      ...context
    }
  };

  try {
    // In production, send to error monitoring service
    console.error('Error Report:', errorReport);
    
    // Example: Send to Sentry, LogRocket, or custom endpoint
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
};

// Global error handler
export const setupGlobalErrorHandlers = (toast) => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    const { type, severity } = classifyError(event.reason);
    const message = getUserFriendlyMessage(event.reason, type);
    
    toast.error('Unexpected Error', message, {
      duration: 8000,
      actions: [
        {
          label: 'Report Issue',
          onClick: () => reportError(event.reason, { source: 'unhandledrejection' })
        }
      ]
    });

    // Report the error
    reportError(event.reason, { source: 'unhandledrejection' });
  });

  // Handle global JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    
    const { type, severity } = classifyError(event.error);
    const message = getUserFriendlyMessage(event.error, type);
    
    toast.error('Application Error', message, {
      duration: 8000,
      actions: [
        {
          label: 'Report Issue',
          onClick: () => reportError(event.error, { source: 'global' })
        }
      ]
    });

    // Report the error
    reportError(event.error, { source: 'global' });
  });
};

// API error handler
export const handleApiError = (error, toast) => {
  const { type, severity } = classifyError(error);
  const message = getUserFriendlyMessage(error, type);
  
  // Show appropriate toast based on severity
  if (severity === ERROR_SEVERITY.CRITICAL) {
    toast.error('Critical Error', message, {
      duration: 10000,
      actions: [
        {
          label: 'Report Issue',
          onClick: () => reportError(error, { source: 'api' })
        }
      ]
    });
  } else if (severity === ERROR_SEVERITY.HIGH) {
    toast.error('Error', message, {
      duration: 8000
    });
  } else {
    toast.warning('Warning', message, {
      duration: 5000
    });
  }

  // Report the error
  reportError(error, { source: 'api' });
};

// Retry mechanism
export const withRetry = async (fn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain error types
      const { type } = classifyError(error);
      if ([ERROR_TYPES.AUTHENTICATION, ERROR_TYPES.AUTHORIZATION, ERROR_TYPES.VALIDATION].includes(type)) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// Error boundary helper
export const createErrorBoundary = (Component, fallback) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
      return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
      reportError(error, {
        source: 'errorBoundary',
        component: Component.name,
        errorInfo
      });
    }

    render() {
      if (this.state.hasError) {
        return fallback || <div>Something went wrong.</div>;
      }

      return <Component {...this.props} />;
    }
  };
};

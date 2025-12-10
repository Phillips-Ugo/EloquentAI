import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Send,
  Copy,
  CheckCircle,
} from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      isReporting: false,
      isCopied: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString()
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service
    this.reportError(error, errorInfo);
  }

  reportError = async (error, errorInfo) => {
    try {
      // In a real app, you would send this to your error monitoring service
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorId: this.state.errorId
      };

      // Simulate error reporting
      console.log('Error reported:', errorReport);
      
      // You could send to services like Sentry, LogRocket, etc.
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleCopyError = async () => {
    const errorText = `
Error ID: ${this.state.errorId}
Message: ${this.state.error?.message}
Stack: ${this.state.error?.stack}
Component Stack: ${this.state.errorInfo?.componentStack}
Timestamp: ${new Date().toISOString()}
URL: ${window.location.href}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      this.setState({ isCopied: true });
      setTimeout(() => this.setState({ isCopied: false }), 2000);
    } catch (err) {
      console.error('Failed to copy error details:', err);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8"
          >
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>

              {/* Error Title */}
              <h1 className="text-3xl font-bold text-white mb-4">
                Oops! Something went wrong
              </h1>

              {/* Error Description */}
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                We encountered an unexpected error. Don't worry, our team has been notified and we're working to fix it.
              </p>

              {/* Error ID */}
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <p className="text-gray-400 text-sm mb-2">Error ID</p>
                <p className="text-white font-mono text-sm">{this.state.errorId}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="flex items-center justify-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                >
                  <Home className="w-5 h-5" />
                  <span>Go Home</span>
                </button>
              </div>

              {/* Error Details (Collapsible) */}
              {this.state.error && (
                <div className="mt-8">
                  <details className="text-left">
                    <summary className="cursor-pointer text-gray-400 hover:text-white transition-colors mb-4 flex items-center space-x-2">
                      <Bug className="w-4 h-4" />
                      <span>Technical Details</span>
                    </summary>
                    
                    <div className="bg-blue-900/20 rounded-xl p-4 space-y-4">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Error Message</h4>
                        <p className="text-red-300 text-sm font-mono break-words">
                          {this.state.error.message}
                        </p>
                      </div>

                      {this.state.error.stack && (
                        <div>
                          <h4 className="text-white font-semibold mb-2">Stack Trace</h4>
                          <pre className="text-gray-300 text-xs overflow-auto max-h-32 bg-blue-900/30 p-3 rounded">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <button
                          onClick={this.handleCopyError}
                          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {this.state.isCopied ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Error Details</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => this.reportError(this.state.error, this.state.errorInfo)}
                          disabled={this.state.isReporting}
                          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                          <Send className="w-4 h-4" />
                          <span>{this.state.isReporting ? 'Reporting...' : 'Report Issue'}</span>
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {/* Help Text */}
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  If this problem persists, please contact our support team with the Error ID above.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

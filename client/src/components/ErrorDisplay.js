import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorDisplay = ({ error, onRetry, title = 'Something went wrong' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center"
    >
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{error || 'An unexpected error occurred. Please try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      )}
    </motion.div>
  );
};

export default ErrorDisplay;


import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const content = (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizeClasses[size]} border-4 border-orange-200 border-t-orange-500 rounded-full`}
      />
      {text && (
        <p className="mt-4 text-gray-600 font-medium">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
};

export default LoadingSpinner;


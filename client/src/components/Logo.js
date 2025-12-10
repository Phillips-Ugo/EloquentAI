import React from 'react';
import { motion } from 'framer-motion';

/**
 * Eloquent AI Logo
 * 
 * Design Rationale:
 * The logo combines three powerful visual metaphors: a speech bubble (communication), 
 * neural network nodes (AI), and a stylized waveform (voice/data). The geometric design 
 * uses flowing curves that suggest both human speech patterns and AI learning pathways.
 * The dual-tone blue-to-purple gradient evokes trust, intelligence, and innovation—
 * essential for enterprise adoption. The hexagonal base provides stability while the 
 * organic curves add approachability. This creates a distinctive mark that's memorable 
 * at any scale, from app icons to investor presentations.
 */

export const LogoIcon = ({ size = 40, className = '', animated = false }) => {
  const iconVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96]
      }
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.2 }
    }
  };

  const pathVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5, ease: "easeInOut" },
        opacity: { duration: 0.5 }
      }
    }
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      variants={animated ? iconVariants : {}}
      initial={animated ? "initial" : false}
      animate={animated ? "animate" : false}
      whileHover={animated ? "hover" : false}
    >
      <defs>
        {/* Primary Gradient */}
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        
        {/* Glow Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Outer Hexagonal Ring - Neural Network */}
      <motion.path
        d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
        stroke="url(#logoGradient)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        variants={animated ? pathVariants : {}}
      />

      {/* Inner Speech Bubble Shape */}
      <motion.path
        d="M50 25 C60 25, 70 32, 70 45 C70 58, 60 65, 50 65 L45 65 L40 75 L40 65 C30 65, 20 58, 20 45 C20 32, 30 25, 40 25 L50 25 Z"
        fill="url(#logoGradient)"
        filter="url(#glow)"
        initial={animated ? { scale: 0, opacity: 0 } : false}
        animate={animated ? { 
          scale: 1, 
          opacity: 1,
          transition: { delay: 0.3, duration: 0.5 }
        } : false}
      />

      {/* AI Neural Nodes */}
      {[
        { cx: 35, cy: 40 },
        { cx: 50, cy: 45 },
        { cx: 65, cy: 40 },
      ].map((node, i) => (
        <motion.circle
          key={i}
          cx={node.cx}
          cy={node.cy}
          r="3"
          fill="white"
          initial={animated ? { scale: 0, opacity: 0 } : false}
          animate={animated ? { 
            scale: 1, 
            opacity: 1,
            transition: { delay: 0.5 + i * 0.1, duration: 0.3 }
          } : false}
        />
      ))}

      {/* Connection Lines */}
      <motion.path
        d="M35 40 L50 45 L65 40"
        stroke="white"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        animate={animated ? { 
          pathLength: 1, 
          opacity: 0.6,
          transition: { delay: 0.8, duration: 0.5 }
        } : false}
      />

      {/* Voice Wave Accent */}
      <motion.path
        d="M30 55 Q35 52, 40 55 T50 55 T60 55 T70 55"
        stroke="white"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
        initial={animated ? { pathLength: 0, opacity: 0 } : false}
        animate={animated ? { 
          pathLength: 1, 
          opacity: 0.8,
          transition: { delay: 1, duration: 0.6 }
        } : false}
      />
    </motion.svg>
  );
};

export const LogoWordmark = ({ size = 'default', className = '', theme = 'dark' }) => {
  const sizeClasses = {
    small: 'h-6',
    default: 'h-8',
    large: 'h-12',
    xlarge: 'h-16',
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-900';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <LogoIcon size={size === 'small' ? 24 : size === 'default' ? 32 : size === 'large' ? 48 : 64} />
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className={`font-bold ${textColor} ${sizeClasses[size]} flex items-center`}>
          <span className="bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 bg-clip-text text-transparent">
            Eloquent
          </span>
          <span className={`ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} font-normal`}>
            AI
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export const LogoIconOnly = ({ size = 40, className = '', glowing = false }) => {
  return (
    <div className={`relative ${className}`}>
      {glowing && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      <LogoIcon size={size} animated={glowing} />
    </div>
  );
};

// Badge variant for app icons
export const LogoBadge = ({ size = 64, className = '' }) => {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      <div 
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"
        style={{ padding: size * 0.15 }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <LogoIcon size={size * 0.7} />
        </div>
      </div>
    </div>
  );
};

export default LogoWordmark;


import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Eye, Mic, MessageSquare, TrendingUp,
  Activity, Sparkles, CheckCircle, AlertCircle, ChevronRight,
  Volume2, Settings, Maximize2, Download
} from 'lucide-react';

/**
 * Interactive Demo Showcase Component
 * 
 * This component provides a compelling, interactive demonstration of the AI analysis
 * capabilities. Designed to wow investors and potential acquirers by showing:
 * - Real-time AI overlays
 * - Live metric calculations
 * - Professional UI patterns
 * - Smooth animations
 */

const InteractiveDemoShowcase = ({ autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeInsight, setActiveInsight] = useState(0);
  const maxTime = 120; // 2 minutes demo

  // Simulated real-time metrics
  const [metrics, setMetrics] = useState({
    eyeContact: 0,
    clarity: 0,
    pace: 0,
    confidence: 0,
    engagement: 0,
  });

  // AI Insights that appear during demo
  const insights = [
    {
      time: 10,
      type: 'success',
      icon: Eye,
      title: 'Excellent Eye Contact',
      message: 'Great! You\'re maintaining strong eye contact with the camera.',
      metric: 'eyeContact',
      value: 94
    },
    {
      time: 25,
      type: 'warning',
      icon: MessageSquare,
      title: 'Filler Words Detected',
      message: 'Try to reduce "um" and "like" for more professional delivery.',
      metric: 'clarity',
      value: 78
    },
    {
      time: 40,
      type: 'success',
      icon: Mic,
      title: 'Perfect Speaking Pace',
      message: 'Your pace of 145 WPM is ideal for audience comprehension.',
      metric: 'pace',
      value: 92
    },
    {
      time: 60,
      type: 'info',
      icon: TrendingUp,
      title: 'Confidence Improving',
      message: 'Your tone and body language show increasing confidence!',
      metric: 'confidence',
      value: 88
    },
    {
      time: 90,
      type: 'success',
      icon: Activity,
      title: 'High Engagement',
      message: 'Your enthusiasm and gestures are keeping the audience engaged.',
      metric: 'engagement',
      value: 91
    },
  ];

  // Simulate playing demo
  useEffect(() => {
    let interval;
    if (isPlaying && currentTime < maxTime) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          const newTime = prev + 1;
          
          // Update metrics progressively
          setMetrics({
            eyeContact: Math.min(94, (newTime / maxTime) * 100),
            clarity: Math.min(82, (newTime / maxTime) * 90),
            pace: Math.min(92, (newTime / maxTime) * 95),
            confidence: Math.min(88, (newTime / maxTime) * 92),
            engagement: Math.min(91, (newTime / maxTime) * 94),
          });

          // Trigger insights
          insights.forEach((insight, index) => {
            if (Math.floor(newTime) === insight.time) {
              setActiveInsight(index);
            }
          });

          return newTime;
        });
      }, 50); // Fast demo
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime]);

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
    setActiveInsight(0);
    setMetrics({
      eyeContact: 0,
      clarity: 0,
      pace: 0,
      confidence: 0,
      engagement: 0,
    });
  };

  const currentInsight = insights[activeInsight];
  const progress = (currentTime / maxTime) * 100;

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700"
      >
        {/* Demo Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-white font-semibold">Live Demo: Sales Presentation</span>
            </div>
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center space-x-2 bg-red-500/20 border border-red-500/50 rounded-full px-3 py-1"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-400 text-sm font-medium">LIVE</span>
              </motion.div>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                <Maximize2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Demo Area */}
        <div className="relative">
          <div className="grid lg:grid-cols-3 gap-4 p-6">
            {/* Video Preview Area */}
            <div className="lg:col-span-2 relative">
              <div className="aspect-video bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-2xl flex items-center justify-center relative overflow-hidden border border-gray-700">
                {/* Simulated Face Detection Overlay */}
                <motion.div
                  animate={isPlaying ? { 
                    scale: [1, 1.02, 1],
                    rotate: [0, 1, -1, 0]
                  } : {}}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="relative"
                >
                  <div className="w-48 h-48 border-2 border-cyan-400 rounded-lg shadow-lg shadow-cyan-400/50">
                    <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-cyan-400 rounded-tl-lg"></div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-cyan-400 rounded-tr-lg"></div>
                    <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-cyan-400 rounded-bl-lg"></div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-cyan-400 rounded-br-lg"></div>
                  </div>
                  
                  {/* Face Landmarks */}
                  {isPlaying && (
                    <>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-12 left-12 w-3 h-3 bg-green-400 rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                        className="absolute top-12 right-12 w-3 h-3 bg-green-400 rounded-full"
                      />
                    </>
                  )}
                </motion.div>

                {/* AI Overlays */}
                <AnimatePresence>
                  {isPlaying && currentInsight && (
                    <motion.div
                      key={activeInsight}
                      initial={{ opacity: 0, x: -20, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.9 }}
                      className="absolute top-4 left-4 right-4"
                    >
                      <div className={`
                        backdrop-blur-xl rounded-xl p-4 border-2 shadow-2xl
                        ${currentInsight.type === 'success' ? 'bg-green-500/20 border-green-500/50' : ''}
                        ${currentInsight.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/50' : ''}
                        ${currentInsight.type === 'info' ? 'bg-blue-500/20 border-blue-500/50' : ''}
                      `}>
                        <div className="flex items-start space-x-3">
                          <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                            ${currentInsight.type === 'success' ? 'bg-green-500/30' : ''}
                            ${currentInsight.type === 'warning' ? 'bg-yellow-500/30' : ''}
                            ${currentInsight.type === 'info' ? 'bg-blue-500/30' : ''}
                          `}>
                            <currentInsight.icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-white mb-1">{currentInsight.title}</div>
                            <div className="text-sm text-white/80">{currentInsight.message}</div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Real-time Score */}
                {isPlaying && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-4 right-4"
                  >
                    <div className="backdrop-blur-xl bg-blue-900/40 border border-white/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/80 text-sm">Overall Performance</span>
                        <span className="text-2xl font-black text-white">
                          {Math.round((metrics.eyeContact + metrics.clarity + metrics.pace + metrics.confidence + metrics.engagement) / 5)}%
                        </span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(metrics.eyeContact + metrics.clarity + metrics.pace + metrics.confidence + metrics.engagement) / 5}%` }}
                          className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Play Button Overlay */}
                {!isPlaying && currentTime === 0 && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                      <Play className="w-10 h-10 text-gray-900 ml-1" />
                    </div>
                  </motion.button>
                )}
              </div>

              {/* Playback Controls */}
              <div className="mt-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-white" />
                    ) : (
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                  >
                    <RotateCcw className="w-5 h-5 text-white" />
                  </button>
                  
                  {/* Progress Bar */}
                  <div className="flex-1">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{Math.floor(currentTime)}s</span>
                      <span>{maxTime}s</span>
                    </div>
                  </div>

                  <button className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                    <Volume2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Metrics Panel */}
            <div className="space-y-3">
              <h3 className="text-white font-bold mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Live Metrics
              </h3>
              
              {Object.entries(metrics).map(([key, value], i) => {
                const labels = {
                  eyeContact: 'Eye Contact',
                  clarity: 'Speech Clarity',
                  pace: 'Speaking Pace',
                  confidence: 'Confidence',
                  engagement: 'Engagement'
                };
                
                const colors = [
                  'from-blue-500 to-cyan-500',
                  'from-purple-500 to-pink-500',
                  'from-green-500 to-emerald-500',
                  'from-orange-500 to-red-500',
                  'from-indigo-500 to-purple-500'
                ];

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white/80 text-sm font-medium">{labels[key]}</span>
                      <span className="text-white font-bold">{Math.round(value)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full bg-gradient-to-r ${colors[i]} rounded-full`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Demo Footer */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-t border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white/60 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Advanced AI & Computer Vision</span>
            </div>
            <button className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export Report</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Demo Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 text-center"
      >
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          <strong>Interactive Demo:</strong> This showcase demonstrates our real-time AI analysis capabilities,
          providing instant feedback on communication metrics. Click play to see the magic happen.
        </p>
      </motion.div>
    </div>
  );
};

export default InteractiveDemoShowcase;


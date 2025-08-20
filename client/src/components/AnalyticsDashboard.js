import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Clock,
  Activity,
  Download,
  Share2,
  Calendar,
  Users,
  Zap,
  X
} from 'lucide-react';

const AnalyticsDashboard = ({ sessionData, isVisible, onClose }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('overall');

  // Mock data for demonstration - in real app, this would come from backend
  const [analyticsData, setAnalyticsData] = useState({
    sessions: [
      { date: '2024-01-01', overall: 0.75, posture: 0.8, eyeContact: 0.7, gestures: 0.6, emotion: 0.8 },
      { date: '2024-01-02', overall: 0.82, posture: 0.85, eyeContact: 0.75, gestures: 0.7, emotion: 0.85 },
      { date: '2024-01-03', overall: 0.78, posture: 0.8, eyeContact: 0.8, gestures: 0.65, emotion: 0.8 },
      { date: '2024-01-04', overall: 0.85, posture: 0.9, eyeContact: 0.85, gestures: 0.8, emotion: 0.85 },
      { date: '2024-01-05', overall: 0.88, posture: 0.9, eyeContact: 0.9, gestures: 0.85, emotion: 0.9 },
    ],
    improvements: {
      posture: '+15%',
      eyeContact: '+20%',
      gestures: '+25%',
      emotion: '+10%',
      overall: '+18%'
    },
    insights: [
      'Your posture has improved significantly over the last week',
      'Eye contact consistency is now above average',
      'Gesture usage has increased by 25%',
      'Overall confidence score is trending upward'
    ]
  });

  const metrics = [
    { key: 'overall', label: 'Overall Score', icon: Award, color: 'from-purple-500 to-purple-600' },
    { key: 'posture', label: 'Posture', icon: Target, color: 'from-blue-500 to-blue-600' },
    { key: 'eyeContact', label: 'Eye Contact', icon: Activity, color: 'from-green-500 to-green-600' },
    { key: 'gestures', label: 'Gestures', icon: Zap, color: 'from-orange-500 to-orange-600' },
    { key: 'emotion', label: 'Emotion', icon: Users, color: 'from-pink-500 to-pink-600' }
  ];

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 0.8) return 'bg-green-100';
    if (score >= 0.6) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const formatScore = (score) => {
    return Math.round(score * 100);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(analyticsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'communication-analytics.json';
    link.click();
  };

  const shareResults = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Communication Analytics',
        text: 'Check out my communication improvement progress!',
        url: window.location.href
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
                  <p className="text-purple-100">Track your communication improvement journey</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={exportData}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
                    title="Export Data"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={shareResults}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
                    title="Share Results"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Timeframe Selector */}
              <div className="mb-6">
                <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
                  {['day', 'week', 'month'].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        selectedTimeframe === timeframe
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {metrics.map((metric) => (
                  <motion.div
                    key={metric.key}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${metric.color}`}>
                        <metric.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{metric.label}</p>
                        <p className={`text-2xl font-bold ${getScoreColor(analyticsData.improvements[metric.key])}`}>
                          {analyticsData.improvements[metric.key]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current</span>
                        <span className="font-medium">
                          {formatScore(analyticsData.sessions[analyticsData.sessions.length - 1]?.[metric.key] || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${metric.color}`}
                          style={{
                            width: `${formatScore(analyticsData.sessions[analyticsData.sessions.length - 1]?.[metric.key] || 0)}%`
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Performance Chart */}
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 mb-6">
                <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
                <div className="h-64 flex items-end justify-between space-x-2">
                  {analyticsData.sessions.map((session, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-gray-200 rounded-t-lg relative">
                        <div
                          className="bg-gradient-to-t from-purple-500 to-blue-500 rounded-t-lg transition-all duration-500"
                          style={{ height: `${formatScore(session[selectedMetric])}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">{session.date}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    {analyticsData.insights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-gray-700">{insight}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Target className="w-5 h-5 text-blue-600 mr-2" />
                    Recommendations
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-800">Focus on Gesture Variety</p>
                      <p className="text-xs text-blue-600 mt-1">Try incorporating more hand movements to emphasize key points</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800">Maintain Eye Contact</p>
                      <p className="text-xs text-green-600 mt-1">Your eye contact is improving - keep practicing with different audience sizes</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-800">Practice Pacing</p>
                      <p className="text-xs text-purple-600 mt-1">Work on varying your speaking pace to maintain audience engagement</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnalyticsDashboard; 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Mic,
  Video,
  FileText,
  BarChart3,
  Users,
  Target,
  Award,
  Plus,
} from 'lucide-react';

const ModernDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [liveMetrics, setLiveMetrics] = useState({
    speech: { clarity: 87, pace: 92, engagement: 78, confidence: 85 },
    video: { posture: 78, eyeContact: 85, gestures: 59, presence: 82 },
    text: { readability: 91, sentiment: 88, structure: 85, impact: 79 }
  });

  const recentAnalyses = [
    { id: 1, type: 'speech', title: 'Q4 Presentation', score: 92, date: '2024-01-15', duration: '15:30' },
    { id: 2, type: 'video', title: 'Team Meeting', score: 88, date: '2024-01-14', duration: '8:45' },
    { id: 3, type: 'text', title: 'Email Campaign', score: 95, date: '2024-01-13', duration: '2:15' },
    { id: 4, type: 'speech', title: 'Client Call', score: 85, date: '2024-01-12', duration: '12:20' },
  ];

  // Chart data
  const speechTrendData = [
    { name: 'Jan', clarity: 85, pace: 78, engagement: 82, confidence: 88 },
    { name: 'Feb', clarity: 87, pace: 82, engagement: 85, confidence: 90 },
    { name: 'Mar', clarity: 89, pace: 85, engagement: 88, confidence: 92 },
    { name: 'Apr', clarity: 91, pace: 88, engagement: 90, confidence: 94 },
    { name: 'May', clarity: 93, pace: 90, engagement: 92, confidence: 95 },
    { name: 'Jun', clarity: 95, pace: 92, engagement: 94, confidence: 96 },
  ];

  const videoTrendData = [
    { name: 'Jan', posture: 75, eyeContact: 80, gestures: 65, presence: 78 },
    { name: 'Feb', posture: 78, eyeContact: 83, gestures: 68, presence: 81 },
    { name: 'Mar', posture: 80, eyeContact: 85, gestures: 70, presence: 83 },
    { name: 'Apr', posture: 82, eyeContact: 87, gestures: 72, presence: 85 },
    { name: 'May', posture: 84, eyeContact: 89, gestures: 74, presence: 87 },
    { name: 'Jun', posture: 86, eyeContact: 91, gestures: 76, presence: 89 },
  ];

  const textTrendData = [
    { name: 'Jan', readability: 88, sentiment: 85, structure: 82, impact: 80 },
    { name: 'Feb', readability: 90, sentiment: 87, structure: 84, impact: 82 },
    { name: 'Mar', readability: 92, sentiment: 89, structure: 86, impact: 84 },
    { name: 'Apr', readability: 94, sentiment: 91, structure: 88, impact: 86 },
    { name: 'May', readability: 96, sentiment: 93, structure: 90, impact: 88 },
    { name: 'Jun', readability: 98, sentiment: 95, structure: 92, impact: 90 },
  ];

  const analysisTypeData = [
    { name: 'Speech', value: 45, color: '#8b5cf6' },
    { name: 'Video', value: 30, color: '#10b981' },
    { name: 'Text', value: 25, color: '#f59e0b' },
  ];

  const weeklyPerformanceData = [
    { day: 'Mon', analyses: 12, score: 88 },
    { day: 'Tue', analyses: 18, score: 92 },
    { day: 'Wed', analyses: 15, score: 85 },
    { day: 'Thu', analyses: 22, score: 94 },
    { day: 'Fri', analyses: 20, score: 90 },
    { day: 'Sat', analyses: 8, score: 87 },
    { day: 'Sun', analyses: 5, score: 83 },
  ];

  // Animate metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMetrics(prev => ({
        speech: {
          clarity: Math.min(100, prev.speech.clarity + (Math.random() - 0.5) * 2),
          pace: Math.min(100, prev.speech.pace + (Math.random() - 0.5) * 2),
          engagement: Math.min(100, prev.speech.engagement + (Math.random() - 0.5) * 2),
          confidence: Math.min(100, prev.speech.confidence + (Math.random() - 0.5) * 2)
        },
        video: {
          posture: Math.min(100, prev.video.posture + (Math.random() - 0.5) * 2),
          eyeContact: Math.min(100, prev.video.eyeContact + (Math.random() - 0.5) * 2),
          gestures: Math.min(100, prev.video.gestures + (Math.random() - 0.5) * 2),
          presence: Math.min(100, prev.video.presence + (Math.random() - 0.5) * 2)
        },
        text: {
          readability: Math.min(100, prev.text.readability + (Math.random() - 0.5) * 2),
          sentiment: Math.min(100, prev.text.sentiment + (Math.random() - 0.5) * 2),
          structure: Math.min(100, prev.text.structure + (Math.random() - 0.5) * 2),
          impact: Math.min(100, prev.text.impact + (Math.random() - 0.5) * 2)
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'speech', label: 'Speech', icon: Mic },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'text', label: 'Text', icon: FileText },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500/20 border-green-500/30';
    if (score >= 80) return 'bg-yellow-500/20 border-yellow-500/30';
    if (score >= 70) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-gray-400">Real-time communication insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm">Live</span>
            </div>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300">
              <Plus className="w-4 h-4 inline mr-2" />
              New Analysis
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-xl p-1 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Analyses', value: '1,247', icon: BarChart3, color: 'text-blue-400', change: '+12%' },
                  { label: 'Avg Score', value: '89.2%', icon: Target, color: 'text-green-400', change: '+3.2%' },
                  { label: 'Active Users', value: '2,341', icon: Users, color: 'text-purple-400', change: '+8.1%' },
                  { label: 'Success Rate', value: '94.7%', icon: Award, color: 'text-yellow-400', change: '+1.5%' }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.color} bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <div className="text-green-400 text-sm font-semibold">{stat.change}</div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-gray-400 text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Analysis Type Distribution */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Analysis Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysisTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analysisTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(30, 58, 138, 0.8)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white'
                        }} 
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Performance */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Weekly Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.6)" />
                      <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(30, 58, 138, 0.8)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8b5cf6" 
                        fill="url(#colorGradient)" 
                        strokeWidth={3}
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Analyses */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Recent Analyses</h3>
                  <button className="text-purple-400 hover:text-purple-300 transition-colors">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentAnalyses.map((analysis, index) => (
                    <motion.div
                      key={analysis.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          analysis.type === 'speech' ? 'bg-purple-500/20 text-purple-400' :
                          analysis.type === 'video' ? 'bg-green-500/20 text-green-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {analysis.type === 'speech' ? <Mic className="w-5 h-5" /> :
                           analysis.type === 'video' ? <Video className="w-5 h-5" /> :
                           <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-white font-semibold">{analysis.title}</div>
                          <div className="text-gray-400 text-sm">{analysis.date} • {analysis.duration}</div>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${getScoreBg(analysis.score)} ${getScoreColor(analysis.score)}`}>
                        {analysis.score}%
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'speech' && (
            <motion.div
              key="speech"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Live Speech Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(liveMetrics.speech).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                  >
                    <div className="text-3xl font-bold text-white mb-2">{Math.round(value)}%</div>
                    <div className="text-gray-400 text-sm capitalize mb-4">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Speech Analysis Chart */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Speech Analysis Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={speechTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.6)" />
                      <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(30, 58, 138, 0.8)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white'
                        }} 
                      />
                      <Legend />
                      <Line type="monotone" dataKey="clarity" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }} />
                      <Line type="monotone" dataKey="pace" stroke="#ec4899" strokeWidth={3} dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }} />
                      <Line type="monotone" dataKey="engagement" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }} />
                      <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Live Video Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(liveMetrics.video).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                  >
                    <div className="text-3xl font-bold text-white mb-2">{Math.round(value)}%</div>
                    <div className="text-gray-400 text-sm capitalize mb-4">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-green-500 to-cyan-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Video Analysis Chart */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Body Language Analysis</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={videoTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.6)" />
                      <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(30, 58, 138, 0.8)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white'
                        }} 
                      />
                      <Legend />
                      <Bar dataKey="posture" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="eyeContact" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="gestures" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="presence" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'text' && (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Live Text Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(liveMetrics.text).map(([key, value], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
                  >
                    <div className="text-3xl font-bold text-white mb-2">{Math.round(value)}%</div>
                    <div className="text-gray-400 text-sm capitalize mb-4">{key.replace(/([A-Z])/g, ' $1')}</div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Text Analysis Chart */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-6">Text Analysis Trends</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={textTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.6)" />
                      <YAxis stroke="rgba(255, 255, 255, 0.6)" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(30, 58, 138, 0.8)', 
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '8px',
                          color: 'white'
                        }} 
                      />
                      <Legend />
                      <Area type="monotone" dataKey="readability" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="sentiment" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="structure" stackId="1" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="impact" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ModernDashboard;

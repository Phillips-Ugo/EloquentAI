import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Eye, Mic, MessageSquare, Activity,
  Calendar, Clock, Target, Award, BarChart3, LineChart, PieChart,
  Video, Play, Download, Share2, ChevronRight, Zap, Star, Users
} from 'lucide-react';
import { 
  LineChart as RechartsLine, Line, BarChart as RechartsBar, Bar,
  PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart
} from 'recharts';

const NewDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week', 'month', 'year'

  // Mock data - In real app, this would come from API
  const statsData = {
    totalSessions: 156,
    totalHours: 48.5,
    avgScore: 8.7,
    improvement: 23,
    change: {
      sessions: 12,
      hours: 8,
      score: 0.8,
      improvement: 5,
    }
  };

  const weeklyData = [
    { day: 'Mon', score: 7.5, sessions: 3, clarity: 85 },
    { day: 'Tue', score: 8.2, sessions: 5, clarity: 88 },
    { day: 'Wed', score: 8.0, sessions: 4, clarity: 86 },
    { day: 'Thu', score: 8.8, sessions: 6, clarity: 92 },
    { day: 'Fri', score: 9.1, sessions: 7, clarity: 94 },
    { day: 'Sat', score: 8.5, sessions: 2, clarity: 90 },
    { day: 'Sun', score: 8.7, sessions: 3, clarity: 91 },
  ];

  const skillsData = [
    { skill: 'Eye Contact', score: 94, color: '#3B82F6' },
    { skill: 'Clarity', score: 89, color: '#8B5CF6' },
    { skill: 'Pace', score: 87, color: '#06B6D4' },
    { skill: 'Confidence', score: 91, color: '#10B981' },
    { skill: 'Engagement', score: 85, color: '#F59E0B' },
  ];

  const recentSessions = [
    { id: 1, title: 'Product Demo', date: '2 hours ago', duration: '24:31', score: 9.2, thumbnail: '🎯' },
    { id: 2, title: 'Team Meeting', date: '1 day ago', duration: '45:12', score: 8.5, thumbnail: '👥' },
    { id: 3, title: 'Client Presentation', date: '2 days ago', duration: '32:18', score: 9.0, thumbnail: '💼' },
    { id: 4, title: 'Practice Session', date: '3 days ago', duration: '18:45', score: 8.7, thumbnail: '🎬' },
  ];

  const achievements = [
    { icon: Star, title: 'Perfect Week', desc: '7 days streak', unlocked: true, color: 'from-yellow-500 to-orange-500' },
    { icon: Target, title: 'High Scorer', desc: '10+ sessions above 9.0', unlocked: true, color: 'from-green-500 to-emerald-500' },
    { icon: Zap, title: 'Quick Learner', desc: '20% improvement in 1 week', unlocked: false, color: 'from-blue-500 to-cyan-500' },
    { icon: Award, title: 'Master Communicator', desc: '50+ sessions completed', unlocked: false, color: 'from-purple-500 to-pink-500' },
  ];

  const StatCard = ({ icon: Icon, title, value, change, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-gray-800 dark:bg-gray-900 rounded-2xl p-6 border-2 border-gray-700 dark:border-gray-800 hover:border-gray-600 dark:hover:border-gray-700 transition-all shadow-lg hover:shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
        {change !== undefined && (
          <div className={`flex items-center space-x-1 ${
            change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="text-sm font-semibold">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {title}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-900 dark:bg-gray-950 pb-20">
      {/* Header */}
      <div className="bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Here's your communication performance overview
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              {['week', 'month', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-md font-semibold text-sm transition-all ${
                    selectedPeriod === period
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Video}
            title="Total Sessions"
            value={statsData.totalSessions}
            change={statsData.change.sessions}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            icon={Clock}
            title="Practice Hours"
            value={`${statsData.totalHours}h`}
            change={statsData.change.hours}
            color="from-purple-500 to-pink-500"
          />
          <StatCard
            icon={Star}
            title="Average Score"
            value={`${statsData.avgScore}/10`}
            change={statsData.change.score}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            icon={TrendingUp}
            title="Improvement"
            value={`+${statsData.improvement}%`}
            change={statsData.change.improvement}
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Performance Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                  Performance Trend
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your weekly communication scores
                </p>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" domain={[0, 10]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  fill="url(#scoreGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Skills Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-lg"
          >
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">
              Skills Breakdown
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Your communication strengths
            </p>

            <div className="space-y-4">
              {skillsData.map((skill, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {skill.skill}
                    </span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {skill.score}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${skill.score}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: skill.color }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Sessions & Achievements */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                Recent Sessions
              </h2>
              <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center">
                View all
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            <div className="space-y-3">
              {recentSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ x: 4 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-2xl">
                      {session.thumbnail}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white mb-1">
                        {session.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {session.date} • {session.duration}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-2xl font-black text-gray-900 dark:text-white">
                        {session.score}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Score
                      </div>
                    </div>
                    <button className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-100 dark:border-gray-700 shadow-lg"
          >
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              Achievements
            </h2>

            <div className="space-y-4">
              {achievements.map((achievement, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${
                    achievement.unlocked
                      ? 'border-gray-200 dark:border-gray-600 bg-gradient-to-br ' + achievement.color
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 opacity-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      achievement.unlocked ? 'bg-white/30' : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      <achievement.icon className={`w-6 h-6 ${
                        achievement.unlocked ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold mb-1 ${
                        achievement.unlocked ? 'text-white' : 'text-gray-700 dark:text-gray-400'
                      }`}>
                        {achievement.title}
                      </div>
                      <div className={`text-xs ${
                        achievement.unlocked ? 'text-white/80' : 'text-gray-600 dark:text-gray-500'
                      }`}>
                        {achievement.desc}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-2xl p-8 text-center shadow-2xl"
        >
          <h2 className="text-3xl font-black text-white mb-4">
            Ready for your next session?
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto">
            Start a new analysis session and continue improving your communication skills
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-gray-700 hover:bg-gray-100 font-bold px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
              Start Live Analysis
            </button>
            <button className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 font-bold px-8 py-4 rounded-xl transition-all border-2 border-white/20">
              Upload Video
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NewDashboard;


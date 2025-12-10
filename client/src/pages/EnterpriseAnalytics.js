import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Target,
  Activity,
  Eye,
  MessageSquare,
  PieChart,
  LineChart,
  Download,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Star,
  Award,
  Zap,
  Globe,
  Building2,
  Shield,
  Database,
  Cloud,
  Settings,
  RefreshCw,
  Maximize2,
  Minimize2,
  Share2,
  Bell,
  Search,
  Plus,
  MoreHorizontal
} from 'lucide-react';

const EnterpriseAnalytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [liveData, setLiveData] = useState(true);

  // Simulated real-time data
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 12547,
      activeSessions: 2341,
      analysesCompleted: 45678,
      averageScore: 87.3,
      trends: {
        users: '+12.5%',
        sessions: '+8.3%',
        analyses: '+15.2%',
        score: '+2.1%'
      }
    },
    realTime: {
      currentSessions: 2341,
      analysesInProgress: 127,
      averageResponseTime: '1.2s',
      systemHealth: '99.9%'
    }
  });

  // Update data in real-time
  useEffect(() => {
    if (liveData) {
      const interval = setInterval(() => {
        setAnalyticsData(prev => ({
          ...prev,
          realTime: {
            ...prev.realTime,
            currentSessions: prev.realTime.currentSessions + Math.floor(Math.random() * 10 - 5),
            analysesInProgress: prev.realTime.analysesInProgress + Math.floor(Math.random() * 6 - 3),
            averageResponseTime: `${(1.0 + Math.random() * 0.5).toFixed(1)}s`,
            systemHealth: `${(99.8 + Math.random() * 0.2).toFixed(1)}%`
          }
        }));
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [liveData]);

  const timeRanges = [
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' },
    { id: '90d', label: '90 Days' },
    { id: '1y', label: '1 Year' }
  ];

  const metrics = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'sessions', label: 'Sessions', icon: Activity },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'insights', label: 'Insights', icon: Target }
  ];

  const keyMetrics = [
    {
      title: 'Total Users',
      value: analyticsData.overview.totalUsers.toLocaleString(),
      change: analyticsData.overview.trends.users,
      trend: 'up',
      icon: Users,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Active Sessions',
      value: analyticsData.overview.activeSessions.toLocaleString(),
      change: analyticsData.overview.trends.sessions,
      trend: 'up',
      icon: Activity,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Analyses Completed',
      value: analyticsData.overview.analysesCompleted.toLocaleString(),
      change: analyticsData.overview.trends.analyses,
      trend: 'up',
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600'
    },
    {
      title: 'Average Score',
      value: `${analyticsData.overview.averageScore}%`,
      change: analyticsData.overview.trends.score,
      trend: 'up',
      icon: Award,
      color: 'from-orange-500 to-red-600'
    }
  ];

  const realTimeMetrics = [
    {
      title: 'Current Sessions',
      value: analyticsData.realTime.currentSessions.toLocaleString(),
      icon: Users,
      status: 'active'
    },
    {
      title: 'Analyses in Progress',
      value: analyticsData.realTime.analysesInProgress.toLocaleString(),
      icon: Activity,
      status: 'processing'
    },
    {
      title: 'Response Time',
      value: analyticsData.realTime.averageResponseTime,
      icon: Clock,
      status: 'optimal'
    },
    {
      title: 'System Health',
      value: analyticsData.realTime.systemHealth,
      icon: Shield,
      status: 'healthy'
    }
  ];

  const recentActivities = [
    {
      id: 1,
      user: 'Sarah Chen',
      action: 'Completed speech analysis',
      time: '2 minutes ago',
      score: 94,
      type: 'success'
    },
    {
      id: 2,
      user: 'Mike Rodriguez',
      action: 'Started video presentation',
      time: '5 minutes ago',
      score: null,
      type: 'info'
    },
    {
      id: 3,
      user: 'Emily Watson',
      action: 'Uploaded text for analysis',
      time: '8 minutes ago',
      score: 89,
      type: 'success'
    },
    {
      id: 4,
      user: 'David Kim',
      action: 'Completed real-time coaching',
      time: '12 minutes ago',
      score: 91,
      type: 'success'
    }
  ];

  const performanceData = [
    { metric: 'Speech Clarity', current: 94, previous: 91, trend: 'up' },
    { metric: 'Video Presence', current: 89, previous: 86, trend: 'up' },
    { metric: 'Text Readability', current: 92, previous: 88, trend: 'up' },
    { metric: 'Engagement Score', current: 87, previous: 84, trend: 'up' },
    { metric: 'Confidence Level', current: 91, previous: 89, trend: 'up' }
  ];

  return (
    <div className={`min-h-screen bg-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Enterprise Analytics</h1>
            <p className="text-lg text-gray-600">Real-time insights and performance metrics</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Live Data Toggle */}
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${liveData ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">{liveData ? 'Live Data' : 'Paused'}</span>
            </div>
            
            {/* Controls */}
            <button
              onClick={() => setLiveData(!liveData)}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 ${liveData ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5 text-gray-600" /> : <Maximize2 className="w-5 h-5 text-gray-600" />}
            </button>
            
            <button className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Download className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mb-8 bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
            </div>
            <div className="flex space-x-2">
              {timeRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setSelectedTimeRange(range.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTimeRange === range.id
                      ? 'bg-emerald-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center space-x-1 text-sm font-medium ${
                    metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    <span>{metric.change}</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-sm text-gray-600">{metric.title}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Real-time Metrics */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Real-time Metrics</h2>
            <div className="flex items-center space-x-2 text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {realTimeMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={metric.title} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-3">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.title}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Charts and Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Performance Chart */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Performance Trends</h3>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              {performanceData.map((item, index) => (
                <div key={item.metric} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{item.previous}%</span>
                        <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-medium text-emerald-600">{item.current}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${item.current}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
              <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'success' ? 'bg-emerald-100' :
                    activity.type === 'info' ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    {activity.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    ) : activity.type === 'info' ? (
                      <Info className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Activity className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{activity.user}</div>
                    <div className="text-sm text-gray-600">{activity.action}</div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                  
                  {activity.score && (
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600">{activity.score}%</div>
                      <div className="text-xs text-gray-500">Score</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise Insights */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">AI-Powered Insights</h3>
            <button className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 text-sm font-medium">
              <Target className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-3 mb-3">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
                <h4 className="font-semibold text-gray-900">Performance Growth</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Communication scores have improved by 15.2% this month across all user segments.
              </p>
              <div className="text-2xl font-bold text-emerald-600">+15.2%</div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-6 h-6 text-emerald-600" />
                <h4 className="font-semibold text-gray-900">User Engagement</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Daily active users increased by 8.3% with higher session completion rates.
              </p>
              <div className="text-2xl font-bold text-blue-600">+8.3%</div>
            </div>
            
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
              <div className="flex items-center space-x-3 mb-3">
                <Zap className="w-6 h-6 text-emerald-600" />
                <h4 className="font-semibold text-gray-900">System Efficiency</h4>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Average analysis time reduced by 23% with optimized AI processing.
              </p>
              <div className="text-2xl font-bold text-emerald-600">-23%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseAnalytics;

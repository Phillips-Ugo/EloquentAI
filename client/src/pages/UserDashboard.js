import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Clock,
  Target,
  Award,
  Settings,
  LogOut,
  User,
  Mail,
  Building,
  Calendar,
  PieChart,
  LineChart,
  Download,
  Filter,
  Search,
  Bell,
  Star,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadUserData();
    loadAnalytics();
    loadRecentAnalyses();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.data.user);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/analytics/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const loadRecentAnalyses = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/analysis/user/recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentAnalyses(data.data);
      }
    } catch (error) {
      console.error('Failed to load recent analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-900 text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analyses', label: 'My Analyses', icon: Activity },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.first_name || 'User'}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8"
        >
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {user?.first_name} {user?.last_name}
              </h2>
              <div className="flex items-center space-x-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                {user?.company && (
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4" />
                    <span>{user.company}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Member since {new Date(user?.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Plan</div>
              <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-sm font-medium">
                {user?.role === 'admin' ? 'Enterprise' : 'Professional'}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
            {[
            { label: 'Total Analyses', value: analytics?.totalAnalyses || 0, icon: Activity, color: 'from-orange-500 to-pink-500' },
            { label: 'Avg Score', value: `${analytics?.averageScore || 0}%`, icon: Target, color: 'from-orange-500 to-pink-500' },
            { label: 'This Month', value: analytics?.monthlyAnalyses || 0, icon: TrendingUp, color: 'from-orange-500 to-pink-500' },
            { label: 'Improvement', value: `${analytics?.improvement || 0}%`, icon: Award, color: 'from-orange-500 to-pink-500' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-2 mb-8"
        >
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          {activeTab === 'overview' && <OverviewTab analytics={analytics} recentAnalyses={recentAnalyses} />}
          {activeTab === 'analyses' && <AnalysesTab analyses={recentAnalyses} />}
          {activeTab === 'insights' && <InsightsTab analytics={analytics} />}
          {activeTab === 'settings' && <SettingsTab user={user} />}
        </motion.div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ analytics, recentAnalyses }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-gray-900 mb-6">Overview</h3>
    
    {/* Performance Chart */}
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h4>
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <LineChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Performance chart will be displayed here</p>
        </div>
      </div>
    </div>

    {/* Recent Analyses */}
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Analyses</h4>
      <div className="space-y-4">
        {recentAnalyses.slice(0, 5).map((analysis, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-gray-900 font-medium">{analysis.type} Analysis</div>
                <div className="text-gray-600 text-sm">{new Date(analysis.created_at).toLocaleDateString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-900 font-bold">{analysis.overallScore}%</div>
              <div className="text-gray-600 text-sm">Score</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Analyses Tab Component
const AnalysesTab = ({ analyses }) => (
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <h3 className="text-xl font-bold text-gray-900">My Analyses</h3>
      <div className="flex space-x-3">
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {analyses.map((analysis, index) => (
        <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{analysis.overallScore}%</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>
          <h4 className="text-gray-900 font-semibold mb-2">{analysis.type} Analysis</h4>
          <p className="text-gray-600 text-sm mb-4">{new Date(analysis.created_at).toLocaleDateString()}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Duration: {analysis.duration || 'N/A'}</span>
            <button className="text-orange-600 hover:text-orange-700 text-sm font-medium">
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Insights Tab Component
const InsightsTab = ({ analytics }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-gray-900 mb-6">Insights & Recommendations</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Strengths
        </h4>
        <div className="space-y-3">
          {['Clear communication', 'Good pacing', 'Strong engagement'].map((strength, index) => (
            <div key={index} className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-gray-700">{strength}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-yellow-600" />
          Areas for Improvement
        </h4>
        <div className="space-y-3">
          {['Eye contact', 'Gesture variety', 'Voice modulation'].map((area, index) => (
            <div key={index} className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="text-gray-700">{area}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Info className="w-5 h-5 mr-2 text-orange-600" />
        Recommendations
      </h4>
      <div className="space-y-4">
        {[
          'Practice maintaining eye contact for 3-5 seconds per person',
          'Use more hand gestures to emphasize key points',
          'Vary your speaking pace to maintain audience interest'
        ].map((recommendation, index) => (
          <div key={index} className="flex items-start space-x-3">
            <Star className="w-5 h-5 text-orange-600 mt-0.5" />
            <span className="text-gray-700">{recommendation}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Settings Tab Component
const SettingsTab = ({ user }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-bold text-gray-900 mb-6">Settings</h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              defaultValue={user?.first_name}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              defaultValue={user?.last_name}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
            <input
              type="text"
              defaultValue={user?.company}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Email Notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Weekly Reports</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-orange-500" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Analysis Reminders</span>
            <input type="checkbox" className="w-4 h-4 text-orange-500" />
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-end space-x-4">
      <button className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
        Cancel
      </button>
      <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all">
        Save Changes
      </button>
    </div>
  </div>
);

export default UserDashboard;

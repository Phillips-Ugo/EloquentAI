import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Target,
  Award,
  Users,
  Eye,
  Mic,
  Camera,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const AnalyticsDashboardPage = () => {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-orange-50 to-pink-50 text-orange-800 border border-orange-200">
                <BarChart3 className="w-4 h-4 mr-2" />
                Performance Analytics
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight"
            >
              Analytics Dashboard
              <span className="block bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Track your progress
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Comprehensive analytics and insights into your communication performance with detailed metrics, trends, and improvement recommendations.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Dashboard Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Performance Overview</h2>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-white text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-orange-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+5.2%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">87.3</h3>
              <p className="text-gray-600 text-sm">Overall Score</p>
            </motion.div>

            {/* Sessions Completed */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-orange-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+12</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">47</h3>
              <p className="text-gray-600 text-sm">Sessions Completed</p>
            </motion.div>

            {/* Improvement Rate */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-orange-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+8.7%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">23.4%</h3>
              <p className="text-gray-600 text-sm">Improvement Rate</p>
            </motion.div>

            {/* Streak */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center text-orange-600">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+3</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">12</h3>
              <p className="text-gray-600 text-sm">Day Streak</p>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Trend */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Performance Trend</h3>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"></div>
                  <span className="text-gray-600 text-sm">Overall Score</span>
                </div>
              </div>
              
              {/* Mock Chart */}
              <div className="h-64 bg-gray-100 rounded-lg p-4 flex items-end justify-between">
                {[65, 70, 75, 80, 82, 85, 87].map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-t w-8 mb-2 transition-all duration-1000"
                      style={{ height: `${(value / 100) * 200}px` }}
                    ></div>
                    <span className="text-gray-600 text-xs">{`Day ${index + 1}`}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Skill Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Skill Breakdown</h3>
              
              <div className="space-y-4">
                {/* Speech Clarity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Mic className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-gray-700">Speech Clarity</span>
                    </div>
                    <span className="text-gray-900 font-medium">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                {/* Eye Contact */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-gray-700">Eye Contact</span>
                    </div>
                    <span className="text-gray-900 font-medium">89%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                  </div>
                </div>

                {/* Body Language */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Camera className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-gray-700">Body Language</span>
                    </div>
                    <span className="text-gray-900 font-medium">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                {/* Confidence */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Award className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-gray-700">Confidence</span>
                    </div>
                    <span className="text-gray-900 font-medium">88%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Sessions</h3>
              <button className="text-orange-600 hover:text-orange-700 text-sm">View All</button>
            </div>
            
            <div className="space-y-4">
              {[
                { date: '2024-01-15', type: 'Real-time Analysis', score: 89, duration: '15 min' },
                { date: '2024-01-14', type: 'Video Upload', score: 87, duration: '8 min' },
                { date: '2024-01-13', type: 'Real-time Analysis', score: 85, duration: '12 min' },
                { date: '2024-01-12', type: 'Communication Coach', score: 92, duration: '20 min' },
                { date: '2024-01-11', type: 'Real-time Analysis', score: 83, duration: '10 min' }
              ].map((session, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">{session.type}</p>
                      <p className="text-gray-600 text-sm">{session.date} • {session.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-900 font-semibold">{session.score}%</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" 
                        style={{ width: `${session.score}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Goals Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Goals & Progress</h2>
            <p className="text-gray-600">Track your improvement journey</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Weekly Goal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 text-center border border-gray-200 shadow-sm"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Weekly Goal</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">5/7</div>
                <div className="text-gray-600 text-sm">Sessions this week</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" style={{ width: '71%' }}></div>
              </div>
            </motion.div>

            {/* Improvement Target */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 text-center border border-gray-200 shadow-sm"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Improvement Target</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">90%</div>
                <div className="text-gray-600 text-sm">Target score</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
            </motion.div>

            {/* Consistency */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-6 text-center border border-gray-200 shadow-sm"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Consistency</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold text-gray-900 mb-1">12</div>
                <div className="text-gray-600 text-sm">Day streak</div>
              </div>
              <div className="flex items-center justify-center text-orange-600">
                <CheckCircle className="w-5 h-5 mr-1" />
                <span className="text-sm">On track!</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Continue your improvement journey
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start a new session to keep building your communication skills
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Start New Session
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-orange-500 hover:border-orange-600 font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center">
              <Download className="w-5 h-5 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsDashboardPage;




import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  Video,
  Sparkles,
  Clapperboard,
  BarChart3,
  Mic,
  Eye,
  TrendingUp,
  CheckCircle,
  Users,
  Award,
  Clock
} from 'lucide-react';

const ModernHomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Exact Zoom Match */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight"
            >
              Find out what's possible when
              <span className="block text-white">
                communication connects
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white mb-8 max-w-4xl mx-auto leading-relaxed"
            >
              Whether you're presenting to clients or training your team, Eloquent AI makes it easier to connect, communicate, and reach goals – all with built-in AI doing the heavy lifting.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-12"
            >
              <Link
                to="/realtime-analysis"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-medium px-8 py-4 rounded transition-colors"
              >
                Explore products
              </Link>
              <Link
                to="/pricing"
                className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium px-8 py-4 rounded transition-colors"
              >
                Find your plan
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Features Section - Zoom Style */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Real-time Analysis Feature */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Real-time Analysis</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Analyze your communication
                <span className="block text-blue-600">in real-time</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Get instant feedback on your speech patterns, body language, and facial expressions as you speak. Our AI provides live coaching to help you communicate more effectively.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Live Speech Analysis</h3>
                    <p className="text-gray-300">Real-time feedback on clarity, pace, and volume</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Visual Communication</h3>
                    <p className="text-gray-300">Track eye contact, posture, and facial expressions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Instant Coaching</h3>
                    <p className="text-gray-300">Get suggestions and improvements as you speak</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/realtime-analysis"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center"
                >
                  Try Real-time Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Demo Video */}
            <motion.div
              initial={{ opacity: 0, x: 50 }} 
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl relative overflow-hidden shadow-2xl">
                {/* Demo Video Placeholder */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-pink-400/30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 mx-auto border-2 border-white/30">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">Real-time Analysis Demo</p>
                    <p className="text-blue-200 text-sm">See how it works in action</p>
                  </div>
                </div>
                
                {/* Recording Indicator */}
                <div className="absolute top-6 left-6 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>

                {/* Analysis Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/80 backdrop-blur-sm backdrop-blur-sm rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-4 text-white text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-green-400">92%</div>
                        <div className="text-xs text-gray-300">Speech Clarity</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-blue-400">89%</div>
                        <div className="text-xs text-gray-300">Eye Contact</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-400">85%</div>
                        <div className="text-xs text-gray-300">Confidence</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Video Upload Feature */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            {/* Demo Video */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-pink-400/30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 mx-auto border-2 border-white/30">
                      <Clapperboard className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">Video Upload Analysis</p>
                    <p className="text-green-200 text-sm">Upload and analyze your presentations</p>
                  </div>
                </div>
                
                {/* Upload Progress */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/80 backdrop-blur-sm backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                      <span>Analysis Progress</span>
                      <span>87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                  <Clapperboard className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">Video Analysis</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Upload and analyze
                <span className="block text-green-600">your presentations</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Record your presentations and get comprehensive AI analysis with detailed insights, improvement suggestions, and performance tracking over time.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Detailed Metrics</h3>
                    <p className="text-gray-300">Comprehensive analysis of speech, body language, and engagement</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Progress Tracking</h3>
                    <p className="text-gray-300">Monitor your improvement over time with detailed reports</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Actionable Insights</h3>
                    <p className="text-gray-300">Get specific recommendations to enhance your communication</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/video-upload"
                  className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center"
                >
                  Upload Video
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Analytics Feature */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500-600 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Analytics</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Track your progress
                <span className="block text-purple-600">with detailed analytics</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Monitor your communication improvement journey with comprehensive analytics, performance trends, and personalized insights to help you reach your goals.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Performance Trends</h3>
                    <p className="text-gray-300">Visualize your improvement over time with interactive charts</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Goal Tracking</h3>
                    <p className="text-gray-300">Set and monitor your communication improvement goals</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-white">Detailed Reports</h3>
                    <p className="text-gray-300">Export comprehensive reports for sharing and review</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/analytics"
                  className="bg-gradient-to-r from-orange-500 to-pink-500-600 hover:bg-gradient-to-r from-orange-500 to-pink-500-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center"
                >
                  View Analytics
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </motion.div>

            {/* Demo Video */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-video bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl relative overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 to-pink-400/30"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 mx-auto border-2 border-white/30">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-white text-lg font-medium mb-2">Analytics Dashboard</p>
                    <p className="text-white/90 text-sm">Track your communication progress</p>
                  </div>
                </div>
                
                {/* Analytics Preview */}
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/80 backdrop-blur-sm backdrop-blur-sm rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 text-white text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-400">87.3</div>
                        <div className="text-xs text-gray-300">Overall Score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-400">+5.2%</div>
                        <div className="text-xs text-gray-300">This Week</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white mb-16"
          >
            Trusted by professionals worldwide
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* User Satisfaction */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Award key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-2xl font-bold text-white">4.8/5</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">out of 500+ reviews</p>
              <p className="text-sm text-gray-400">User Satisfaction</p>
            </motion.div>

            {/* Performance Improvement */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">85%</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">improvement in communication skills</p>
              <p className="text-sm text-gray-400">Average User Results</p>
            </motion.div>

            {/* Enterprise Adoption */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-8 shadow-sm border border-gray-200"
            >
              <div className="flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-white">500+</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">organizations using Eloquent AI</p>
              <p className="text-sm text-gray-400">Enterprise Customers</p>
            </motion.div>
          </div>

          {/* Customer Quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <blockquote className="text-xl text-gray-700 mb-6">
              "Eloquent AI's communication analysis has revolutionized our team training. The insights on speech clarity and body language have helped our entire organization communicate more effectively."
            </blockquote>
            <div className="flex items-center justify-center">
              <div className="text-right">
                <div className="font-semibold text-white">Michael Rodriguez</div>
                <div className="text-sm text-gray-300">CEO, Innovation Labs</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to improve your communication?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your journey with Eloquent AI today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              to="/realtime-analysis"
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <Link
              to="/pricing"
              className="bg-transparent hover:bg-white/10 text-white border border-white font-semibold px-8 py-4 rounded-lg transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernHomePage;
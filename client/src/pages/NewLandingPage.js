import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video, Mic, Eye, Brain, TrendingUp, Zap, Shield, BarChart3,
  ArrowRight, Check, Sparkles, Activity, Upload, PlayCircle,
  MessageSquare, Target, Award, Clock
} from 'lucide-react';
import { LogoWordmark } from '../components/Logo';

const NewLandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Video,
      title: 'Real-Time Video Analysis',
      description: 'Get instant feedback on your posture, eye contact, gestures, and facial expressions using advanced AI and MediaPipe technology.',
      color: 'from-blue-500 to-cyan-500',
      metrics: ['Posture Detection', 'Eye Contact Tracking', 'Gesture Recognition', 'Facial Expression Analysis']
    },
    {
      icon: Mic,
      title: 'AI-Powered Speech Analysis',
      description: 'Analyze your speech clarity, pace, filler words, and sentiment using OpenAI Whisper and Google Gemini AI.',
      color: 'from-purple-500 to-pink-500',
      metrics: ['Speech Transcription', 'Filler Word Detection', 'Pace Analysis (WPM)', 'Sentiment & Emotion']
    },
    {
      icon: Upload,
      title: 'File Upload Analysis',
      description: 'Upload audio or video files for comprehensive analysis. Get detailed reports with actionable insights.',
      color: 'from-green-500 to-emerald-500',
      metrics: ['Audio/Video Support', 'Detailed Reports', 'Progress Tracking', 'Export Capabilities']
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Track your progress over time with comprehensive analytics, trends, and performance metrics.',
      color: 'from-orange-500 to-red-500',
      metrics: ['Performance Trends', 'Skill Breakdown', 'Session History', 'Achievement Tracking']
    }
  ];

  const stats = [
    { value: '10,000+', label: 'Analyses Completed' },
    { value: '95%', label: 'Accuracy Rate' },
    { value: '50+', label: 'Metrics Tracked' },
    { value: '24/7', label: 'Available' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }} />
          
          {/* Floating Orbs */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                width: `${300 + i * 150}px`,
                height: `${300 + i * 150}px`,
                background: `radial-gradient(circle, rgba(71, 85, 105, 0.4) 0%, transparent 70%)`,
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
              }}
              animate={{
                y: [0, -40, 0],
                x: [0, 30, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10 + i * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.8,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 bg-gray-800/50 border border-gray-700/50 rounded-full px-6 py-2 mb-8 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-gray-300" />
            <span className="text-sm font-medium text-gray-300">
              AI-Powered Communication Analysis
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 bg-clip-text text-transparent">
              Master Your
            </span>
            <br />
            <span className="text-white">
              Communication
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Real-time AI analysis of your speech, video, and communication skills.
            <br />
            Get instant feedback and actionable insights to improve.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/realtime-analysis"
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <PlayCircle className="w-5 h-5" />
                <span>Start Real-Time Analysis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link
              to="/upload"
              className="px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold text-gray-200 hover:bg-gray-700/50 transition-all duration-300 backdrop-blur-sm"
            >
              <span className="flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Upload File for Analysis</span>
              </span>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to analyze and improve your communication skills
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`relative group p-8 rounded-2xl bg-gradient-to-br ${feature.color} bg-opacity-10 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-20`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    {feature.metrics.map((metric, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>{metric}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Simple, fast, and powerful analysis in three steps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Start Analysis',
                description: 'Choose real-time video analysis or upload an audio/video file',
                icon: PlayCircle
              },
              {
                step: '02',
                title: 'AI Processing',
                description: 'Our AI analyzes your speech, video, and communication patterns',
                icon: Brain
              },
              {
                step: '03',
                title: 'Get Insights',
                description: 'Receive detailed feedback and actionable recommendations',
                icon: Target
              }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative p-8 rounded-2xl bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                >
                  <div className="text-6xl font-black text-gray-700 mb-4">
                    {item.step}
                  </div>
                  <div className="p-3 rounded-xl bg-blue-600/20 w-fit mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-12 rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Ready to Improve Your Communication?
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Start analyzing your communication skills today and get instant AI-powered feedback
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/realtime-analysis"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold text-white shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center justify-center space-x-2">
                  <PlayCircle className="w-5 h-5" />
                  <span>Start Free Analysis</span>
                </span>
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 bg-gray-800/50 border border-gray-700/50 rounded-xl font-semibold text-gray-200 hover:bg-gray-700/50 transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default NewLandingPage;

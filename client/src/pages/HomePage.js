import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  Mic, 
  Video, 
  BarChart3, 
  CheckCircle,
  ArrowRight,
  Users,
  Award,
  Clock,
  Star,
  TrendingUp,
  Globe,
  Play,
  Pause,
  Volume2,
  Eye,
  Target,
  Zap,
  FileText,
  MessageSquare,
  Brain,
  Sparkles,
  Shield,
  Rocket,
  Infinity,
  Layers,
  Cpu,
  Activity,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

const HomePage = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      id: 'speech',
      icon: Mic,
      title: 'AI Speech Analysis',
      subtitle: 'Real-time voice optimization',
      description: 'Advanced speech recognition with instant feedback on clarity, pace, and engagement',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      accent: 'blue',
      metrics: ['95%+ Accuracy', '50+ Languages', 'Real-time Processing'],
      demo: {
        transcription: "Welcome to our quarterly review. Today we'll discuss our achievements and future goals...",
        metrics: { clarity: 0.87, pace: 0.92, engagement: 0.78, confidence: 0.85 },
        fillerWords: [
          { word: "um", count: 3, percentage: 15 },
          { word: "like", count: 2, percentage: 10 },
          { word: "you know", count: 1, percentage: 5 }
        ]
      }
    },
    {
      id: 'video',
      icon: Video,
      title: 'Video Presentation AI',
      subtitle: 'Body language mastery',
      description: 'Comprehensive analysis of posture, eye contact, gestures, and presentation presence',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      accent: 'purple',
      metrics: ['90%+ Accuracy', 'Pose Detection', 'Eye Contact Tracking'],
      demo: {
        metrics: { posture: 0.88, eyeContact: 0.85, gestures: 0.92, movement: 0.78 },
        liveFeedback: [
          { type: 'success', message: 'Excellent posture maintained', icon: '✓' },
          { type: 'info', message: 'Eye contact: 85% - Good engagement', icon: '👁' },
          { type: 'suggestion', message: 'Try more hand gestures', icon: '🎯' }
        ]
      }
    },
    {
      id: 'text',
      icon: Brain,
      title: 'AI Text Review',
      subtitle: 'ChatGPT-powered insights',
      description: 'Comprehensive text analysis with AI-generated feedback and improvement suggestions',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50',
      accent: 'indigo',
      metrics: ['AI-Powered Review', 'Comprehensive Feedback', 'Style Analysis'],
      demo: {
        originalText: "Today I want to talk about the importance of effective communication in the workplace...",
        aiReview: {
          overallScore: 0.78,
          categories: { clarity: 0.85, engagement: 0.72, structure: 0.80, impact: 0.75 },
          strengths: ["Clear topic introduction", "Good use of professional language", "Logical flow of ideas"],
          improvements: ["Add specific examples", "Include more engaging opening", "Consider audience perspective"],
          suggestions: ["Start with a compelling statistic", "Provide concrete scenarios", "End with actionable takeaways"]
        }
      }
    },
    {
      id: 'realtime',
      icon: Activity,
      title: 'Real-Time Coaching',
      subtitle: 'Live presentation feedback',
      description: 'Get instant feedback during live presentations with real-time coaching and suggestions',
      color: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      accent: 'emerald',
      metrics: ['Live Feedback', 'Instant Coaching', 'Progress Tracking'],
      demo: {
        liveScores: { posture: 0.85, eyeContact: 0.78, gestures: 0.92, movement: 0.73 },
        suggestions: [
          "Great posture! Keep it up",
          "Look at camera more often",
          "Use more hand gestures"
        ]
      }
    }
  ];

  const stats = [
    { icon: Users, value: '50,000+', label: 'Active Users', color: 'blue' },
    { icon: Award, value: '98.5%', label: 'Accuracy Rate', color: 'green' },
    { icon: Clock, value: '<1.5s', label: 'Analysis Time', color: 'purple' },
    { icon: Globe, value: '75+', label: 'Languages', color: 'orange' }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'VP of Marketing',
      company: 'TechCorp',
      content: 'EloquentAI transformed our team\'s presentation skills. The real-time feedback is game-changing.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      companyLogo: 'https://via.placeholder.com/60x30/3B82F6/FFFFFF?text=TechCorp'
    },
    {
      name: 'Michael Chen',
      role: 'Sales Director',
      company: 'Global Solutions',
      content: 'The video analysis feature helped me identify unconscious habits I never knew I had.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      companyLogo: 'https://via.placeholder.com/60x30/8B5CF6/FFFFFF?text=Global'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Public Speaker',
      company: 'Inspire Talks',
      content: 'The AI text review is incredible. It catches things I never would have noticed.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      companyLogo: 'https://via.placeholder.com/60x30/10B981/FFFFFF?text=Inspire'
    }
  ];

  const renderFeatureDemo = (feature) => {
    switch (feature.id) {
      case 'speech':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-gray-600">LIVE TRANSCRIPTION</span>
                </div>
                <div className="text-xs text-gray-500">Real-time</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed">
                "{feature.demo.transcription}"
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(feature.demo.metrics).map(([key, value]) => (
                <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-gray-900">
                    {Math.round(value * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

             case 'video':
         return (
           <div className="space-y-6">
             <div className="relative bg-gray-900 rounded-2xl overflow-hidden">
               <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
                 <img 
                   src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&crop=face" 
                   alt="Video Analysis Demo" 
                   className="w-full h-full object-cover"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                 
                 {/* Live Analysis Overlay */}
                 <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium">
                   LIVE ANALYSIS
                 </div>
                 
                 {/* Dynamic Real-time Metrics */}
                 <div className="absolute top-4 right-4 space-y-2">
                   <div className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs animate-pulse">
                     ✓ Posture: {Math.round(82 + Math.sin(Date.now() / 3000) * 8)}%
                   </div>
                   <div className="bg-blue-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs animate-pulse" style={{ animationDelay: '0.5s' }}>
                     👁 Eye Contact: {Math.round(78 + Math.sin(Date.now() / 2500) * 12)}%
                   </div>
                   <div className="bg-orange-500/90 backdrop-blur-sm text-white px-2 py-1 rounded text-xs animate-pulse" style={{ animationDelay: '1s' }}>
                     🎯 Gestures: {Math.round(70 + Math.sin(Date.now() / 2000) * 15)}%
                   </div>
                 </div>
                 
                 {/* Recording Indicator */}
                 <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                   <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                   <span className="text-white text-sm font-medium">REC</span>
                   <span className="text-gray-300 text-xs">02:34</span>
                 </div>
               </div>
             </div>
             
             {/* Dynamic Live Feedback */}
             <div className="space-y-3">
               {[
                 { icon: '✓', message: 'Excellent posture maintained', type: 'success' },
                 { icon: '👁', message: 'Eye contact: 85% - Good engagement', type: 'info' },
                 { icon: '🎯', message: 'Try more hand gestures', type: 'suggestion' }
               ].map((feedback, idx) => (
                 <motion.div 
                   key={idx}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: idx * 0.2 }}
                   className={`bg-white rounded-xl p-3 shadow-sm border border-gray-100 ${
                     feedback.type === 'success' ? 'border-l-4 border-l-green-500' :
                     feedback.type === 'info' ? 'border-l-4 border-l-blue-500' :
                     'border-l-4 border-l-orange-500'
                   }`}
                 >
                   <div className="flex items-center space-x-3">
                     <span className="text-lg">{feedback.icon}</span>
                     <span className="text-sm text-gray-700">{feedback.message}</span>
                   </div>
                 </motion.div>
               ))}
             </div>
           </div>
         );

      case 'text':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold">AI Review Score</h4>
                  <p className="text-indigo-100 text-sm">Powered by ChatGPT</p>
                </div>
              </div>
              <div className="text-3xl font-bold">
                {Math.round(feature.demo.aiReview.overallScore * 100)}%
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(feature.demo.aiReview.categories).map(([key, value]) => (
                <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {key}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                      style={{ width: `${value * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'realtime':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold">Live Session</h4>
                  <p className="text-emerald-100 text-sm">Real-time coaching</p>
                </div>
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-2xl font-bold">02:34</div>
            </div>
            
            <div className="space-y-3">
              {feature.demo.suggestions.map((suggestion, idx) => (
                <div key={idx} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <motion.div 
          style={{ y }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.1),transparent_50%)]"
        ></motion.div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Trusted by 50,000+ professionals worldwide</span>
              <Shield className="w-4 h-4" />
            </motion.div>
            
            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight"
            >
              Master Your
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Communication
              </span>
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            >
              The world's most advanced AI-powered communication analysis platform. 
              Get real-time feedback on speech, video, and text with enterprise-grade accuracy.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link
                to="/upload"
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3"
              >
                <span>Start Free Analysis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/realtime-video"
                className="group bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3"
              >
                <Play className="w-5 h-5" />
                <span>Try Real-time Demo</span>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-white/80 backdrop-blur-sm rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-shadow">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-32 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Complete AI Analysis Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of communication analysis with our comprehensive AI-powered platform
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid lg:grid-cols-2 gap-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className={`group relative ${feature.bgColor} rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 transform hover:scale-105`}
                >
                  {/* Feature Header */}
                  <div className="flex items-start space-x-6 mb-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-lg text-gray-600 mb-3">{feature.subtitle}</p>
                      <p className="text-gray-700 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>

                  {/* Demo Content */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                    {renderFeatureDemo(feature)}
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-wrap gap-3 mt-6">
                    {feature.metrics.map((metric, idx) => (
                      <span
                        key={idx}
                        className="bg-white/80 backdrop-blur-sm text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-white/50"
                      >
                        {metric}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="mt-8">
                    <Link
                      to="/upload"
                      className={`inline-flex items-center space-x-2 bg-gradient-to-r ${feature.color} text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                    >
                      <span>Try {feature.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Loved by Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who have transformed their communication skills
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
              >
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-8 leading-relaxed text-lg">"{testimonial.content}"</p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-xs text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-t-3xl">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
              Ready to Transform Your Skills?
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Join 50,000+ professionals who have already improved their communication 
              with our AI-powered analysis platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/upload"
                className="group bg-white text-blue-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-3"
              >
                <span>Start Your Free Analysis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/realtime-video"
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 backdrop-blur-sm transition-all duration-300 inline-flex items-center space-x-3"
              >
                <Play className="w-5 h-5" />
                <span>Live Demo</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 
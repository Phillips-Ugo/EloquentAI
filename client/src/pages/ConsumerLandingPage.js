import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  Mic,
  Upload,
  BarChart3,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Award,
  PlayCircle,
  Star,
  ChevronRight
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ConsumerLandingPage = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      icon: Video,
      title: 'Real-Time Analysis',
      description: 'Get instant feedback on your communication as you speak. See your posture, eye contact, and gestures analyzed in real-time.',
      color: 'from-orange-500 to-pink-500',
      metrics: ['Posture Detection', 'Eye Contact', 'Gestures', 'Facial Expressions'],
      href: '/realtime-analysis'
    },
    {
      icon: Mic,
      title: 'AI Speech Analysis',
      description: 'Advanced AI analyzes your speech patterns, clarity, pace, and helps you eliminate filler words.',
      color: 'from-orange-500 to-pink-500',
      metrics: ['Speech Clarity', 'Pace Analysis', 'Filler Words', 'Sentiment'],
      href: '/upload'
    },
    {
      icon: Upload,
      title: 'File Analysis',
      description: 'Upload your recordings and get comprehensive insights. Perfect for reviewing past presentations.',
      color: 'from-orange-500 to-pink-500',
      metrics: ['Audio Support', 'Video Support', 'Detailed Reports', 'Export Options'],
      href: '/upload'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Watch your communication skills improve over time with detailed analytics and progress reports.',
      color: 'from-orange-500 to-red-500',
      metrics: ['Performance Trends', 'Skill Breakdown', 'Session History', 'Achievements'],
      href: '/analytics'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Instant Feedback',
      description: 'Get real-time suggestions as you speak, helping you improve immediately.'
    },
    {
      icon: Shield,
      title: 'Private & Secure',
      description: 'Your data is encrypted and never shared. Practice in complete privacy.'
    },
    {
      icon: TrendingUp,
      title: 'Track Progress',
      description: 'See measurable improvements in your communication skills over time.'
    },
    {
      icon: Award,
      title: 'Expert Insights',
      description: 'Powered by advanced AI trained on communication best practices.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Sales Manager',
      company: 'TechCorp',
      content: 'Eloquent AI transformed how I prepare for presentations. The real-time feedback is incredible.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Entrepreneur',
      company: 'StartupXYZ',
      content: 'I\'ve seen a 40% improvement in my speaking confidence. This tool is a game-changer.',
      rating: 5,
      avatar: '👨‍💻'
    },
    {
      name: 'Emily Johnson',
      role: 'Marketing Director',
      company: 'BrandCo',
      content: 'The analytics dashboard helps me understand my communication patterns. Highly recommend!',
      rating: 5,
      avatar: '👩‍💼'
    }
  ];

  const stats = [
    { value: '50K+', label: 'Analyses Completed', icon: BarChart3 },
    { value: '95%', label: 'User Satisfaction', icon: Star },
    { value: '40%', label: 'Avg. Improvement', icon: TrendingUp },
    { value: '24/7', label: 'Available', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50/40 via-white to-transparent">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-orange-100/20 to-pink-100/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-pink-50 rounded-full border border-orange-200 mb-8"
            >
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">AI-Powered Communication Coach</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight font-heading"
            >
              Speak with{' '}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Confidence
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Get real-time AI feedback on your communication skills. Improve your speaking, 
              presentation, and interpersonal communication with instant insights.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/realtime-analysis">
                <Button size="lg" icon={PlayCircle} iconPosition="left">
                  Start Free Analysis
                </Button>
              </Link>
              <Link to="/upload">
                <Button variant="secondary" size="lg" icon={Upload} iconPosition="left">
                  Upload Recording
                </Button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500"
            >
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Free to get started</span>
              </div>
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-500" />
                <span>Privacy-first</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl mb-4 border border-orange-100">
                    <Icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                communicate better
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help you become a more confident and effective communicator.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <Card
                    variant={isActive ? 'elevated' : 'default'}
                    className={`p-8 cursor-pointer h-full premium-card border-transparent ${isActive ? 'ring-2 ring-orange-100' : ''}`}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 transform transition-transform ${isActive ? 'scale-110' : ''}`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {feature.metrics.map((metric, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{metric}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      to={feature.href}
                      className="inline-flex items-center text-orange-600 font-semibold hover:text-orange-700 transition-colors group"
                    >
                      Learn more
                      <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Why choose Eloquent AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're built for people who want to communicate better, not just analyze data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl mb-4 border border-orange-100">
                    <Icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-heading">
              Loved by communicators worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what people are saying about their experience with Eloquent AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-8 h-full premium-card">
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role} at {testimonial.company}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Ready to improve your communication?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600 mb-8"
            >
              Join thousands of people who are already improving their communication skills with Eloquent AI.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/realtime-analysis">
                <Button variant="primary" size="lg" icon={PlayCircle} iconPosition="left">
                  Start Free Analysis
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="secondary" size="lg">
                  View Pricing
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConsumerLandingPage;


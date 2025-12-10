import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield,
  Lock,
  Users,
  BarChart3,
  Zap,
  Globe,
  Crown,
  Diamond,
  Flame,
  Lightning,
  Infinity,
  Layers,
  Activity,
  Building2,
  Server,
  Database,
  Cloud,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Rocket,
  Target,
  Award,
  TrendingUp,
  MessageCircle,
  Phone,
  Mail,
} from 'lucide-react';

const EnterprisePage = () => {
  const features = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'SOC 2 Type II certified with 256-bit SSL encryption and zero-trust architecture',
      color: 'from-gray-600 to-gray-800',
    },
    {
      icon: Infinity,
      title: 'Unlimited Scale',
      description: 'Handle millions of analyses with auto-scaling infrastructure and global CDN',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Custom dashboards, real-time reporting, and AI-powered insights',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Layers,
      title: 'Seamless Integration',
      description: '100+ integrations, REST API, webhooks, and custom SDKs',
      color: 'from-orange-500 to-pink-500',
    },
    {
      icon: Users,
      title: 'Dedicated Support',
      description: '24/7 dedicated support team with SLA guarantees and priority response',
      color: 'from-orange-500 to-yellow-500',
    },
    {
      icon: Building2,
      title: 'White-Label Solutions',
      description: 'Custom branding, on-premise deployment, and private cloud options',
      color: 'from-teal-500 to-cyan-500',
    },
  ];

  const stats = [
    { label: 'Fortune 500 Companies', value: '150+', icon: Building2 },
    { label: 'Countries Served', value: '50+', icon: Globe },
    { label: 'Uptime SLA', value: '99.9%', icon: Server },
    { label: 'Support Response', value: '< 1hr', icon: MessageCircle },
  ];

  const testimonials = [
    {
      name: 'Jennifer Martinez',
      role: 'CTO',
      company: 'GlobalTech Corp',
      content: 'The enterprise features and security standards exceeded our expectations. Implementation was seamless.',
      logo: 'GT',
    },
    {
      name: 'David Kim',
      role: 'VP Engineering',
      company: 'InnovateLabs',
      content: 'The API integration was flawless. Our development team was up and running in days, not weeks.',
      logo: 'IL',
    },
    {
      name: 'Sarah Thompson',
      role: 'Head of Operations',
      company: 'ScaleUp Inc',
      content: 'The analytics and reporting capabilities gave us insights we never had before. Game-changing.',
      logo: 'SU',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-gray-500/20 to-gray-600/20 border border-gray-500/30 backdrop-blur-sm mb-6">
              <Crown className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-300 text-sm font-medium">Enterprise Solutions</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              Built for <span className="bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600 bg-clip-text text-transparent">Enterprise</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Scale your communication excellence across your entire organization with enterprise-grade AI analysis.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/contact"
                className="group bg-gradient-to-r from-gray-700 to-gray-800 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-4"
              >
                <span>Contact Sales</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-2xl flex items-center justify-center">
                  <stat.icon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Enterprise-Grade <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to transform communication across your organization
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 hover:border-white/20 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">Industry Leaders</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See how enterprise companies are transforming their communication
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mr-4">
                    {testimonial.logo}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}, {testimonial.company}</div>
                  </div>
                </div>
                <blockquote className="text-gray-300 italic">
                  "{testimonial.content}"
                </blockquote>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-orange-50 to-pink-50 backdrop-blur-xl rounded-3xl border border-orange-200 p-12 text-center"
          >
            <Diamond className="w-16 h-16 text-blue-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Scale Your Communication?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Let our enterprise team show you how to transform communication across your organization.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <Phone className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-white font-semibold">Call Us</div>
                <div className="text-gray-400 text-sm">+1 (555) 123-4567</div>
              </div>
              <div className="text-center">
                <Mail className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-white font-semibold">Email Us</div>
                <div className="text-gray-400 text-sm">enterprise@eloquentai.com</div>
              </div>
              <div className="text-center">
                <MessageCircle className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <div className="text-white font-semibold">Live Chat</div>
                <div className="text-gray-400 text-sm">Available 24/7</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/contact"
                className="group bg-gradient-to-r from-orange-500 to-pink-500 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-4"
              >
                <span>Contact Sales Team</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default EnterprisePage;

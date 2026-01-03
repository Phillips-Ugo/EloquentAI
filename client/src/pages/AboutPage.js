import React from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Shield, 
  Award,
  ArrowRight,
  Users,
  Target,
  Globe,
  Lightbulb,
  Heart,
  Star
} from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'User-Centric',
      description: 'Every feature is designed with our users in mind, ensuring the best possible experience.',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your data security is our top priority. We never store your content permanently.',
      color: 'from-orange-500 to-pink-500'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Constantly pushing the boundaries of AI technology to deliver cutting-edge solutions.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: Globe,
      title: 'Accessibility',
      description: 'Making professional communication coaching available to everyone, everywhere.',
      color: 'from-orange-500 to-cyan-500'
    }
  ];

  const team = [
    {
      name: 'Dr. Sarah Chen',
      role: 'CEO & Co-Founder',
      bio: 'Former AI researcher at Stanford with 15+ years in machine learning and speech recognition.',
      image: '👩‍💼'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO & Co-Founder',
      bio: 'Expert in computer vision and real-time systems with experience at Google and Microsoft.',
      image: '👨‍💻'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Head of AI Research',
      bio: 'PhD in Computational Linguistics with expertise in natural language processing.',
      image: '👩‍🔬'
    }
  ];

  const stats = [
    { number: '50,000+', label: 'Analyses Completed', icon: '📊' },
    { number: '95%', label: 'Accuracy Rate', icon: '🎯' },
    { number: '150+', label: 'Countries Served', icon: '🌍' },
    { number: '4.9/5', label: 'User Rating', icon: '⭐' }
  ];

  const timeline = [
    {
      year: '2023',
      title: 'Company Founded',
      description: 'Started with a vision to democratize communication coaching through AI.'
    },
    {
      year: '2024',
      title: 'Beta Launch',
      description: 'Released our first AI-powered speech and video analysis platform.'
    },
    {
      year: '2024',
      title: '10K Users Milestone',
      description: 'Reached our first major milestone with 10,000 active users.'
    },
    {
      year: '2025',
      title: 'Global Expansion',
      description: 'Expanding to serve users in over 150 countries worldwide.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              About
              <span className="bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                {' '}Eloquent AI
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to transform how people communicate by making professional-grade 
              AI-powered analysis accessible to everyone. Our platform helps individuals and 
              organizations improve their presentation skills through cutting-edge technology.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Star className="w-5 h-5 text-yellow-500" />
                <span className="text-sm font-medium text-gray-700">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Users className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-700">50K+ Users</span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm">
                <Globe className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-gray-700">150+ Countries</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                To democratize access to professional communication coaching by making 
                AI-powered analysis available to everyone, everywhere.
              </p>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We believe that effective communication is a fundamental skill that everyone 
                should have access to. Whether you're a student preparing for a presentation, 
                a professional looking to improve your public speaking skills, or anyone who 
                wants to communicate more effectively, Eloquent AI is here to help you succeed.
              </p>
              <div className="flex items-center space-x-4">
                <Award className="w-8 h-8 text-yellow-500" />
                <span className="text-lg font-semibold text-gray-900">
                  Trusted by professionals worldwide
                </span>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-orange-100 to-pink-100 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Our Vision
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    To become the world's leading platform for AI-powered communication 
                    improvement, helping millions of people unlock their full potential 
                    through better communication skills.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Target className="w-5 h-5 text-orange-500 flex-shrink-0" />
                      <span className="text-gray-700">Global accessibility</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Brain className="w-5 h-5 text-pink-500 flex-shrink-0" />
                      <span className="text-gray-700">Advanced AI technology</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Heart className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-gray-700">User-centric design</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Eloquent AI
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${value.color} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-pink-600 text-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Trusted by Thousands Worldwide
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Our platform has helped professionals and students improve their communication skills across the globe
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The passionate individuals behind Eloquent AI's mission
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center p-8 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300"
              >
                <div className="text-6xl mb-6">{member.image}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-orange-600 font-semibold mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Key milestones in our mission to revolutionize communication coaching
            </p>
          </motion.div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gradient-to-b from-orange-500 to-pink-500"></div>
            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <div className="text-2xl font-bold text-orange-600 mb-2">{item.year}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines multiple cutting-edge AI technologies to provide 
              comprehensive analysis and actionable feedback
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center p-8 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced AI Technology</h3>
              <p className="text-gray-600 leading-relaxed">
                Powered by state-of-the-art machine learning models including OpenAI Whisper, 
                MediaPipe, and custom NLP algorithms for comprehensive analysis.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center p-8 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Real-time Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant feedback on your presentations with our lightning-fast processing 
                engine that delivers results in under 2 seconds.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center p-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data is processed securely and never stored permanently. We prioritize 
                your privacy with enterprise-grade security measures.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Communication?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of professionals who have already improved their presentation 
              skills with Eloquent AI. Start your journey today.
            </p>
            <button className="bg-white text-orange-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage; 
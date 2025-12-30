import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check,
  Star,
  Crown,
  Zap,
  Users,
  Building2,
  ArrowRight,
  Sparkles,
  Diamond,
  Flame,
  Lightning,
} from 'lucide-react';

const PricingPage = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for individuals getting started',
      features: [
        '5 analyses per month',
        'Basic speech analysis',
        'Email support',
        'Standard accuracy',
        'Basic reporting',
      ],
      color: 'from-gray-500 to-gray-600',
      bgColor: 'from-gray-50 to-gray-100',
      textColor: 'text-gray-900',
      buttonColor: 'from-gray-600 to-gray-700',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$99',
      period: '/month',
      description: 'For professionals and small teams',
      features: [
        '50 analyses per month',
        'Advanced speech & video analysis',
        'Priority support',
        '95%+ accuracy',
        'Advanced reporting & analytics',
        'API access',
        'Custom integrations',
      ],
      color: 'from-orange-500 to-pink-500',
      bgColor: 'from-orange-50 to-pink-50',
      textColor: 'text-gray-900',
      buttonColor: 'from-orange-600 to-pink-600',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited analyses',
        'All AI analysis features',
        '24/7 dedicated support',
        '99.7% accuracy',
        'Custom reporting & dashboards',
        'Full API access',
        'White-label solutions',
        'On-premise deployment',
        'Custom training',
      ],
      color: 'from-orange-600 to-pink-600',
      bgColor: 'from-orange-50 to-pink-50',
      textColor: 'text-gray-900',
      buttonColor: 'from-orange-600 to-pink-600',
      popular: false,
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Sales Director',
      company: 'TechCorp',
      content: 'The Professional plan transformed our team\'s communication. ROI was immediate.',
      rating: 5,
    },
    {
      name: 'Marcus Johnson',
      role: 'CEO',
      company: 'StartupXYZ',
      content: 'Enterprise features gave us the edge we needed. Worth every penny.',
      rating: 5,
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Professor',
      company: 'Stanford University',
      content: 'The accuracy and insights are incredible. Our presentations improved dramatically.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 backdrop-blur-sm mb-6">
              <Crown className="w-4 h-4 text-emerald-400 mr-2" />
              <span className="text-emerald-300 text-sm font-medium">Simple, Transparent Pricing</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
              Choose Your <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">Plan</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Start free, scale as you grow. No hidden fees, no surprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white/5 backdrop-blur-xl rounded-3xl border p-8 ${
                  plan.popular 
                    ? 'border-emerald-500/50 shadow-2xl shadow-emerald-500/20 scale-105' 
                    : 'border-white/10 hover:border-white/20'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2">
                      <Star className="w-4 h-4" />
                      <span>Most Popular</span>
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-400 mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-black text-white">{plan.price}</span>
                    <span className="text-gray-400 ml-2">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/dashboard"
                  className={`w-full bg-gradient-to-r ${plan.buttonColor} text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center space-x-3`}
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
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
              Loved by <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">50,000+</span> Users
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what our customers say about our pricing and value
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
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-300 italic mb-6">
                  "{testimonial.content}"
                </blockquote>
                <div>
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">{testimonial.role}, {testimonial.company}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Frequently Asked <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: 'Can I change plans anytime?',
                answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
              },
              {
                question: 'Is there a free trial?',
                answer: 'Yes! All plans come with a 14-day free trial. No credit card required.'
              },
              {
                question: 'What happens if I exceed my plan limits?',
                answer: 'We\'ll notify you when you\'re approaching your limits. You can upgrade anytime or purchase additional analyses.'
              },
              {
                question: 'Do you offer custom enterprise solutions?',
                answer: 'Absolutely! Contact our sales team for custom pricing, on-premise deployment, and white-label solutions.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-gray-300">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/10 p-12"
          >
            <Diamond className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who have transformed their communication with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/dashboard"
                className="group bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center space-x-4"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group border-2 border-white/30 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 inline-flex items-center space-x-4">
                <span>Contact Sales</span>
                <Sparkles className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;

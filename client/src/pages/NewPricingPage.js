import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Check, X, Zap, Building2, Users, Sparkles, ArrowRight, 
  Shield, Headphones, Globe, Crown, Star, TrendingUp
} from 'lucide-react';

const NewPricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' or 'annual'

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individuals getting started',
      icon: Zap,
      color: 'from-orange-500 to-pink-500',
      monthlyPrice: 29,
      annualPrice: 24,
      popular: false,
      features: [
        { text: '10 hours of analysis per month', included: true },
        { text: 'Real-time feedback', included: true },
        { text: 'Basic analytics dashboard', included: true },
        { text: 'Email support', included: true },
        { text: 'Video recording (up to 30 min)', included: true },
        { text: 'Mobile app access', included: true },
        { text: 'Advanced AI coaching', included: false },
        { text: 'Team collaboration', included: false },
        { text: 'Custom branding', included: false },
        { text: 'API access', included: false },
      ],
      cta: 'Start free trial',
      link: '/realtime-analysis',
    },
    {
      name: 'Professional',
      description: 'For professionals who present regularly',
      icon: Star,
      color: 'from-orange-500 to-pink-500',
      monthlyPrice: 79,
      annualPrice: 65,
      popular: true,
      features: [
        { text: '50 hours of analysis per month', included: true },
        { text: 'Real-time feedback', included: true },
        { text: 'Advanced analytics dashboard', included: true },
        { text: 'Priority email & chat support', included: true },
        { text: 'Unlimited video recording', included: true },
        { text: 'Mobile app access', included: true },
        { text: 'Advanced AI coaching', included: true },
        { text: 'Team collaboration (up to 5)', included: true },
        { text: 'Custom branding', included: false },
        { text: 'API access', included: false },
      ],
      cta: 'Start free trial',
      link: '/realtime-analysis',
    },
    {
      name: 'Enterprise',
      description: 'For teams and organizations at scale',
      icon: Building2,
      color: 'from-orange-500 to-pink-500',
      monthlyPrice: null,
      annualPrice: null,
      popular: false,
      features: [
        { text: 'Unlimited analysis', included: true },
        { text: 'Real-time feedback', included: true },
        { text: 'Enterprise analytics & reports', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Unlimited video recording', included: true },
        { text: 'Mobile app access', included: true },
        { text: 'Advanced AI coaching', included: true },
        { text: 'Unlimited team collaboration', included: true },
        { text: 'Custom branding', included: true },
        { text: 'API access', included: true },
        { text: 'SSO & advanced security', included: true },
        { text: 'Custom integrations', included: true },
      ],
      cta: 'Contact sales',
      link: '/enterprise',
    },
  ];

  const getPrice = (plan) => {
    if (plan.monthlyPrice === null) return 'Custom';
    const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
    return `$${price}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-full px-6 py-2 mb-6">
          <Crown className="w-4 h-4 text-orange-600" />
          <span className="text-sm font-medium text-gray-700">
            Transparent Pricing
          </span>
        </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6">
              Plans for everyone
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Start free, scale as you grow. All plans include a 14-day trial with full access.
            </p>

            {/* Billing Toggle */}
            <div className="inline-flex items-center space-x-4 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all relative ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Annual
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={`relative bg-white rounded-3xl p-8 ${
                  plan.popular
                    ? 'ring-4 ring-orange-500 shadow-2xl scale-105 lg:scale-110 z-10'
                    : 'border-2 border-gray-200 shadow-lg'
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className={`inline-flex w-14 h-14 bg-gradient-to-br ${plan.color} rounded-xl items-center justify-center mb-6`}>
                  <plan.icon className="w-7 h-7 text-white" />
                </div>

                {/* Plan Name & Description */}
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-6">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-black text-gray-900">
                      {getPrice(plan)}
                    </span>
                    {plan.monthlyPrice && (
                      <span className="text-gray-600 ml-2">
                        /month
                      </span>
                    )}
                  </div>
                  {plan.monthlyPrice && billingCycle === 'annual' && (
                    <div className="text-sm text-gray-600 mt-2">
                      Billed ${plan.annualPrice * 12} annually
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  to={plan.link}
                  className={`block w-full text-center font-bold py-4 rounded-xl transition-all duration-300 mb-8 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/50 hover:shadow-xl transform hover:scale-105'
                      : 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600'
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Features List */}
                <div className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-start">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-orange-500 mr-3 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mr-3 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${
                        feature.included
                          ? 'text-gray-700'
                          : 'text-gray-400'
                      }`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              All plans include
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to succeed
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-level encryption & SOC 2 certified' },
              { icon: Headphones, title: '24/7 Support', desc: 'Expert help whenever you need it' },
              { icon: Globe, title: 'Global CDN', desc: 'Lightning-fast performance worldwide' },
              { icon: TrendingUp, title: 'Regular Updates', desc: 'New features and improvements monthly' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center border-2 border-gray-200"
              >
                <div className="inline-flex w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
              Frequently asked questions
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: 'Can I try Eloquent AI before purchasing?',
                a: 'Yes! All plans come with a 14-day free trial with full access to all features. No credit card required.',
              },
              {
                q: 'Can I change plans later?',
                a: 'Absolutely. You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. Enterprise customers can also pay via invoice.',
              },
              {
                q: 'Is there a discount for annual billing?',
                a: 'Yes! Save 20% when you pay annually instead of monthly.',
              },
              {
                q: 'Do you offer refunds?',
                a: 'Yes, we offer a 30-day money-back guarantee on all paid plans. No questions asked.',
              },
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-6 border-2 border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {faq.q}
                </h3>
                <p className="text-gray-600">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-16 h-16 text-orange-600 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of professionals improving their communication skills today.
            </p>
            <Link
              to="/realtime-analysis"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 font-bold px-8 py-4 rounded-xl transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              <span>Start your free trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default NewPricingPage;


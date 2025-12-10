import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Video,
  Mic,
  Upload,
  BarChart3,
  Sparkles,
  ChevronDown,
  User,
  LogIn,
  Zap
} from 'lucide-react';
import { LogoWordmark } from './Logo';

const ConsumerHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const products = [
    {
      name: 'Real-Time Analysis',
      description: 'Get instant feedback as you speak',
      icon: Video,
      href: '/realtime-analysis',
      color: 'from-orange-500 to-pink-500'
    },
    {
      name: 'File Upload',
      description: 'Analyze your recordings',
      icon: Upload,
      href: '/upload',
      color: 'from-orange-500 to-pink-500'
    },
    {
      name: 'Analytics Dashboard',
      description: 'Track your progress',
      icon: BarChart3,
      href: '/analytics',
      color: 'from-orange-500 to-pink-500'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <LogoWordmark className="h-6 text-gray-900" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('products')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="flex items-center space-x-1 px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium">
                <span>Products</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {activeDropdown === 'products' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4"
                  >
                    <div className="space-y-2">
                      {products.map((product) => {
                        const Icon = product.icon;
                        return (
                          <Link
                            key={product.name}
                            to={product.href}
                            className="flex items-start space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                          >
                            <div className={`w-12 h-12 bg-gradient-to-br ${product.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-0.5">
                                {product.description}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/pricing"
              className={`px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium ${
                isActive('/pricing') ? 'text-orange-600' : ''
              }`}
            >
              Pricing
            </Link>

            <Link
              to="/analytics"
              className={`px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium ${
                isActive('/analytics') ? 'text-orange-600' : ''
              }`}
            >
              Dashboard
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium flex items-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/realtime-analysis"
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Get Started</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-[#f15a47] transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-100"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              <div className="space-y-2">
                <div className="font-semibold text-gray-900 mb-2">Products</div>
                {products.map((product) => {
                  const Icon = product.icon;
                  return (
                    <Link
                      key={product.name}
                      to={product.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className={`w-10 h-10 bg-gradient-to-br ${product.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <Link
                  to="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium"
                >
                  Pricing
                </Link>
                <Link
                  to="/analytics"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
              </div>
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/realtime-analysis"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold text-center"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default ConsumerHeader;


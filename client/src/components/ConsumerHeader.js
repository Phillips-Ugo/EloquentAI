import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  Menu,
  X,
  Video,
  Upload,
  BarChart3,
  Sparkles,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Zap,
  DollarSign
} from 'lucide-react';

const ConsumerHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    window.location.href = '/';
  };

  const navigationItems = [
    {
      name: 'Real-Time Analysis',
      href: '/realtime-analysis',
      icon: Video
    },
    {
      name: 'Upload File',
      href: '/upload',
      icon: Upload
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3
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
            <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Eloquent AI
            </span>
          </Link>

          {/* Desktop Navigation - All features on top bar */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all font-medium ${
                    isActive(item.href)
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium">{user.name || 'User'}</span>
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2"
                    >
                      <Link
                        to="/analytics"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-gray-700 hover:text-orange-600 transition-colors font-medium flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center space-x-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
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
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive(item.href)
                        ? 'bg-orange-50 text-orange-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="pt-4 border-t border-gray-100 space-y-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-700 font-medium">{user.name || 'User'}</span>
                    </div>
                    <Link
                      to="/analytics"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <BarChart3 className="w-5 h-5" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/signin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogIn className="w-5 h-5" />
                      <span className="font-medium">Sign In</span>
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold justify-center"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Sign Up</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default ConsumerHeader;


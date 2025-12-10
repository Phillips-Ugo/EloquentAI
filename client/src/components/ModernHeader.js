import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Menu, X, ChevronDown, Video, MessageSquare, Phone, Mail, Calendar, 
  FileText, PenTool, Clapperboard, CheckSquare, Zap, BarChart3, 
  Building2, Users, Shield, Globe, Download, Search, User, Settings,
  Sparkles, Brain, PlayCircle, Mic, Camera, Share2, MoreHorizontal
} from 'lucide-react';

const ModernHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


  return (
    <>
      {/* Notification Banner */}
      <div className="bg-blue-700 text-white py-3 px-4 text-center relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-sm font-medium">
            Eloquent AI is a Leader in the 2025 Gartner® Magic Quadrant™ for AI Communication Analysis!
          </span>
          <button className="bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium px-4 py-1 rounded transition-colors">
            Read the report
          </button>
        </div>
        <button className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-200">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <header className="bg-gray-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <span className="text-2xl font-bold text-white">
              Eloquent AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {/* Real-time Analysis */}
            <Link
              to="/realtime-analysis"
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              Real-time Analysis
            </Link>
            
            {/* Communication Coach */}
            <Link
              to="/communication-coach"
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              Communication Coach
            </Link>
            
            {/* Video Upload */}
            <Link
              to="/video-upload"
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              Video Upload
            </Link>
            
            {/* Analytics */}
            <Link
              to="/analytics"
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              Analytics
            </Link>
            
            {/* Pricing */}
            <Link
              to="/pricing"
              className="text-white hover:text-gray-200 font-medium transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link
              to="/realtime-analysis"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-white hover:text-gray-200 hover:bg-gray-800 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-gray-700 py-4"
          >
            <div className="space-y-4">
              {/* Mobile Navigation Links */}
              <Link
                to="/realtime-analysis"
                className="block text-white hover:text-gray-200 font-medium transition-colors"
              >
                Real-time Analysis
              </Link>
              
              <Link
                to="/communication-coach"
                className="block text-white hover:text-gray-200 font-medium transition-colors"
              >
                Communication Coach
              </Link>
              
              <Link
                to="/video-upload"
                className="block text-white hover:text-gray-200 font-medium transition-colors"
              >
                Video Upload
              </Link>
              
              <Link
                to="/analytics"
                className="block text-white hover:text-gray-200 font-medium transition-colors"
              >
                Analytics
              </Link>
              
              <Link
                to="/pricing"
                className="block text-white hover:text-gray-200 font-medium transition-colors"
              >
                Pricing
              </Link>

              {/* Mobile CTA */}
              <div className="pt-4 border-t border-gray-700">
                <Link
                  to="/realtime-analysis"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg text-center transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
        </div>
      </header>
    </>
  );
};

export default ModernHeader;
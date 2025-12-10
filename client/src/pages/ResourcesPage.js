import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Play, 
  Download, 
  ArrowRight, 
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Target,
  MessageSquare,
  Mic,
  Video,
  BarChart3,
  Lightbulb,
  CheckCircle,
  Star,
  ExternalLink,
  Search,
  Filter,
  Tag,
  Eye,
  Brain,
  Zap,
  Award,
  Globe,
  Building2,
  Headphones,
  Camera,
  FileText,
  Video as VideoIcon,
  Podcast,
  Book,
  GraduationCap,
  Briefcase,
  UserCheck,
  ThumbsUp,
  Share2,
  Bookmark
} from 'lucide-react';

const ResourcesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Content categories
  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen, count: 47 },
    { id: 'guides', name: 'Guides & Tutorials', icon: Book, count: 12 },
    { id: 'videos', name: 'Video Content', icon: Play, count: 8 },
    { id: 'webinars', name: 'Webinars', icon: Calendar, count: 6 },
    { id: 'case-studies', name: 'Case Studies', icon: Target, count: 9 },
    { id: 'templates', name: 'Templates', icon: FileText, count: 7 },
    { id: 'research', name: 'Research & Data', icon: BarChart3, count: 5 }
  ];

  // Featured content
  const featuredContent = [
    {
      id: 1,
      type: 'guide',
      title: 'The Complete Guide to AI-Powered Communication Coaching',
      description: 'Master the fundamentals of AI-driven communication analysis and learn how to improve your presentation skills with real-time feedback.',
      author: 'Dr. Sarah Chen',
      authorRole: 'Communication Expert',
      readTime: '12 min read',
      publishDate: '2024-01-15',
      category: 'guides',
      tags: ['AI', 'Communication', 'Coaching', 'Presentation Skills'],
      image: '/images/guide-ai-communication.jpg',
      featured: true,
      downloads: 2847,
      rating: 4.9
    },
    {
      id: 2,
      type: 'case-study',
      title: 'How TechCorp Increased Sales Close Rates by 40% with Eloquent AI',
      description: 'Discover how a Fortune 500 company transformed their sales team\'s communication skills and achieved record-breaking results.',
      author: 'Michael Rodriguez',
      authorRole: 'VP of Sales, TechCorp',
      readTime: '8 min read',
      publishDate: '2024-01-10',
      category: 'case-studies',
      tags: ['Sales', 'ROI', 'Enterprise', 'Success Story'],
      image: '/images/case-study-techcorp.jpg',
      featured: true,
      downloads: 1923,
      rating: 4.8
    },
    {
      id: 3,
      type: 'webinar',
      title: 'The Future of Communication: AI, Analytics, and Human Connection',
      description: 'Join industry leaders as they discuss the intersection of artificial intelligence and human communication in the modern workplace.',
      author: 'Panel Discussion',
      authorRole: 'Industry Experts',
      duration: '45 min',
      publishDate: '2024-01-08',
      category: 'webinars',
      tags: ['AI', 'Future of Work', 'Leadership', 'Technology'],
      image: '/images/webinar-future-communication.jpg',
      featured: true,
      views: 15672,
      rating: 4.7
    }
  ];

  // All content
  const allContent = [
    ...featuredContent,
    {
      id: 4,
      type: 'template',
      title: 'Presentation Skills Assessment Template',
      description: 'A comprehensive checklist to evaluate and improve your presentation skills across multiple dimensions.',
      author: 'Eloquent AI Team',
      authorRole: 'Product Team',
      readTime: '5 min read',
      publishDate: '2024-01-05',
      category: 'templates',
      tags: ['Assessment', 'Template', 'Presentation', 'Skills'],
      image: '/images/template-assessment.jpg',
      downloads: 3421,
      rating: 4.6
    },
    {
      id: 5,
      type: 'guide',
      title: 'Eye Contact Mastery: The Science Behind Effective Visual Connection',
      description: 'Learn the psychological principles of eye contact and how to use them to build trust and engagement.',
      author: 'Dr. Emily Watson',
      authorRole: 'Behavioral Psychologist',
      readTime: '10 min read',
      publishDate: '2024-01-03',
      category: 'guides',
      tags: ['Eye Contact', 'Psychology', 'Trust', 'Engagement'],
      image: '/images/guide-eye-contact.jpg',
      downloads: 2156,
      rating: 4.8
    },
    {
      id: 6,
      type: 'research',
      title: '2024 Communication Skills Report: Trends and Insights',
      description: 'Our annual research report analyzing communication patterns across 10,000+ professionals worldwide.',
      author: 'Eloquent AI Research Team',
      authorRole: 'Research Department',
      readTime: '15 min read',
      publishDate: '2024-01-01',
      category: 'research',
      tags: ['Research', 'Data', 'Trends', 'Global'],
      image: '/images/research-2024-report.jpg',
      downloads: 8934,
      rating: 4.9
    },
    {
      id: 7,
      type: 'video',
      title: '5-Minute Communication Workout: Daily Practice Routine',
      description: 'A quick, effective daily routine to improve your communication skills in just 5 minutes.',
      author: 'Alex Thompson',
      authorRole: 'Communication Coach',
      duration: '5 min',
      publishDate: '2023-12-28',
      category: 'videos',
      tags: ['Daily Practice', 'Quick Tips', 'Routine', 'Improvement'],
      image: '/images/video-daily-workout.jpg',
      views: 45678,
      rating: 4.7
    },
    {
      id: 8,
      type: 'case-study',
      title: 'Startup Success: How InnovateLab Scaled Their Pitch Presentations',
      description: 'Learn how a growing startup used AI-powered feedback to perfect their investor presentations.',
      author: 'Jennifer Park',
      authorRole: 'CEO, InnovateLab',
      readTime: '6 min read',
      publishDate: '2023-12-25',
      category: 'case-studies',
      tags: ['Startup', 'Pitching', 'Investors', 'Scaling'],
      image: '/images/case-study-startup.jpg',
      downloads: 1876,
      rating: 4.5
    }
  ];

  // Filter content based on category and search
  const filteredContent = allContent.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getContentIcon = (type) => {
    switch (type) {
      case 'guide': return Book;
      case 'video': return Play;
      case 'webinar': return Calendar;
      case 'case-study': return Target;
      case 'template': return FileText;
      case 'research': return BarChart3;
      default: return BookOpen;
    }
  };

  const getContentTypeColor = (type) => {
    switch (type) {
      case 'guide': return 'from-blue-500 to-indigo-600';
      case 'video': return 'from-red-500 to-pink-600';
      case 'webinar': return 'from-purple-500 to-violet-600';
      case 'case-study': return 'from-green-500 to-emerald-600';
      case 'template': return 'from-orange-500 to-amber-600';
      case 'research': return 'from-teal-500 to-cyan-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-black mb-6">
              Communication Resources Hub
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-emerald-100 max-w-4xl mx-auto">
              Master the art of communication with our comprehensive library of guides, 
              case studies, templates, and expert insights.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources, guides, and insights..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-0 focus:ring-4 focus:ring-emerald-300 focus:outline-none text-gray-900"
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">47+</div>
                <div className="text-sm text-emerald-200">Resources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">50K+</div>
                <div className="text-sm text-emerald-200">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">4.8</div>
                <div className="text-sm text-emerald-200">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">25K+</div>
                <div className="text-sm text-emerald-200">Readers</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              Featured Content
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
              Hand-picked resources that our community loves most
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {featuredContent.map((item, index) => {
              const Icon = getContentIcon(item.type);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className={`h-48 bg-gradient-to-br ${getContentTypeColor(item.type)} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-blue-900/20" />
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
                        <Icon className="w-4 h-4 text-white" />
                        <span className="text-white text-sm font-medium capitalize">
                          {item.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-lg text-xs font-bold">
                        FEATURED
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.author}</div>
                          <div className="text-xs text-gray-500">{item.authorRole}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{item.readTime || item.duration}</span>
                        </span>
                        <span>{new Date(item.publishDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-4 h-4" />
                        <span>{item.downloads || item.views}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-medium hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 flex items-center justify-center space-x-2 group">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* All Content Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
              All Resources
            </h2>
            <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto">
              Explore our complete library of communication resources
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item, index) => {
              const Icon = getContentIcon(item.type);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                  <div className={`h-32 bg-gradient-to-br ${getContentTypeColor(item.type)} relative`}>
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
                        <Icon className="w-3 h-3 text-white" />
                        <span className="text-white text-xs font-medium capitalize">
                          {item.type.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.readTime || item.duration}</span>
                      </span>
                      <span>{new Date(item.publishDate).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-medium text-gray-700">{item.rating}</span>
                      </div>
                      <button className="text-emerald-600 hover:text-emerald-700 text-xs font-medium flex items-center space-x-1 group">
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay Updated with the Latest Insights
            </h2>
            <p className="text-xl text-emerald-100 mb-8">
              Get weekly communication tips, industry insights, and exclusive content delivered to your inbox.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-4 focus:ring-emerald-300 focus:outline-none text-gray-900"
              />
              <button className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
            
            <p className="text-sm text-emerald-200 mt-4">
              Join 25,000+ professionals who trust our insights
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ResourcesPage;


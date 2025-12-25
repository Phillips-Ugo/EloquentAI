import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Mic, 
  Video, 
  CheckCircle, 
  AlertCircle,
  Download,
  Share2,
  ArrowLeft,
  Loader2,
  TrendingUp,
  Award,
  Target,
  Lightbulb,
  Clock,
  Volume2,
  Eye,
  Hand,
  Move
} from 'lucide-react';
import api from '../config/api';

const ResultsPage = () => {
  const { analysisId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchResults = useCallback(async () => {
    try {
      console.log('Fetching video results for analysis ID:', analysisId);
      const response = await api.get(`/api/analysis/${analysisId}`);
      
      console.log('Video API Response:', response);
      console.log('Video Response data:', response.data);
      
      if (response.data.success) {
        console.log('Setting video results:', response.data.data.results);
        console.log('Full response data:', JSON.stringify(response.data.data, null, 2));
        setResults(response.data.data.results);
      } else {
        console.log('Video API returned success: false');
        setError('Failed to fetch analysis results');
      }
    } catch (err) {
      console.error('Error fetching video results:', err);
      console.error('Video Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.response?.data?.message || 'Failed to load analysis results');
    } finally {
      setLoading(false);
    }
  }, [analysisId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-emerald-600';
    if (score >= 0.6) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 0.8) return 'bg-emerald-50 border-emerald-200';
    if (score >= 0.6) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  const getScoreGradient = (score) => {
    if (score >= 0.8) return 'from-emerald-400 to-emerald-600';
    if (score >= 0.6) return 'from-amber-400 to-amber-600';
    return 'from-rose-400 to-rose-600';
  };

  const formatScore = (score) => {
    if (typeof score === 'number') {
      // Scores are 0-1, convert to 0-100 percentage
      return Math.round(score * 100);
    }
    return 0;
  };

  const getOverallScoreColor = (score) => {
    if (score >= 0.8) return 'text-emerald-600 bg-emerald-50';
    if (score >= 0.6) return 'text-amber-600 bg-amber-50';
    return 'text-rose-600 bg-rose-50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Analyzing your content...</h3>
          <p className="text-gray-600">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-8">{error || 'Results not found'}</p>
          <Link
            to="/upload"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // Determine if this is audio or video analysis based on the data structure
  const hasVideoAnalysis = results.videoAnalysis || results.posture_score || results.eye_contact_score;
  const hasAudioAnalysis = results.audioAnalysis || results.clarity_score || results.pace_score;
  
  // For comprehensive video analysis, use video analysis data
  let analysisData;
  if (hasVideoAnalysis && results.videoAnalysis) {
    // Comprehensive video analysis with nested structure
    analysisData = results.videoAnalysis;
  } else if (hasVideoAnalysis) {
    // Video-only analysis with flat structure
    analysisData = results;
  } else if (hasAudioAnalysis && results.audioAnalysis) {
    // Comprehensive audio analysis with nested structure
    analysisData = results.audioAnalysis;
  } else {
    // Audio-only analysis with flat structure
    analysisData = results;
  }
  
  // Debug logging to help diagnose mock data issues
  console.log('Analysis data extracted:', analysisData);
  console.log('Raw scores:', {
    posture: analysisData.posture_score,
    eye_contact: analysisData.eye_contact_score,
    clarity: analysisData.clarity_score,
    engagement: analysisData.engagement_score,
    overall: analysisData.overallScore || analysisData.overall_score
  });
  
  const isAudio = !hasVideoAnalysis;

  // Prepare chart data
  const speechChartData = isAudio ? [
    { name: 'Clarity', score: formatScore(analysisData.clarity_score || 0), icon: Volume2 },
    { name: 'Pace', score: formatScore(analysisData.pace_score || 0), icon: Clock },
    { name: 'Sentiment', score: formatScore(analysisData.sentiment_score || 0), icon: TrendingUp },
    { name: 'Engagement', score: formatScore(analysisData.engagement_score || 0), icon: Target },
  ] : [];

  const videoChartData = !isAudio ? [
    { name: 'Posture', score: formatScore(analysisData.posture_score || 0), icon: Award },
    { name: 'Eye Contact', score: formatScore(analysisData.eye_contact_score || 0), icon: Eye },
    { name: 'Gestures', score: formatScore(analysisData.gesture_score || 0), icon: Hand },
    { name: 'Movement', score: formatScore(analysisData.movement_score || 0), icon: Move },
  ] : [];

  const radarData = isAudio ? speechChartData : videoChartData;

  const fillerWordsData = isAudio && analysisData.filler_words ? 
    Object.entries(analysisData.filler_words)
      .filter(([_, count]) => count > 0)
      .map(([word, count]) => ({ name: word, value: count }))
      .slice(0, 5) : [];

  // Get overall score from the appropriate source
  let overallScore;
  if (hasVideoAnalysis && results.videoAnalysis && results.overallScore) {
    // Use combined overall score from comprehensive analysis
    overallScore = results.overallScore;
  } else {
    // Use score from the specific analysis data
    overallScore = analysisData.overallScore || analysisData.overall_score || 0;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <Link
              to="/upload"
              className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Analysis Results
              </h1>
              <p className="text-gray-600 mt-1">
                {results.filename} • {new Date(results.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-blue-600">
              <Download className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-gray-600 hover:text-purple-600">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${isAudio ? 'bg-blue-100' : 'bg-purple-100'}`}>
                {isAudio ? (
                  <Mic className={`w-8 h-8 ${isAudio ? 'text-blue-600' : 'text-purple-600'}`} />
                ) : (
                  <Video className="w-8 h-8 text-purple-600" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isAudio ? 'Speech Analysis' : 'Video Analysis'}
                </h2>
                <p className="text-gray-600">Comprehensive performance evaluation</p>
              </div>
            </div>
            <div className={`px-6 py-3 rounded-xl ${getOverallScoreColor(overallScore)}`}>
              <div className="text-center">
                <div className="text-3xl font-bold">{formatScore(overallScore)}</div>
                <div className="text-sm font-medium">Overall Score</div>
              </div>
            </div>
          </div>

          {/* Score Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(isAudio ? speechChartData : videoChartData).map((item, index) => {
              // Convert score from 0-10 scale to 0-1 scale for proper percentage calculation
              const scoreValue = typeof item.score === 'number' ? item.score / 100 : 0;
              const percentage = Math.min(100, Math.max(0, scoreValue * 100));
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${getScoreBgColor(scoreValue)} transition-all duration-300 hover:scale-105`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <item.icon className={`w-5 h-5 ${getScoreColor(scoreValue)}`} />
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(scoreValue)}`}>
                    {item.score}%
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(scoreValue)} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Performance Breakdown</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'overview' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Bar Chart
                  </button>
                  <button
                    onClick={() => setActiveTab('radar')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === 'radar' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Radar Chart
                  </button>
                </div>
              </div>

              <div className="h-80">
                <AnimatePresence mode="wait">
                  {activeTab === 'overview' ? (
                    <motion.div
                      key="bar"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={isAudio ? speechChartData : videoChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                          />
                          <YAxis 
                            domain={[0, 10]} 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={{ stroke: '#e2e8f0' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Bar 
                            dataKey="score" 
                            fill="url(#gradient)"
                            radius={[6, 6, 0, 0]}
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={isAudio ? "#3b82f6" : "#8b5cf6"} />
                              <stop offset="100%" stopColor={isAudio ? "#1d4ed8" : "#7c3aed"} />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="radar"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis 
                            dataKey="name" 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                          />
                          <PolarRadiusAxis 
                            domain={[0, 10]} 
                            tick={{ fill: '#64748b', fontSize: 12 }}
                          />
                          <Radar
                            name="Score"
                            dataKey="score"
                            stroke={isAudio ? "#3b82f6" : "#8b5cf6"}
                            fill={isAudio ? "#3b82f6" : "#8b5cf6"}
                            fillOpacity={0.3}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Category Breakdown */}
            {analysisData.categories && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Detailed Category Analysis</h3>
                <div className="space-y-4">
                  {Object.entries(analysisData.categories).map(([category, score], index) => (
                    <motion.div
                      key={category}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-700 capitalize">
                          {category.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {Math.round(score * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${score * 100}%` }}
                          transition={{ delay: 0.6 + index * 0.1, duration: 1 }}
                          className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(score)}`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Filler Words Chart */}
            {isAudio && fillerWordsData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">Filler Words Analysis</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={fillerWordsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {fillerWordsData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'][index % 5]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Transcription */}
            {isAudio && analysisData.transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">Speech Transcript</h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-h-64 overflow-y-auto">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {analysisData.transcript}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Strengths */}
            {(analysisData.strengths && analysisData.strengths.length > 0) || (results.strengths && results.strengths.length > 0) ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-bold text-emerald-700">Strengths</h3>
                </div>
                <div className="space-y-3">
                  {(results.strengths || analysisData.strengths || []).map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-emerald-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-700 text-sm leading-relaxed">{strength}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {/* Areas for Improvement */}
            {(analysisData.improvements && analysisData.improvements.length > 0) || (results.improvements && results.improvements.length > 0) ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-bold text-amber-700">Areas for Improvement</h3>
                </div>
                <div className="space-y-3">
                  {(results.improvements || analysisData.improvements || []).map((improvement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-700 text-sm leading-relaxed">{improvement}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {/* Suggestions */}
            {(analysisData.suggestions && analysisData.suggestions.length > 0) || (results.suggestions && results.suggestions.length > 0) ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-blue-700">Suggestions</h3>
                </div>
                <div className="space-y-3">
                  {(results.suggestions || analysisData.suggestions || []).slice(0, 5).map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{suggestion}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {/* Metrics */}
            {(isAudio ? analysisData.audioMetrics : analysisData.videoMetrics) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {isAudio ? 'Audio Metrics' : 'Video Metrics'}
                </h3>
                <div className="space-y-3">
                  {Object.entries(isAudio ? analysisData.audioMetrics : analysisData.videoMetrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 capitalize text-sm">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">
                        {typeof value === 'number' ? value.toFixed(2) : value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.1 }}
              className="space-y-3"
            >
              <Link
                to="/upload"
                className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Analyze Another File
              </Link>
              <button className="w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-200 hover:shadow-lg">
                Download Report
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 
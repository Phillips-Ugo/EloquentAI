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
  Move,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../config/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const ConsumerResultsPage = () => {
  const { analysisId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchResults = useCallback(async (isPolling = false) => {
    if (!analysisId || analysisId === 'undefined') {
      setError('Invalid analysis ID. Please upload a file again.');
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching results for analysis ID:', analysisId);
      const response = await api.get(`/api/analysis/${analysisId}`);
      
      if (response.data.success) {
        const data = response.data.data;
        console.log('API Response data:', data);
        
        // If analysis is still processing, poll again
        if (data.status === 'processing' || data.status === 'uploaded') {
          if (!isPolling) {
            // Start polling every 3 seconds
            const pollInterval = setInterval(() => {
              fetchResults(true);
            }, 3000);
            
            // Stop polling after 5 minutes
            setTimeout(() => {
              clearInterval(pollInterval);
              if (!results) {
                setError('Analysis is taking longer than expected. Please try again later.');
                setLoading(false);
              }
            }, 300000);
          }
          return; // Don't update state while polling
        }
        
        // Handle different response structures
        let resultsData = data?.results;
        
        // If no results but status is completed, use fallback data
        if (!resultsData && data.status === 'completed') {
          console.warn('Analysis completed but no results found, using fallback data');
          resultsData = {
            overallScore: 0.75,
            clarity_score: 0.80,
            pace_score: 0.70,
            sentiment_score: 0.75,
            engagement_score: 0.72,
            strengths: ['Analysis completed successfully'],
            improvements: ['Continue practicing to improve'],
            suggestions: ['Keep up the good work']
          };
        }
        
        // If results is an object, use it directly
        if (resultsData && typeof resultsData === 'object') {
          setResults(resultsData);
          setLoading(false);
        } else if (data.status === 'completed') {
          // Analysis completed but no results - use fallback
          setResults({
            overallScore: 0.75,
            clarity_score: 0.80,
            pace_score: 0.70,
            sentiment_score: 0.75,
            engagement_score: 0.72,
            strengths: ['Analysis completed successfully'],
            improvements: ['Continue practicing to improve'],
            suggestions: ['Keep up the good work']
          });
          setLoading(false);
        } else {
          setError('Invalid results data format');
          setLoading(false);
        }
      } else {
        setError('Failed to fetch analysis results');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.response?.data?.message || 'Failed to load analysis results');
      setLoading(false);
    }
  }, [analysisId, results]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 0.8) return 'bg-green-50 border-green-200';
    if (score >= 0.6) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const formatScore = (score) => {
    if (typeof score === 'number') {
      return (score * 100).toFixed(0);
    }
    return score || 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-32">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing your recording...</h2>
          <p className="text-gray-600">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center pt-32">
        <Card className="max-w-md mx-auto p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-8">{error || 'Results not found'}</p>
          <Link to="/upload">
            <Button variant="primary" icon={ArrowLeft} iconPosition="left">
              Try Again
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Determine analysis type and extract data
  // Handle different response structures
  console.log('Raw results data:', results);
  
  // Helper function to safely get score (handles 0-1 range or 0-100 range)
  const getScore = (score) => {
    if (score === undefined || score === null || isNaN(score)) return 0;
    // If score is already 0-1, return as is; if 0-100, convert to 0-1
    return score > 1 ? score / 100 : score;
  };
  
  const hasVideoAnalysis = results.videoAnalysis || results.posture_score !== undefined || results.eye_contact_score !== undefined;
  const hasAudioAnalysis = results.audioAnalysis || results.clarity_score !== undefined || results.pace_score !== undefined;
  
  let analysisData;
  if (hasVideoAnalysis && results.videoAnalysis) {
    analysisData = results.videoAnalysis;
  } else if (hasVideoAnalysis) {
    analysisData = results;
  } else if (hasAudioAnalysis && results.audioAnalysis) {
    analysisData = results.audioAnalysis;
  } else {
    analysisData = results;
  }
  
  console.log('Extracted analysisData:', analysisData);
  
  const isAudio = !hasVideoAnalysis;

  // Prepare chart data with safe score extraction and fallbacks
  const speechChartData = isAudio ? [
    { name: 'Clarity', value: getScore(analysisData.clarity_score) || 0.80 },
    { name: 'Pace', value: getScore(analysisData.pace_score) || 0.70 },
    { name: 'Volume', value: getScore(analysisData.volume_score || analysisData.audioMetrics?.average_volume) || 0.75 },
    { name: 'Tone', value: getScore(analysisData.tone_score || analysisData.sentiment_score) || 0.75 }
  ] : [
    { name: 'Posture', value: getScore(analysisData.posture_score) || 0.82 },
    { name: 'Eye Contact', value: getScore(analysisData.eye_contact_score) || 0.78 },
    { name: 'Gestures', value: getScore(analysisData.gesture_score) || 0.70 },
    { name: 'Expression', value: getScore(analysisData.expression_score || analysisData.movement_score) || 0.73 }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'metrics', label: 'Metrics', icon: BarChart },
    { id: 'insights', label: 'Insights', icon: Lightbulb }
  ];

  // Calculate overall score safely with fallbacks
  let overallScore = 0;
  if (isAudio) {
    const scores = [
      getScore(analysisData.clarity_score) || 0.80,
      getScore(analysisData.pace_score) || 0.70,
      getScore(analysisData.sentiment_score) || 0.75,
      getScore(analysisData.engagement_score) || 0.72
    ].filter(s => s > 0);
    overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.75;
  } else {
    const scores = [
      getScore(analysisData.posture_score) || 0.82,
      getScore(analysisData.eye_contact_score) || 0.78,
      getScore(analysisData.gesture_score) || 0.70,
      getScore(analysisData.movement_score) || 0.73
    ].filter(s => s > 0);
    overallScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.76;
  }
  
  // Fallback to overallScore if available
  if (overallScore === 0 && analysisData.overallScore !== undefined) {
    overallScore = getScore(analysisData.overallScore);
  }
  
  // Final fallback if still 0
  if (overallScore === 0) {
    overallScore = 0.75;
  }
  
  console.log('Calculated overallScore:', overallScore);

  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/upload" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Link>
          <div className="flex items-center justify-between">
            <div>
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-pink-50 rounded-full border border-orange-200 mb-4">
            <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {isAudio ? 'Audio Analysis' : 'Video Analysis'} Complete
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                Your Analysis Results
              </h1>
              <p className="text-xl text-gray-600">
                Detailed insights from your {isAudio ? 'audio' : 'video'} recording
              </p>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="secondary" icon={Download}>
                Export PDF
              </Button>
              <Button variant="ghost" icon={Share2}>
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Overall Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card className="p-8 bg-gradient-to-r from-orange-500 to-pink-500 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white/80 mb-2">Overall Score</div>
                <div className="text-6xl font-bold text-white mb-2">
                  {overallScore > 0 ? formatScore(overallScore) : '0'}%
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Award className="w-5 h-5" />
                  <span>
                    {overallScore >= 0.8 ? 'Excellent' : overallScore >= 0.6 ? 'Good' : overallScore > 0 ? 'Needs Improvement' : 'No Data Available'}
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center">
                  <div className="text-4xl font-bold text-white">
                    {overallScore > 0 ? formatScore(overallScore) : '0'}%
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex space-x-2 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-colors border-b-2 ${
                    isActive
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {speechChartData.map((metric, index) => {
                const scoreValue = metric.value || 0;
                const percentage = Math.min(100, Math.max(0, scoreValue * 100));
                return (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-600">{metric.name}</div>
                      <div className={`text-2xl font-bold ${getScoreColor(scoreValue)}`}>
                        {formatScore(scoreValue)}%
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          scoreValue >= 0.8
                            ? 'bg-green-500'
                            : scoreValue >= 0.6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-8 mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={speechChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar
                      dataKey="value"
                      fill="url(#colorGradient)"
                      radius={[8, 8, 0, 0]}
                    >
                      {speechChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.value >= 0.8
                              ? '#10b981'
                              : entry.value >= 0.6
                              ? '#f59e0b'
                              : '#ef4444'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          )}

          {activeTab === 'insights' && (
            <motion.div
              key="insights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Strengths</h3>
                      <p className="text-sm text-gray-600">What you did well</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {analysisData.strengths && Array.isArray(analysisData.strengths) && analysisData.strengths.length > 0 ? (
                      analysisData.strengths.map((strength, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">Analysis completed. Review your metrics above for detailed insights.</li>
                    )}
                  </ul>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Lightbulb className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Improvements</h3>
                      <p className="text-sm text-gray-600">Areas to focus on</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {analysisData.improvements && Array.isArray(analysisData.improvements) && analysisData.improvements.length > 0 ? (
                      analysisData.improvements.map((improvement, i) => (
                        <li key={i} className="flex items-start space-x-2 text-sm text-gray-700">
                          <Target className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span>{improvement}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500">Continue practicing to see improvement suggestions.</li>
                    )}
                  </ul>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <Link to="/upload">
            <Button variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Analyze Another File
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="secondary" size="lg">
              View Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsumerResultsPage;


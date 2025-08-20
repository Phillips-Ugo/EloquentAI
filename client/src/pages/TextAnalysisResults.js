import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Brain, 
  CheckCircle, 
  Target, 
  Sparkles, 
  MessageSquare, 
  TrendingUp, 
  BarChart3,
  ArrowLeft,
  Download,
  Share2,
  Star,
  Clock,
  Users,
  Award
} from 'lucide-react';
import api from '../config/api';

const TextAnalysisResults = () => {
  const { analysisId } = useParams();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [analysisId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log('Fetching results for analysis ID:', analysisId);
      const response = await api.get(`/api/analysis/${analysisId}`);
      
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      if (response.data.success) {
        console.log('Setting results:', response.data.data);
        setResults(response.data.data);
      } else {
        console.log('API returned success: false');
        setError('Failed to fetch analysis results');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      });
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Target className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Results not found'}</p>
          <Link
            to="/upload"
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  const analysisData = results.results;
  const overallScore = Math.round(analysisData.overallScore * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/upload"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Upload</span>
            </Link>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-3 bg-indigo-100 text-indigo-700 px-6 py-3 rounded-full text-sm font-medium mb-4">
              <Brain className="w-5 h-5" />
              <span>AI-Powered Text Analysis Complete</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Text Analysis Results
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive feedback on your written communication with actionable insights
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Results */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overall Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Overall Communication Score</h2>
                    <p className="text-indigo-100">AI-powered comprehensive evaluation</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold">{overallScore}%</div>
                  <div className="text-indigo-100 text-sm">
                    {overallScore >= 90 ? 'Excellent' : 
                     overallScore >= 80 ? 'Very Good' : 
                     overallScore >= 70 ? 'Good' : 
                     overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(analysisData.categories).map(([category, score]) => (
                  <div key={category} className="text-center">
                    <div className="text-2xl font-bold">{Math.round(score * 100)}%</div>
                    <div className="text-indigo-100 text-sm capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Category Breakdown</h3>
              <div className="space-y-6">
                {Object.entries(analysisData.categories).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {Math.round(score * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Strengths & Improvements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* Strengths */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900">Key Strengths</h3>
                </div>
                <div className="space-y-3">
                  {analysisData.strengths.map((strength, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-green-800">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Target className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-orange-900">Areas for Improvement</h3>
                </div>
                <div className="space-y-3">
                  {analysisData.improvements.map((improvement, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-orange-800">{improvement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* AI Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-indigo-50 rounded-2xl p-8 border border-indigo-200"
            >
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-indigo-900">AI Suggestions</h3>
                  <p className="text-indigo-700">Actionable recommendations to enhance your communication</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {analysisData.suggestions.map((suggestion, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 border-l-4 border-indigo-500">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-600 text-sm font-bold">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="text-indigo-900 font-medium">{suggestion}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Detailed Analysis */}
            {analysisData.detailedAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Analysis</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {Object.entries(analysisData.detailedAnalysis).map(([aspect, description]) => (
                    <div key={aspect} className="space-y-2">
                      <h4 className="font-semibold text-gray-700 capitalize">
                        {aspect.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <p className="text-gray-600">{description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Analysis Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Analysis Type</span>
                  <span className="font-semibold text-gray-900">Text Review</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Processing Time</span>
                  <span className="font-semibold text-gray-900">
                    {results.analysisCompletedAt && results.analysisStartedAt ? 
                      `${Math.round((new Date(results.analysisCompletedAt) - new Date(results.analysisStartedAt)) / 1000)}s` : 
                      'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">AI Model</span>
                  <span className="font-semibold text-gray-900">GPT-3.5 Turbo</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confidence</span>
                  <span className="font-semibold text-gray-900">High</span>
                </div>
              </div>
            </motion.div>

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Review the detailed feedback</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Implement AI suggestions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Practice with real-time analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span className="text-sm">Track your progress over time</span>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <Link
                to="/upload"
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl inline-flex items-center space-x-2 transform hover:scale-105"
              >
                <FileText className="w-5 h-5" />
                <span>Analyze More Text</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextAnalysisResults; 
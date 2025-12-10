import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Play,
  Pause,
  Download,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Volume2,
  TrendingUp,
  BarChart3,
  FileVideo,
  Zap,
  Target
} from 'lucide-react';

const VideoUploadPage = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setIsAnalyzing(true);
      // Simulate analysis
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisComplete(true);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                <FileVideo className="w-4 h-4 mr-2" />
                Video Analysis
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight"
            >
              Video Upload
              <span className="block text-green-300">
                Analyze your presentations
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Upload your recorded presentations and get comprehensive AI-powered analysis of your communication skills, body language, and speaking patterns.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="py-16 bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Upload Your Video</h2>
            <p className="text-gray-300">Get detailed analysis in minutes</p>
          </div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gray-700 rounded-lg p-8 mb-8"
          >
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-gray-500 rounded-lg p-12 text-center hover:border-green-400 transition-colors">
                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Drop your video here</h3>
                <p className="text-gray-400 mb-6">or click to browse files</p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg cursor-pointer transition-colors inline-flex items-center"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Video File
                </label>
                <p className="text-gray-500 text-sm mt-4">Supports MP4, MOV, AVI (Max 500MB)</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Video Preview */}
                <div className="aspect-video bg-gradient-to-br from-green-900 to-green-700 rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600/30 to-green-400/30"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-green-300 mx-auto mb-4" />
                      <p className="text-white text-lg font-medium">{uploadedFile.name}</p>
                      <p className="text-green-200 text-sm mt-2">
                        {(uploadedFile.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  
                  {/* Analysis Status */}
                  <div className="absolute top-4 right-4">
                    {isAnalyzing ? (
                      <div className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <Zap className="w-4 h-4 mr-1 animate-pulse" />
                        Analyzing...
                      </div>
                    ) : analysisComplete ? (
                      <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Analysis Progress */}
                {isAnalyzing && (
                  <div className="bg-gray-600 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">Analysis Progress</span>
                      <span className="text-gray-300">Processing...</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                        className="bg-green-500 h-2 rounded-full"
                      ></motion.div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Analysis Results */}
          {analysisComplete && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <h3 className="text-2xl font-bold text-white mb-6">Analysis Results</h3>
              
              {/* Overall Score */}
              <div className="bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-semibold text-white">Overall Performance</h4>
                  <span className="text-3xl font-bold text-green-400">87%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: '87%' }}></div>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Speech Metrics */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Speech Analysis</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300">Clarity</span>
                        <span className="text-green-400 font-medium">92%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300">Pace</span>
                        <span className="text-yellow-400 font-medium">Good</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300">Volume</span>
                        <span className="text-green-400 font-medium">Optimal</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Metrics */}
                <div className="bg-gray-700 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Visual Analysis</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300">Eye Contact</span>
                        <span className="text-green-400 font-medium">89%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300">Posture</span>
                        <span className="text-green-400 font-medium">Excellent</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300">Gestures</span>
                        <span className="text-blue-400 font-medium">Good</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Recommendations</h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Excellent eye contact and posture throughout the presentation</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                    <span className="text-gray-300">Clear and articulate speech with good volume control</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <span className="text-gray-300">Consider using more hand gestures to emphasize key points</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <span className="text-gray-300">Try pausing slightly longer between main topics for better flow</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Download Report
                </button>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Results
                </button>
                <button className="bg-gray-600 hover:bg-gray-500 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                  Upload Another Video
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Advanced Analysis Features</h2>
            <p className="text-gray-300">Comprehensive insights into your communication</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Detailed Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Detailed Metrics</h3>
              <p className="text-gray-300">
                Get comprehensive metrics on speech clarity, pace, volume, eye contact, posture, and more.
              </p>
            </motion.div>

            {/* Improvement Suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Improvement Suggestions</h3>
              <p className="text-gray-300">
                Receive personalized recommendations to enhance your communication skills and presentation style.
              </p>
            </motion.div>

            {/* Progress Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gray-800 rounded-lg p-6 text-center"
            >
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Progress Tracking</h3>
              <p className="text-gray-300">
                Track your improvement over time with detailed reports and performance comparisons.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to analyze your video?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Upload your presentation and get instant insights
          </p>
          <button className="bg-white hover:bg-gray-100 text-green-600 font-semibold px-8 py-4 rounded-lg transition-colors inline-flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Video Now
          </button>
        </div>
      </section>
    </div>
  );
};

export default VideoUploadPage;




import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Mic,
  Video,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Info,
  FileAudio,
  FileVideo,
  Target,
  Sparkles,
  Brain,
  BarChart3
} from 'lucide-react';
import api from '../config/api';

const ModernUploadPage = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('auto');
  const [uploadMode, setUploadMode] = useState('file');

  const uploadModes = [
    {
      id: 'file',
      title: 'Upload File',
      description: 'Upload audio or video files for AI analysis',
      icon: Upload,
      color: 'from-orange-500 to-pink-500',
      features: ['Audio files (MP3, WAV, M4A, AAC)', 'Video files (MP4, AVI, MOV, WEBM)', 'Max 500MB enterprise limit'],
      badge: 'Most Popular'
    },
    {
      id: 'realtime',
      title: 'Real-Time Analysis',
      description: 'Start live analysis session with microphone/camera',
      icon: Mic,
      color: 'from-orange-500 to-pink-500',
      features: ['Live speech analysis', 'Real-time feedback', 'Instant insights', 'Session recording'],
      badge: 'Live'
    }
  ];

  const analysisFeatures = [
    {
      title: 'Speech Analysis',
      description: 'Advanced speech recognition and analysis',
      icon: FileAudio,
      color: 'from-orange-500 to-pink-500'
    },
    {
      title: 'Video Analysis',
      description: 'Comprehensive video communication analysis',
      icon: FileVideo,
      color: 'from-orange-500 to-pink-500'
    }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    },
    maxFiles: 1,
    maxSize: 500 * 1024 * 1024 // 500MB
  });

  const handleFileUpload = async () => {
    if (!uploadedFile) {
      setError('Please select a file to upload');
      return;
    }

    // Validate file size
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (uploadedFile.size > maxSize) {
      setError(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    // Validate file type
    const isAudio = uploadedFile.type.startsWith('audio/');
    const isVideo = uploadedFile.type.startsWith('video/');
    if (!isAudio && !isVideo) {
      setError('Invalid file type. Please upload an audio or video file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('analysisType', analysisType);

      const response = await api.post('/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 300000, // 5 minutes timeout for large files
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      });

      if (response.data && response.data.success) {
        const analysisId = response.data.data?.analysisId;
        if (analysisId) {
          navigate(`/results/${analysisId}`);
        } else {
          setError('Upload successful but analysis ID not received');
        }
      } else {
        setError(response.data?.error || response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      // Handle specific error types
      if (error.response) {
        // Server responded with error
        const status = error.response.status;
        const message = error.response.data?.error || error.response.data?.message;
        
        if (status === 413) {
          setError('File too large. Maximum size is 500MB.');
        } else if (status === 400) {
          setError(message || 'Invalid file format. Please upload an audio or video file.');
        } else if (status === 500) {
          setError('Server error. Please try again later.');
        } else {
          setError(message || `Upload failed with status ${status}`);
        }
      } else if (error.request) {
        // Request made but no response
        setError('Network error. Please check your connection and try again.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Upload timeout. File may be too large. Please try a smaller file.');
      } else {
        setError(error.message || 'Upload failed. Please try again.');
      }
    } finally {
      setIsUploading(false);
      if (error) {
        setUploadProgress(0);
      }
    }
  };

  const handleRealtimeAnalysis = () => {
    navigate('/enhanced-realtime');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-white"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-orange-50 to-pink-50 text-orange-800 border border-orange-200">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered File Analysis
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-black mb-6 text-gray-900 leading-tight"
            >
              Analyze Your
              <span className="block bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Communication Files
              </span>
              with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            >
              Upload audio or video files to get detailed AI analysis of your communication patterns, 
              speech clarity, and presentation skills. Get actionable insights to improve your message delivery.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Upload Modes Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choose Your Analysis Method
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Select how you'd like to analyze your communication - upload existing files or start a live session.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {uploadModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  whileHover={{ scale: 1.02, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className={`relative p-8 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    uploadMode === mode.id
                      ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-pink-50 shadow-lg'
                      : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-md'
                  }`}
                  onClick={() => setUploadMode(mode.id)}
                >
                  {mode.badge && (
                    <span className="absolute -top-3 left-6 px-3 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-bold rounded-full">
                      {mode.badge}
                    </span>
                  )}
                  
                  <div className={`w-16 h-16 bg-gradient-to-r ${mode.color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{mode.title}</h3>
                  <p className="text-gray-600 mb-6">{mode.description}</p>
                  
                  <div className="space-y-2">
                    {mode.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Upload Area */}
          {uploadMode === 'file' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">Upload Your File</h3>
                
                {!uploadedFile ? (
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                      isDragActive
                      ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-pink-50'
                      : 'border-gray-300 hover:border-orange-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50'
                    }`}
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg font-medium text-white mb-2">
                      {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-sm text-gray-300">
                      or click to browse files (Audio: MP3, WAV, M4A, AAC | Video: MP4, AVI, MOV, WEBM)
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <File className="w-8 h-8 text-emerald-400" />
                        <div>
                          <p className="font-medium text-white">{uploadedFile.name}</p>
                          <p className="text-sm text-gray-300">
                            {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setUploadedFile(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {analysisFeatures.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                          <div key={index} className="p-4 bg-gray-100 rounded-xl">
                            <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-3`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <p className="text-sm font-medium">{feature.title}</p>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="w-full group px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-orange-500/25 hover:from-orange-600 hover:to-pink-600 transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Analyzing...'}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Brain className="w-5 h-5 mr-2" />
                          Start AI Analysis
                          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                        </div>
                      )}
                    </button>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Real-time Mode */}
          {uploadMode === 'realtime' && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-gray-700 rounded-2xl shadow-xl border border-gray-600 p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-12 h-12 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4">Start Real-Time Analysis</h3>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
                  Begin a live session where our AI analyzes your speech patterns, 
                  tone, and delivery in real-time. Get instant feedback and suggestions.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="flex items-center justify-center space-x-3 p-4 bg-gray-100 rounded-xl">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <span className="text-sm font-medium text-white">Real-time feedback</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 p-4 bg-gray-100 rounded-xl">
                    <Shield className="w-6 h-6 text-green-400" />
                    <span className="text-sm font-medium text-white">Secure & private</span>
                  </div>
                  <div className="flex items-center justify-center space-x-3 p-4 bg-gray-100 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-400" />
                    <span className="text-sm font-medium text-white">Instant insights</span>
                  </div>
                </div>

                <button
                  onClick={handleRealtimeAnalysis}
                  className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-orange-500/25 hover:from-orange-600 hover:to-pink-600 transform hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-center justify-center">
                    <Play className="w-5 h-5 mr-2" />
                    Start Live Analysis
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto mt-6"
            >
              <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Eloquent AI?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced AI technology meets user-friendly design for the ultimate communication analysis experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600">Get results in seconds, not minutes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enterprise Secure</h3>
              <p className="text-gray-600">Bank-level encryption and privacy</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Actionable Insights</h3>
              <p className="text-gray-600">Get specific recommendations to improve</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernUploadPage;

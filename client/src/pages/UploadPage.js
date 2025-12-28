import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Type
} from 'lucide-react';
import api from '../config/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('auto'); // auto, speech, video
  const [uploadMode, setUploadMode] = useState('file'); // file, text
  const [textContent, setTextContent] = useState('');

  const uploadModes = [
    {
      id: 'file',
      title: 'Upload File',
      description: 'Upload audio or video files for analysis',
      icon: Upload,
      color: 'from-blue-500 to-blue-600',
      features: ['Audio files (MP3, WAV, M4A)', 'Video files (MP4, AVI, MOV)', 'Max 100MB']
    },
    {
      id: 'text',
      title: 'Text Analysis',
      description: 'Analyze written content for communication insights',
      icon: Type,
      color: 'from-green-500 to-green-600',
      features: ['Speech scripts', 'Presentation content', 'Written communication']
    }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setError(null);
      
      // Auto-detect analysis type based on file type
      if (file.type.startsWith('audio/')) {
        setAnalysisType('speech');
      } else if (file.type.startsWith('video/')) {
        setAnalysisType('video');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.flac'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'],
      'text/*': ['.txt', '.doc', '.docx', '.pdf']
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024 // 100MB
  });

  const removeFile = () => {
    setUploadedFile(null);
    setError(null);
    setAnalysisType('auto');
  };



  const uploadFile = async () => {
    if (!uploadedFile && uploadMode === 'file') return;
    if (!textContent && uploadMode === 'text') return;

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      let response;
    
    if (uploadMode === 'file') {
        const formData = new FormData();
      formData.append('file', uploadedFile);
    formData.append('analysisType', analysisType);
    formData.append('uploadMode', uploadMode);

        response = await api.post('/api/upload', formData, {
        // Don't set Content-Type - let browser set it with boundary
        headers: {
          // Remove Content-Type to let axios/browser set it automatically with boundary
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        },
      });
      } else if (uploadMode === 'text') {
        // For text analysis, send directly to text endpoint
        console.log('Sending text upload request:', {
          textContent: textContent,
          analysisType: 'text'
        });
        
        response = await api.post('/api/upload/text', {
          textContent: textContent,
          analysisType: 'text'
        });
        
        console.log('Text upload response:', response.data);
      }

      if (response.data.success) {
        // Start analysis
        await startAnalysis(response.data.data.analysisId);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const startAnalysis = async (id) => {
    try {
      console.log('Starting analysis for ID:', id);
      const response = await api.post(`/api/analysis/${id}`);
      console.log('Analysis response:', response.data);
      
      if (response.data.success) {
        console.log('Analysis successful, navigating to results');
        // Navigate to appropriate results page based on upload mode
        if (uploadMode === 'text') {
          navigate(`/text-results/${id}`);
        } else {
          navigate(`/results/${id}`);
        }
      } else {
        console.log('Analysis response indicates failure:', response.data);
        setError(response.data.message || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      console.error('Analysis error:', err);
      console.error('Error response:', err.response?.data);
      setError('Analysis failed. Please try again.');
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('audio/')) {
      return <FileAudio className="w-8 h-8 text-blue-500" />;
    } else if (file.type.startsWith('video/')) {
      return <FileVideo className="w-8 h-8 text-orange-500" />;
    } else if (file.type.startsWith('text/')) {
      return <Type className="w-8 h-8 text-green-500" />;
    }
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const features = [
    {
      icon: Mic,
      title: 'Speech Analysis',
      description: 'Analyze clarity, pace, filler words, and pronunciation',
      color: 'from-blue-500 to-blue-600',
      features: ['Clarity Score', 'Speaking Pace', 'Filler Word Detection', 'Pronunciation Analysis']
    },
    {
      icon: Video,
      title: 'Video Analysis',
      description: 'Evaluate body language, eye contact, and presentation skills',
      color: 'from-orange-500 to-pink-500',
      features: ['Body Language', 'Eye Contact', 'Posture Analysis', 'Gesture Recognition']
    },
    {
      icon: Type,
      title: 'Text Analysis',
      description: 'Analyze written content for communication effectiveness',
      color: 'from-green-500 to-green-600',
      features: ['Content Structure', 'Tone Analysis', 'Readability Score', 'Engagement Metrics']
    },

  ];

  const supportedFormats = {
    audio: ['MP3', 'WAV', 'M4A', 'AAC', 'OGG', 'FLAC'],
    video: ['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'WebM', 'MKV', 'M4V'],
    text: ['TXT', 'DOC', 'DOCX', 'PDF']
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              {' '}Analysis Method
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Upload files, analyze text, or track your communication in real-time. 
            Get instant AI-powered feedback to improve your skills.
          </p>
        </motion.div>

        {/* Upload Mode Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select Analysis Method</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {uploadModes.map((mode) => {
              const Icon = mode.icon;
              return (
                <motion.div
                  key={mode.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 ${
                    uploadMode === mode.id
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => setUploadMode(mode.id)}
                >
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${mode.color} rounded-xl flex items-center justify-center mr-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mode.title}</h3>
                      <p className="text-sm text-gray-600">{mode.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {mode.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* File Upload Area */}
            {uploadMode === 'file' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 bg-white shadow-lg hover:shadow-xl ${
                    isDragActive
                      ? 'border-blue-500 bg-blue-50 scale-105'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="mb-6">
                    <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                      isDragActive ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Upload className={`w-10 h-10 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {isDragActive ? 'Drop your file here' : 'Upload your file'}
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">
                      {isDragActive
                        ? 'Release to upload'
                        : 'Drag & drop your file here, or click to browse'}
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold text-gray-900 mb-1">Audio Formats</div>
                      <div className="text-gray-600">{supportedFormats.audio.join(', ')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold text-gray-900 mb-1">Video Formats</div>
                      <div className="text-gray-600">{supportedFormats.video.join(', ')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="font-semibold text-gray-900 mb-1">Text Formats</div>
                      <div className="text-gray-600">{supportedFormats.text.join(', ')}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Secure upload</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Max 100MB</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Text Input Area */}
            {uploadMode === 'text' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl p-8 shadow-lg"
              >
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Type className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Text Analysis</h3>
                  <p className="text-lg text-gray-600 text-center mb-6">
                    Enter your text content for communication analysis
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content to Analyze
                    </label>
                    <textarea
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      placeholder="Enter your speech script, presentation content, or any written communication you'd like to analyze..."
                      className="w-full h-48 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{textContent.length} characters</span>
                    <span>Min 50 characters recommended</span>
                  </div>
                </div>
              </motion.div>
            )}



            {/* File Preview */}
            <AnimatePresence>
              {uploadedFile && uploadMode === 'file' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center">
                        {getFileIcon(uploadedFile)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {uploadedFile.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{formatFileSize(uploadedFile.size)}</span>
                          <span>•</span>
                          <span className="capitalize">{uploadedFile.type.split('/')[1]} file</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Analysis Type Selection */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3">Analysis Type</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'auto', label: 'Auto-Detect', icon: Zap },
                        { value: 'speech', label: 'Speech Only', icon: Mic },
                        { value: 'video', label: 'Video Only', icon: Video }
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <button
                            key={option.value}
                            onClick={() => setAnalysisType(option.value)}
                            className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                              analysisType === option.value
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                            }`}
                          >
                            <Icon className="w-5 h-5 mx-auto mb-2" />
                            <div className="text-sm font-medium">{option.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Progress */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border"
                >
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">Processing your content...</h3>
                      <p className="text-gray-500">
                        Uploading and preparing analysis
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Upload Progress</span>
                      <span className="font-medium text-gray-900">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-pink-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
                    <Info className="w-4 h-4" />
                    <span>Analysis will begin automatically after upload</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-50 border border-red-200 rounded-2xl p-6"
                >
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-800">Upload Error</h4>
                      <p className="text-red-700">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <button
                  onClick={uploadFile}
                  disabled={
                    (uploadMode === 'file' && !uploadedFile) ||
                    (uploadMode === 'text' && !textContent.trim()) ||
                    isUploading
                  }
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    ((uploadMode === 'file' && uploadedFile) || 
                     (uploadMode === 'text' && textContent.trim())) && !isUploading
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Play className="w-5 h-5" />
                      <span>Start Analysis</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </button>
              </motion.div>
          </div>

          {/* Features Sidebar */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-lg"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Get</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    className="p-4 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center`}>
                        {React.createElement(feature.icon, { className: "w-5 h-5 text-white" })}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {feature.features.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl p-6 text-white"
            >
              <h3 className="text-xl font-bold mb-4">Why Choose Eloquent AI?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">Lightning-fast analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-300" />
                  <span className="text-sm">100% secure & private</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-300" />
                  <span className="text-sm">95%+ accuracy rate</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-300" />
                  <span className="text-sm">Results in under 2 minutes</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage; 
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
  Sparkles,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  FileAudio,
  FileVideo,
  Brain
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import api from '../config/api';

const ConsumerUploadPage = () => {
  const navigate = useNavigate();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisType, setAnalysisType] = useState('auto');

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

    const maxSize = 500 * 1024 * 1024;
    if (uploadedFile.size > maxSize) {
      setError('File size exceeds 500MB limit. Please choose a smaller file.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('analysisType', analysisType);

      const response = await api.post('/api/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        const analysisId = response.data.analysisId || response.data.data?.analysisId || response.data.data?.id;
        if (analysisId) {
          navigate(`/results/${analysisId}`);
        } else {
          setError('Upload successful but analysis ID not received. Please try again.');
        }
      } else {
        setError(response.data.error || 'Upload failed. Please try again.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.error ||
        'Failed to upload file. Please check your connection and try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const fileType = uploadedFile?.type?.startsWith('video/') ? 'video' : 'audio';
  const fileSizeMB = uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-pink-50 rounded-full border border-orange-200 mb-6">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-gray-700">AI-Powered Analysis</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Upload Your{' '}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Recording
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get comprehensive AI analysis of your audio or video recordings. 
            Upload your file and receive detailed insights in minutes.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Upload Area */}
          {!uploadedFile ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                variant="elevated"
                className="p-12 border-2 border-dashed transition-all"
                hover={false}
              >
                <div
                  {...getRootProps()}
                  className={`text-center cursor-pointer transition-all ${
                      isDragActive
                        ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-pink-50'
                        : 'border-gray-300 hover:border-orange-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-24 h-24 bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-100">
                    <Upload className="w-12 h-12 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {isDragActive ? 'Drop your file here' : 'Drag & drop your file'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: MP3, WAV, M4A, AAC, MP4, AVI, MOV, WEBM (Max 500MB)
                  </p>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card variant="elevated" className="p-8">
                {/* File Info */}
                <div className="flex items-start space-x-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${
                    fileType === 'video' 
                      ? 'from-orange-500 to-pink-500' 
                      : 'from-blue-500 to-cyan-500'
                  } rounded-xl flex items-center justify-center flex-shrink-0`}>
                    {fileType === 'video' ? (
                      <FileVideo className="w-8 h-8 text-white" />
                    ) : (
                      <FileAudio className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">
                      {uploadedFile.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <File className="w-4 h-4" />
                        <span>{fileType.toUpperCase()}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{fileSizeMB} MB</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setError(null);
                      setUploadProgress(0);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Analysis Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Analysis Type
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { value: 'auto', label: 'Auto Detect', icon: Brain },
                      { value: 'audio', label: 'Audio Only', icon: Mic },
                      { value: 'video', label: 'Video Only', icon: Video }
                    ].map((type) => {
                      const Icon = type.icon;
                      const isSelected = analysisType === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setAnalysisType(type.value)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            isSelected
                              ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-pink-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon className={`w-6 h-6 mb-2 mx-auto ${
                            isSelected ? 'text-orange-600' : 'text-gray-400'
                          }`} />
                          <div className={`text-sm font-medium ${
                            isSelected ? 'text-orange-600' : 'text-gray-600'
                          }`}>
                            {type.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Progress Bar */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full"
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  onClick={handleFileUpload}
                  disabled={isUploading}
                  size="lg"
                  className="w-full"
                  icon={isUploading ? Loader2 : Sparkles}
                  iconPosition="left"
                >
                  {isUploading ? 'Analyzing...' : 'Start AI Analysis'}
                </Button>
              </Card>
            </motion.div>
          )}

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-12 grid md:grid-cols-3 gap-6"
          >
            {[
              {
                icon: Zap,
                title: 'Fast Analysis',
                description: 'Get results in minutes, not hours'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your files are encrypted and never shared'
              },
              {
                icon: Brain,
                title: 'AI-Powered',
                description: 'Advanced AI provides detailed insights'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-100">
                    <Icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ConsumerUploadPage;


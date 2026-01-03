import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWebSocketURL } from '../config/api';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Eye,
  Brain,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  Users,
  BarChart3,
  Clock,
  Award,
  Lightbulb,
  Camera,
  Headphones,
  Play,
  Pause,
  Square,
  Download,
  Share,
  Settings,
  HelpCircle,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

const CommunicationCoach = () => {
  // Core state
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [analysisType, setAnalysisType] = useState('comprehensive');
  const [liveMetrics, setLiveMetrics] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(null);
  const [recentFeedback, setRecentFeedback] = useState([]);
  const [processingInfo, setProcessingInfo] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Communication-specific metrics
  const [eyeContactScore, setEyeContactScore] = useState(0);
  const [postureScore, setPostureScore] = useState(0);
  const [smileScore, setSmileScore] = useState(0);
  const [gestureScore, setGestureScore] = useState(0);
  const [speechClarity, setSpeechClarity] = useState(0);
  const [speechRate, setSpeechRate] = useState(0);
  const [fillerWords, setFillerWords] = useState([]);
  const [overallScore, setOverallScore] = useState(0);

  // UI state
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [tips, setTips] = useState([]);

  // Refs
  const wsRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const videoStreamRef = useRef(null);
  const canvasRef = useRef(null);

  // Communication coaching tips
  const communicationTips = {
    eyeContact: [
      "Maintain eye contact for 3-5 seconds before looking away",
      "Look at the camera, not the screen, when speaking",
      "Use the 'triangle technique' - alternate between eyes and mouth",
      "Avoid staring - natural breaks are important"
    ],
    posture: [
      "Sit up straight with shoulders back",
      "Keep your head level and centered",
      "Avoid leaning too far forward or backward",
      "Keep both feet flat on the floor"
    ],
    smile: [
      "A genuine smile reaches your eyes",
      "Smile naturally - don't force it",
      "Use smiles to show engagement and warmth",
      "Match your smile to the conversation context"
    ],
    gestures: [
      "Use open hand gestures to emphasize points",
      "Avoid excessive hand movements",
      "Keep gestures within the camera frame",
      "Use gestures to support your words, not replace them"
    ],
    speech: [
      "Speak at 150-160 words per minute for clarity",
      "Pause between thoughts for better comprehension",
      "Vary your tone to maintain engagement",
      "Reduce filler words like 'um', 'uh', 'like'"
    ]
  };

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = getWebSocketURL('/ws');
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('🔌 Connected to WebSocket');
      setIsConnected(true);
      setError(null);
      
      // Start a new session
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      
      wsRef.current.send(JSON.stringify({
        type: 'start_session',
        sessionId: newSessionId,
        analysisType: analysisType,
        options: {
          enableVideoAnalysis: true,
          enableAudioAnalysis: true,
          enableRealTimeFeedback: true,
          communicationCoaching: true
        }
      }));
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      setIsConnected(false);
      setIsRecording(false);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('Connection error. Please refresh the page.');
    };
  }, [analysisType]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'session_started':
        setSessionStatus('active');
        console.log('✅ Session started:', data.sessionId);
        break;
        
      case 'analysis_result':
        updateMetrics(data.result);
        break;
        
      case 'live_feedback':
        addFeedback(data.feedback);
        break;
        
      case 'live_metrics':
        setLiveMetrics(data.metrics);
        break;
        
      case 'processing_status':
        setProcessingInfo(data.info);
        break;
        
      case 'error':
        setError(data.message);
        break;
        
      default:
        console.log('📨 Received message:', data);
    }
  }, []);

  // Update communication metrics
  const updateMetrics = useCallback((result) => {
    if (result.eyeContact !== undefined) setEyeContactScore(result.eyeContact);
    if (result.posture !== undefined) setPostureScore(result.posture);
    if (result.smile !== undefined) setSmileScore(result.smile);
    if (result.gestures !== undefined) setGestureScore(result.gestures);
    if (result.speechClarity !== undefined) setSpeechClarity(result.speechClarity);
    if (result.speechRate !== undefined) setSpeechRate(result.speechRate);
    if (result.fillerWords !== undefined) setFillerWords(result.fillerWords);
    
    // Calculate overall score
    const scores = [
      result.eyeContact || 0,
      result.posture || 0,
      result.smile || 0,
      result.gestures || 0,
      result.speechClarity || 0
    ].filter(score => score > 0);
    
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    setOverallScore(avgScore);
  }, []);

  // Add feedback to history
  const addFeedback = useCallback((feedback) => {
    const feedbackItem = {
      id: Date.now(),
      timestamp: new Date(),
      type: feedback.type,
      message: feedback.message,
      severity: feedback.severity || 'info',
      metric: feedback.metric,
      tip: communicationTips[feedback.metric]?.[0] || null
    };
    
    setRecentFeedback(prev => [feedbackItem, ...prev.slice(0, 9)]);
    setFeedbackHistory(prev => [feedbackItem, ...prev.slice(0, 49)]);
  }, []);

  // Start/stop recording
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      
      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: 'stop_recording',
          sessionId: sessionId
        }));
      }
      
      setIsRecording(false);
    } else {
      // Start recording
      try {
        setIsLoading(true);
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true
        });
        
        audioStreamRef.current = stream;
        
        // Start media recorder
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (wsRef.current && event.data.size > 0) {
            wsRef.current.send(event.data);
          }
        };
        
        mediaRecorderRef.current.start(100); // Send data every 100ms
        
        // Start frame analysis
        startFrameAnalysis(stream);
        
        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: 'start_recording',
            sessionId: sessionId,
            analysisType: analysisType
          }));
        }
        
        setIsRecording(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error starting recording:', error);
        setError('Failed to access camera/microphone. Please check permissions.');
        setIsLoading(false);
      }
    }
  }, [isRecording, sessionId, analysisType]);

  // Start frame analysis for visual metrics
  const startFrameAnalysis = useCallback((stream) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();
    
    const analyzeFrame = () => {
      if (isRecording && video.videoWidth > 0) {
        // Simulate analysis - in real implementation, this would use MediaPipe
        const mockAnalysis = {
          eyeContact: Math.random() * 40 + 60, // 60-100
          posture: Math.random() * 30 + 70,   // 70-100
          smile: Math.random() * 50 + 30,     // 30-80
          gestures: Math.random() * 35 + 65   // 65-100
        };
        
        updateMetrics(mockAnalysis);
        
        // Add some feedback
        if (Math.random() > 0.7) {
          const metrics = ['eyeContact', 'posture', 'smile', 'gestures'];
          const metric = metrics[Math.floor(Math.random() * metrics.length)];
          const score = mockAnalysis[metric];
          
          let message, severity;
          if (score < 50) {
            severity = 'warning';
            message = `${metric} needs improvement (${Math.round(score)}%)`;
          } else if (score > 80) {
            severity = 'success';
            message = `Great ${metric}! (${Math.round(score)}%)`;
          }
          
          if (message) {
            addFeedback({
              type: 'metric_update',
              message,
              severity,
              metric
            });
          }
        }
      }
      
      if (isRecording) {
        requestAnimationFrame(analyzeFrame);
      }
    };
    
    video.onloadedmetadata = () => {
      analyzeFrame();
    };
  }, [isRecording, updateMetrics, addFeedback]);

  // Initialize connection
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [connectWebSocket]);

  // Generate tips based on current metrics
  useEffect(() => {
    const newTips = [];
    
    if (eyeContactScore < 60) {
      newTips.push({ type: 'eyeContact', message: communicationTips.eyeContact[0] });
    }
    if (postureScore < 70) {
      newTips.push({ type: 'posture', message: communicationTips.posture[0] });
    }
    if (smileScore < 40) {
      newTips.push({ type: 'smile', message: communicationTips.smile[0] });
    }
    if (gestureScore < 70) {
      newTips.push({ type: 'gestures', message: communicationTips.gestures[0] });
    }
    if (speechRate < 120 || speechRate > 180) {
      newTips.push({ type: 'speech', message: communicationTips.speech[0] });
    }
    
    setTips(newTips.slice(0, 3)); // Show max 3 tips
  }, [eyeContactScore, postureScore, smileScore, gestureScore, speechRate]);

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎯 AI Communication Coach
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Real-time feedback on eye contact, posture, gestures, and speech patterns
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Analysis Area */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              {/* Video Preview */}
              <div className="aspect-video bg-gray-100 rounded-xl mb-6 flex items-center justify-center">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {isRecording ? 'Live Analysis Active' : 'Camera Preview'}
                  </p>
                  <div className={`mt-4 w-4 h-4 rounded-full mx-auto ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={toggleRecording}
                  disabled={isLoading}
                  className={`px-8 py-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : isRecording ? (
                    <>
                      <Square className="w-5 h-5" />
                      <span>Stop Analysis</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start Analysis</span>
                    </>
                  )}
                </button>
              </div>

              {/* Connection Status */}
              <div className="mt-4 flex items-center justify-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </motion.div>

            {/* Live Metrics */}
            {isRecording && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white rounded-2xl shadow-xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Live Communication Metrics
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-xl ${getScoreBgColor(eyeContactScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Eye className="w-5 h-5 text-gray-600" />
                      <span className={`text-sm font-bold ${getScoreColor(eyeContactScore)}`}>
                        {Math.round(eyeContactScore)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Eye Contact</p>
                  </div>
                  
                  <div className={`p-4 rounded-xl ${getScoreBgColor(postureScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-gray-600" />
                      <span className={`text-sm font-bold ${getScoreColor(postureScore)}`}>
                        {Math.round(postureScore)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Posture</p>
                  </div>
                  
                  <div className={`p-4 rounded-xl ${getScoreBgColor(smileScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Heart className="w-5 h-5 text-gray-600" />
                      <span className={`text-sm font-bold ${getScoreColor(smileScore)}`}>
                        {Math.round(smileScore)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Expression</p>
                  </div>
                  
                  <div className={`p-4 rounded-xl ${getScoreBgColor(gestureScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-5 h-5 text-gray-600" />
                      <span className={`text-sm font-bold ${getScoreColor(gestureScore)}`}>
                        {Math.round(gestureScore)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">Gestures</p>
                  </div>
                </div>

                {/* Overall Score */}
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Overall Communication Score</h4>
                      <p className="text-sm text-gray-600">Based on all metrics</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                        {Math.round(overallScore)}%
                      </div>
                      <div className="flex items-center mt-1">
                        {overallScore >= 80 ? (
                          <ThumbsUp className="w-4 h-4 text-green-500" />
                        ) : overallScore >= 60 ? (
                          <div className="w-4 h-4 text-yellow-500">⚠️</div>
                        ) : (
                          <ThumbsDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className="ml-1 text-xs text-gray-600">
                          {overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Coaching Tips
              </h3>
              
              <AnimatePresence>
                {tips.map((tip, index) => (
                  <motion.div
                    key={tip.type}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-blue-50 rounded-lg mb-3"
                  >
                    <p className="text-sm text-gray-700">{tip.message}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {tips.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Keep up the great work! 🎉
                </p>
              )}
            </motion.div>

            {/* Recent Feedback */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Recent Feedback
              </h3>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <AnimatePresence>
                  {recentFeedback.map((feedback) => (
                    <motion.div
                      key={feedback.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-3 rounded-lg ${
                        feedback.severity === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
                        feedback.severity === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                        'bg-blue-50 border-l-4 border-blue-500'
                      }`}
                    >
                      <p className="text-sm text-gray-700">{feedback.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {feedback.timestamp.toLocaleTimeString()}
                      </p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {recentFeedback.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Start analysis to receive feedback
                  </p>
                )}
              </div>
            </motion.div>

            {/* Session Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Session Info
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium ${
                    sessionStatus === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {sessionStatus || 'Inactive'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Analysis:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analysisType === 'comprehensive' ? 'Full Analysis' : analysisType}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Feedback:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {recentFeedback.length} items
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4"
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CommunicationCoach;


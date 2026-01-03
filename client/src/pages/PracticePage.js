import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Video, VideoOff, Mic, MicOff, Play, Square, 
  Eye, Smile, Hand, Volume2, Clock, Brain,
  TrendingUp, AlertCircle, CheckCircle, Sparkles,
  RotateCcw, Download, ChevronRight
} from 'lucide-react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from '@mediapipe/tasks-vision';
import { getWebSocketURL } from '../config/api';

const PracticePage = () => {
  // Session state
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  
  // Camera state
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  
  // Metrics state - ALL IN ONE PLACE
  const [metrics, setMetrics] = useState({
    eyeContact: 0,
    posture: 0,
    gestures: 0,
    emotion: 0,
    clarity: 0,
    pace: 120,
    volume: 0,
    overall: 0
  });
  
  // AI Feedback
  const [currentFeedback, setCurrentFeedback] = useState('');
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [transcription, setTranscription] = useState('');
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);
  
  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    const ws = new WebSocket(getWebSocketURL('/ws'));
    
    ws.onopen = () => {
      console.log('✅ Connected to analysis server');
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'start_session' }));
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleServerMessage(data);
      } catch (e) {
        console.error('Error parsing message:', e);
      }
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      // Reconnect after 2 seconds
      setTimeout(() => {
        if (isSessionActive) connectWebSocket();
      }, 2000);
    };
    
    ws.onerror = () => setIsConnected(false);
    wsRef.current = ws;
  }, [isSessionActive]);
  
  const handleServerMessage = (data) => {
    switch (data.type) {
      case 'analysis_result':
        if (data.result?.scores) {
          setMetrics(prev => ({
            ...prev,
            eyeContact: Math.round((data.result.scores.eye_contact || 0) * 100),
            posture: Math.round((data.result.scores.posture || 0) * 100),
            gestures: Math.round((data.result.scores.gesture || 0) * 100),
            emotion: Math.round((data.result.scores.emotion || 0) * 100),
            overall: Math.round((data.result.scores.overall || 0) * 100)
          }));
        }
        break;
        
      case 'speech_metrics':
        if (data.metrics) {
          setMetrics(prev => ({
            ...prev,
            clarity: data.metrics.clarity || prev.clarity,
            pace: data.metrics.pace || prev.pace,
            volume: data.metrics.volume || prev.volume
          }));
        }
        break;
        
      case 'feedback':
        if (data.feedback) {
          setCurrentFeedback(data.feedback);
          setFeedbackHistory(prev => [
            { text: data.feedback, time: new Date().toLocaleTimeString() },
            ...prev.slice(0, 4)
          ]);
        }
        break;
        
      case 'transcription':
        if (data.text) {
          setTranscription(prev => prev + ' ' + data.text);
        }
        break;
        
      default:
        break;
    }
  };
  
  // Initialize MediaPipe
  const initializePoseLandmarker = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      
      poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });
      
      console.log('✅ MediaPipe initialized');
    } catch (error) {
      console.error('MediaPipe initialization error:', error);
    }
  };
  
  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: micEnabled
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraEnabled(true);
      }
    } catch (error) {
      console.error('Camera error:', error);
      alert('Could not access camera. Please check permissions.');
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraEnabled(false);
  };
  
  // Pose detection loop
  const detectPose = useCallback(async () => {
    if (!poseLandmarkerRef.current || !videoRef.current || !isSessionActive) return;
    
    const video = videoRef.current;
    if (video.readyState < 2) {
      animationFrameRef.current = requestAnimationFrame(detectPose);
      return;
    }
    
    try {
      const timestamp = performance.now();
      const results = poseLandmarkerRef.current.detectForVideo(video, timestamp);
      
      // Draw landmarks on canvas
      if (canvasRef.current && results.landmarks?.length > 0) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const drawingUtils = new DrawingUtils(ctx);
        for (const landmark of results.landmarks) {
          drawingUtils.drawLandmarks(landmark, {
            radius: 3,
            color: '#f97316',
            fillColor: '#fb923c'
          });
          drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, {
            color: '#fdba74',
            lineWidth: 2
          });
        }
      }
      
      // Send landmarks to server
      if (wsRef.current?.readyState === WebSocket.OPEN && results.landmarks?.length > 0) {
        wsRef.current.send(JSON.stringify({
          type: 'video_data',
          landmarks: results.landmarks[0].map(l => ({
            x: l.x, y: l.y, z: l.z, visibility: l.visibility
          })),
          width: video.videoWidth,
          height: video.videoHeight,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Pose detection error:', error);
    }
    
    animationFrameRef.current = requestAnimationFrame(detectPose);
  }, [isSessionActive]);
  
  // Start session
  const startSession = async () => {
    setIsSessionActive(true);
    setSessionDuration(0);
    setTranscription('');
    setFeedbackHistory([]);
    
    await initializePoseLandmarker();
    await startCamera();
    connectWebSocket();
    
    // Start timer
    sessionTimerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
  };
  
  // Stop session
  const stopSession = () => {
    setIsSessionActive(false);
    
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'stop_session' }));
      wsRef.current.close();
    }
    
    stopCamera();
  };
  
  // Start detection when session starts
  useEffect(() => {
    if (isSessionActive && cameraEnabled) {
      detectPose();
    }
  }, [isSessionActive, cameraEnabled, detectPose]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);
  
  // Request AI feedback periodically
  useEffect(() => {
    if (!isSessionActive || !wsRef.current) return;
    
    const feedbackInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'request_feedback' }));
      }
    }, 5000);
    
    return () => clearInterval(feedbackInterval);
  }, [isSessionActive]);
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getScoreColor = (score) => {
    if (score >= 70) return 'score-excellent';
    if (score >= 50) return 'score-good';
    if (score >= 30) return 'score-fair';
    return 'score-poor';
  };
  
  const getScoreBg = (score) => {
    if (score >= 70) return 'score-bar-excellent';
    if (score >= 50) return 'score-bar-good';
    if (score >= 30) return 'score-bar-fair';
    return 'score-bar-poor';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Practice Session</h1>
            <p className="text-slate-400">Real-time AI coaching for your communication skills</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
              isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
            
            {/* Timer */}
            {isSessionActive && (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 rounded-lg text-white">
                <Clock className="w-4 h-4" />
                {formatTime(sessionDuration)}
              </div>
            )}
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Video Panel - Left */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Video Container */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-slate-800 rounded-2xl overflow-hidden aspect-video"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onLoadedMetadata={() => {
                  if (canvasRef.current && videoRef.current) {
                    canvasRef.current.width = videoRef.current.videoWidth;
                    canvasRef.current.height = videoRef.current.videoHeight;
                  }
                }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              
              {/* Overlay when not active */}
              {!isSessionActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80">
                  <Sparkles className="w-16 h-16 text-orange-400 mb-4" />
                  <h2 className="text-2xl font-bold text-white mb-2">Ready to Practice?</h2>
                  <p className="text-slate-400 mb-6">Click Start to begin your AI-powered practice session</p>
                  <button
                    onClick={startSession}
                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-pink-600 transition-all transform hover:scale-105"
                  >
                    <Play className="w-5 h-5" />
                    Start Practice
                  </button>
                </div>
              )}
              
              {/* Controls */}
              {isSessionActive && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                  <button
                    onClick={() => setCameraEnabled(!cameraEnabled)}
                    className={`p-3 rounded-full ${cameraEnabled ? 'bg-slate-700' : 'bg-red-500'} text-white`}
                  >
                    {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={() => setMicEnabled(!micEnabled)}
                    className={`p-3 rounded-full ${micEnabled ? 'bg-slate-700' : 'bg-red-500'} text-white`}
                  >
                    {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={stopSession}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                    End Session
                  </button>
                </div>
              )}
            </motion.div>
            
            {/* AI Feedback Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Brain className="w-5 h-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">AI Coach</h3>
              </div>
              
              {currentFeedback ? (
                <p className="text-lg text-white">{currentFeedback}</p>
              ) : (
                <p className="text-slate-400">
                  {isSessionActive 
                    ? "Analyzing your presentation... Feedback will appear here."
                    : "Start a session to receive real-time AI coaching."}
                </p>
              )}
              
              {/* Recent Feedback History */}
              {feedbackHistory.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Recent feedback:</p>
                  <div className="space-y-2">
                    {feedbackHistory.slice(1, 3).map((fb, i) => (
                      <div key={i} className="text-sm text-slate-500">
                        <span className="text-slate-600">{fb.time}:</span> {fb.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
            
            {/* Transcription */}
            {transcription && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-800 rounded-2xl p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Mic className="w-5 h-5 text-orange-400" />
                  Live Transcription
                </h3>
                <p className="text-slate-300 leading-relaxed">{transcription}</p>
              </motion.div>
            )}
          </div>
          
          {/* Metrics Panel - Right */}
          <div className="space-y-6">
            
            {/* Overall Score */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Overall Score</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="64" cy="64" r="56"
                      fill="none"
                      stroke="#334155"
                      strokeWidth="12"
                    />
                    <circle
                      cx="64" cy="64" r="56"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="12"
                      strokeDasharray={`${metrics.overall * 3.52} 352`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">{metrics.overall}%</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Video Metrics */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-orange-400" />
                Visual Analysis
              </h3>
              
              <div className="space-y-4">
                {/* Eye Contact */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Eye Contact
                    </span>
                    <span className={`font-semibold ${getScoreColor(metrics.eyeContact)}`}>
                      {metrics.eyeContact}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreBg(metrics.eyeContact)} transition-all duration-500`}
                      style={{ width: `${metrics.eyeContact}%` }}
                    />
                  </div>
                </div>
                
                {/* Posture */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Posture
                    </span>
                    <span className={`font-semibold ${getScoreColor(metrics.posture)}`}>
                      {metrics.posture}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreBg(metrics.posture)} transition-all duration-500`}
                      style={{ width: `${metrics.posture}%` }}
                    />
                  </div>
                </div>
                
                {/* Gestures */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Hand className="w-4 h-4" /> Gestures
                    </span>
                    <span className={`font-semibold ${getScoreColor(metrics.gestures)}`}>
                      {metrics.gestures}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreBg(metrics.gestures)} transition-all duration-500`}
                      style={{ width: `${metrics.gestures}%` }}
                    />
                  </div>
                </div>
                
                {/* Emotion */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Smile className="w-4 h-4" /> Expression
                    </span>
                    <span className={`font-semibold ${getScoreColor(metrics.emotion)}`}>
                      {metrics.emotion}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreBg(metrics.emotion)} transition-all duration-500`}
                      style={{ width: `${metrics.emotion}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Audio Metrics */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-orange-400" />
                Voice Analysis
              </h3>
              
              <div className="space-y-4">
                {/* Clarity */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">Clarity</span>
                    <span className={`font-semibold ${getScoreColor(metrics.clarity)}`}>
                      {metrics.clarity}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreBg(metrics.clarity)} transition-all duration-500`}
                      style={{ width: `${metrics.clarity}%` }}
                    />
                  </div>
                </div>
                
                {/* Pace */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400">Pace</span>
                    <span className="font-semibold text-white">{metrics.pace} WPM</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {metrics.pace < 120 ? 'Speaking slowly' : 
                     metrics.pace > 160 ? 'Speaking quickly' : 'Good pace'}
                  </div>
                </div>
                
                {/* Volume */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-400 flex items-center gap-2">
                      <Volume2 className="w-4 h-4" /> Volume
                    </span>
                    <span className={`font-semibold ${getScoreColor(metrics.volume)}`}>
                      {metrics.volume}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getScoreBg(metrics.volume)} transition-all duration-500`}
                      style={{ width: `${metrics.volume}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Quick Tips */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-800 rounded-2xl p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Quick Tips</h3>
              <div className="space-y-3">
                {metrics.eyeContact < 50 && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">Look directly at the camera to improve eye contact</p>
                  </div>
                )}
                {metrics.posture < 50 && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">Sit up straight and keep your shoulders back</p>
                  </div>
                )}
                {metrics.volume < 40 && (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">Speak louder and project your voice</p>
                  </div>
                )}
                {metrics.overall >= 70 && (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">Great job! Keep up the good work</p>
                  </div>
                )}
                {!isSessionActive && (
                  <p className="text-sm text-slate-500">Tips will appear during your session</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticePage;


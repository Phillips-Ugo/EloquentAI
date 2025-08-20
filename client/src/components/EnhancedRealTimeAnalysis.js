import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  Square,
  Eye,
  Target,
  Award,
  Hand,
  Smile,
  Wifi,
  WifiOff,
  Brain
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const EnhancedRealTimeAnalysis = () => {
  // Core state only - no notifications
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stream, setStream] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [sessionTime, setSessionTime] = useState(0);
  const [frameCount, setFrameCount] = useState(0);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [serverStatus, setServerStatus] = useState({});
  const [confidence, setConfidence] = useState(0.0);
  
  // Scores state
  const [scores, setScores] = useState({
    posture: 0.75,
    eyeContact: 0.70,
    gestures: 0.65,
    emotion: 0.70,
    overall: 0.70
  });

  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const websocketRef = useRef(null);
  const timeIntervalRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket('ws://localhost:8765');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Request server status
        ws.send(JSON.stringify({
          type: 'get_status'
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt reconnection after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = setTimeout(() => {
          if (!isConnected) {
            connectWebSocket();
          }
        }, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        setConnectionStatus('error');
      };
      
      websocketRef.current = ws;
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [isConnected]);

  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'session_started':
        setSessionId(data.session_id);
        setClientId(data.client_id);
        setIsAnalyzing(true);
        setServerStatus(data.server_status || {});
        break;
        
      case 'analysis_result':
        handleAnalysisResult(data.result);
        break;
        
      case 'session_summary':
        setIsAnalyzing(false);
        setIsRecording(false);
        break;
        
      case 'status_response':
        setServerStatus(data.server_status || {});
        break;
        
      case 'error':
        console.error('Server error:', data.message);
        // Error handled silently for MVP
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);

  const handleAnalysisResult = useCallback((result) => {
    // Update scores
    setScores(prevScores => ({
      posture: result.scores.posture,
      eyeContact: result.scores.eye_contact,
      gestures: result.scores.gesture,
      emotion: result.scores.emotion,
      overall: result.scores.overall
    }));

    // Update confidence
    if (result.confidence !== undefined) {
      setConfidence(result.confidence);
    }
  }, []);

  // Camera and microphone setup
  const startCamera = async () => {
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user'
        }
      });

      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      setStream(videoStream);
      setAudioStream(audioStream);
      streamRef.current = videoStream;

      if (videoRef.current) {
        videoRef.current.srcObject = videoStream;
        videoRef.current.setAttribute('playsinline', true);
        videoRef.current.setAttribute('autoplay', true);
        videoRef.current.setAttribute('muted', true);
      }

      setIsStreamActive(true);
      console.log('Camera and microphone started');
    } catch (error) {
      console.error('Error starting camera/microphone:', error);
      // Error handled silently for MVP
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      setStream(null);
      setAudioStream(null);
      streamRef.current = null;
    }
    setIsStreamActive(false);
  };

  // Session management
  const startAnalysis = async () => {
    if (!isConnected) {
      console.warn('Not connected to analysis server');
      return;
    }

    if (!isStreamActive) {
      await startCamera();
    }

    // Start session
    websocketRef.current.send(JSON.stringify({
      type: 'start_session',
      session_id: `session_${Date.now()}`
    }));

    setIsRecording(true);
    setSessionTime(0);
    setFrameCount(0);

    // Start timers
    timeIntervalRef.current = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Start frame capture
    startFrameCapture();
    startAudioCapture();
  };

  const stopAnalysis = () => {
    if (websocketRef.current && isConnected) {
      websocketRef.current.send(JSON.stringify({
        type: 'stop_session'
      }));
    }

    setIsRecording(false);
    setIsAnalyzing(false);

    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
    }
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
    }
  };

  // Frame capture
  const startFrameCapture = () => {
    frameIntervalRef.current = setInterval(() => {
      if (videoRef.current && isRecording && isConnected) {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        
        context.drawImage(videoRef.current, 0, 0);
        
        // Convert to base64 with compression
        const frameData = canvas.toDataURL('image/jpeg', 0.7);
        const base64Data = frameData.split(',')[1];
        
        // Send frame to server
        websocketRef.current.send(JSON.stringify({
          type: 'video_frame',
          frame: base64Data,
          timestamp: Date.now()
        }));
        
        setFrameCount(prev => prev + 1);
      }
    }, 150);
  };

  // Audio capture
  const startAudioCapture = () => {
    if (!audioStream) return;

    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioContextRef.current.createMediaStreamSource(audioStream);
    const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (event) => {
      if (isRecording && isConnected) {
        const audioData = event.inputBuffer.getChannelData(0);
        
        // Apply basic noise reduction
        const processedAudio = audioData.map(sample => {
          return Math.abs(sample) > 0.01 ? sample : 0;
        });
        
        const base64Audio = btoa(String.fromCharCode(...new Uint8Array(processedAudio.buffer)));
        
        websocketRef.current.send(JSON.stringify({
          type: 'audio_chunk',
          audio: base64Audio,
          timestamp: Date.now()
        }));
      }
    };

    source.connect(processor);
    processor.connect(audioContextRef.current.destination);
  };

  // Utility functions
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
    return Math.round(score * 10);
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-emerald-500" />;
      case 'connecting':
        return <Wifi className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-500" />;
    }
  };

  // Effects
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      stopCamera();
    };
  }, [connectWebSocket]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
      if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              AI Communication Analysis MVP
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time analysis for your presentation skills
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              connectionStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' :
              connectionStatus === 'connecting' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {getConnectionIcon()}
              <span className="text-sm font-medium">
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </span>
            </div>
            
            {/* Server Status */}
            {serverStatus.analyzer_available && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg">
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">AI Ready</span>
              </div>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            >
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full rounded-xl bg-gray-900"
                  style={{ minHeight: '400px' }}
                />
                
                {/* Overlay Controls */}
                <div className="absolute top-4 left-4 flex space-x-2">
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    isStreamActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {isStreamActive ? 'Camera Active' : 'Camera Off'}
                  </div>
                  
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    isRecording ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isRecording ? 'Recording' : 'Stopped'}
                  </div>
                </div>
                
                {/* Session Timer */}
                {isRecording && (
                  <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm font-medium">
                    {formatTime(sessionTime)}
                  </div>
                )}
              </div>
              
              {/* Control Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                {!isRecording ? (
                  <button
                    onClick={startAnalysis}
                    disabled={!isConnected}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="w-5 h-5" />
                    <span>Start Analysis</span>
                  </button>
                ) : (
                  <button
                    onClick={stopAnalysis}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    <Square className="w-5 h-5" />
                    <span>Stop Analysis</span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Live Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Live Performance Scores</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: 'posture', label: 'Posture', icon: Award },
                  { key: 'eyeContact', label: 'Eye Contact', icon: Eye },
                  { key: 'gestures', label: 'Gestures', icon: Hand },
                  { key: 'emotion', label: 'Emotion', icon: Smile }
                ].map((metric, index) => (
                  <motion.div
                    key={metric.key}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`p-4 rounded-xl border-2 ${getScoreBgColor(scores[metric.key])} transition-all duration-300 hover:scale-105`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <metric.icon className={`w-5 h-5 ${getScoreColor(scores[metric.key])}`} />
                      <span className="text-sm font-medium text-gray-700">{metric.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${getScoreColor(scores[metric.key])}`}>
                      {formatScore(scores[metric.key])}/10
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${scores[metric.key] * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(scores[metric.key])}`}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Overall Score */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-blue-600" />
                    <span className="text-lg font-semibold text-gray-900">Overall Score</span>
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>
                    {formatScore(scores.overall)}/10
                  </div>
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores.overall * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-3 rounded-full bg-gradient-to-r ${getScoreGradient(scores.overall)}`}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Session Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Session Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">{formatTime(sessionTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Frames Analyzed</span>
                  <span className="font-semibold text-gray-900">{frameCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    isAnalyzing ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {isAnalyzing ? 'Analyzing' : 'Idle'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confidence</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hidden canvas for frame capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default EnhancedRealTimeAnalysis; 
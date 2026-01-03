import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWebSocketURL } from '../config/api';

const RealTimeVideoAnalysis = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [error, setError] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const websocketRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const frameCountRef = useRef(0);
  const lastAnalysisTimeRef = useRef(0);
  
  // WebSocket connection management
  const connectWebSocket = useCallback(() => {
    // Don't connect if already connected
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }
    
    // Close existing connection if any
    if (websocketRef.current) {
      websocketRef.current.close();
    }
    
    try {
      console.log('Connecting to WebSocket...');
      const ws = new WebSocket(getWebSocketURL('/ws'));
      
      ws.onopen = () => {
        console.log('WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      ws.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Only attempt to reconnect if not intentionally closed and not recording
        if (event.code !== 1000 && !isRecording) {
          setError('Connection lost. Attempting to reconnect...');
          setTimeout(() => {
            connectWebSocket();
          }, 3000);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Please check if the server is running.');
      };
      
      websocketRef.current = ws;
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setError('Failed to connect to analysis server.');
    }
  }, [isRecording]);
  
  // Handle incoming WebSocket messages
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'connection_established':
        setClientId(data.client_id);
        setSessionId(data.session_id);
        console.log('Session established:', data);
        break;
        
      case 'analysis_result':
        setAnalysisResults(data);
        updateFeedbackHistory(data);
        break;
        
      case 'session_started':
        console.log('Session started:', data);
        break;
        
      case 'session_ended':
        console.log('Session ended:', data);
        handleSessionEnd(data.summary);
        break;
        
      case 'error':
        console.error('Server error:', data.message);
        setError(data.message);
        break;
        
      case 'pong':
        // Connection health check response
        break;
        
      default:
        console.log('Unknown message type:', data.type);
    }
  }, []);
  
  // Update feedback history
  const updateFeedbackHistory = useCallback((result) => {
    if (result.feedback && result.feedback.length > 0) {
      setFeedbackHistory(prev => [
        {
          timestamp: result.timestamp || Date.now(),
          feedback: result.feedback,
          scores: result.scores
        },
        ...prev.slice(0, 9) // Keep last 10 feedback items
      ]);
    }
  }, []);
  
  // Handle session end
  const handleSessionEnd = useCallback((summary) => {
    console.log('Session summary:', summary);
    // You can display the summary in a modal or new component
  }, []);
  
  // Start video recording and analysis
  const startRecording = async () => {
    try {
      setError(null);
      console.log('Starting recording...');
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false // Disable audio for now
      });
      
      console.log('Camera stream obtained');
      streamRef.current = stream;
      
      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video loading timeout'));
          }, 10000); // 10 second timeout
          
          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            console.log('Video metadata loaded');
            resolve();
          };
          
          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Video loading failed'));
          };
        });
        
        await videoRef.current.play();
        console.log('Video started playing');
      }
      
      // Start session
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({
          type: 'start_session',
          config: {
            video_quality: '720p',
            analysis_interval: 1.0,
            enable_audio: false
          }
        }));
        console.log('Session start message sent');
      } else {
        console.error('WebSocket not connected');
        setError('WebSocket connection not available');
        return;
      }
      
      setIsRecording(true);
      sessionStartTimeRef.current = Date.now();
      frameCountRef.current = 0;
      lastAnalysisTimeRef.current = 0;
      
      console.log('Starting frame capture...');
      // Start frame capture loop
      captureFrames();
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError(`Failed to access camera: ${err.message}`);
      
      // Clean up on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    try {
      // Stop frame capture
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Stop video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // End session
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({
          type: 'end_session'
        }));
      }
      
      setIsRecording(false);
      setSessionDuration(0);
      
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };
  
  // Capture and send video frames
  const captureFrames = useCallback(() => {
    // Check if we have all required components
    if (!videoRef.current || !canvasRef.current || !websocketRef.current) {
      console.log('Missing required components for frame capture');
      return;
    }
    
    // Check if video is ready
    if (videoRef.current.readyState !== 4) { // HAVE_ENOUGH_DATA
      console.log('Video not ready, retrying...');
      animationFrameRef.current = requestAnimationFrame(captureFrames);
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to base64
    const frameData = canvas.toDataURL('image/jpeg', 0.8);
    const base64Data = frameData.split(',')[1];
    
    // Send frame data (limit to 1 frame per second for performance)
    const now = Date.now();
    if (now - lastAnalysisTimeRef.current >= 1000) {
      try {
        websocketRef.current.send(JSON.stringify({
          type: 'frame_data',
          frame: base64Data,
          timestamp: now
        }));
        
        lastAnalysisTimeRef.current = now;
        frameCountRef.current++;
        console.log(`Frame ${frameCountRef.current} sent`);
      } catch (error) {
        console.error('Error sending frame:', error);
      }
    }
    
    // Always continue capturing as long as we have a video stream
    if (streamRef.current && streamRef.current.active) {
      animationFrameRef.current = requestAnimationFrame(captureFrames);
    } else {
      console.log('Video stream no longer active, stopping frame capture');
    }
  }, []);
  
  // Update session duration
  useEffect(() => {
    let interval;
    if (isRecording && sessionStartTimeRef.current) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        setSessionDuration(duration);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);
  
  // Connect to WebSocket on component mount
  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [connectWebSocket]);
  
  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get score color
  const getScoreColor = (score) => {
    if (score >= 0.8) return 'text-green-500';
    if (score >= 0.6) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Get score label
  const getScoreLabel = (score) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Real-Time Communication Analysis
          </h1>
          <p className="text-gray-600">
            Get instant feedback on your presentation skills
          </p>
        </div>

        {/* Connection Status */}
        <div className="mb-6">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isConnected ? 'Connected to Analysis Server' : 'Disconnected'}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Live Video Feed</h2>
                {isRecording && (
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm text-gray-600">
                      Recording • {formatTime(sessionDuration)} • {frameCountRef.current} frames
                    </span>
                  </div>
                )}
              </div>
              
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-96 object-cover"
                  autoPlay
                  muted
                  playsInline
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {!isRecording && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-center text-white">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-lg font-medium">Camera Preview</p>
                      <p className="text-sm opacity-75">Click "Start Analysis" to begin</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex space-x-4">
                  {!isRecording ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startRecording}
                      disabled={!isConnected}
                      className={`flex-1 py-3 px-6 rounded-lg font-medium text-white ${
                        isConnected
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                      Start Analysis
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={stopRecording}
                      className="flex-1 py-3 px-6 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                      </svg>
                      Stop Analysis
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {/* Current Scores */}
            {analysisResults && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Scores</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Overall</span>
                      <span className={`text-sm font-bold ${getScoreColor(analysisResults.scores.overall)}`}>
                        {getScoreLabel(analysisResults.scores.overall)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResults.scores.overall * 100}%` }}
                        className="bg-blue-600 h-2 rounded-full"
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {Math.round(analysisResults.scores.overall * 100)}%
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Posture</span>
                      <span className={`text-sm font-bold ${getScoreColor(analysisResults.scores.posture)}`}>
                        {getScoreLabel(analysisResults.scores.posture)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResults.scores.posture * 100}%` }}
                        className="bg-green-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Eye Contact</span>
                      <span className={`text-sm font-bold ${getScoreColor(analysisResults.scores.eye_contact)}`}>
                        {getScoreLabel(analysisResults.scores.eye_contact)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResults.scores.eye_contact * 100}%` }}
                        className="bg-purple-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Gestures</span>
                      <span className={`text-sm font-bold ${getScoreColor(analysisResults.scores.gestures)}`}>
                        {getScoreLabel(analysisResults.scores.gestures)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${analysisResults.scores.gestures * 100}%` }}
                        className="bg-orange-600 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </div>
                
                {analysisResults.confidence && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Analysis Confidence</span>
                      <span className="text-sm font-medium text-gray-800">
                        {Math.round(analysisResults.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Real-Time Feedback */}
            {analysisResults && analysisResults.feedback && analysisResults.feedback.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg shadow-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Feedback</h3>
                <div className="space-y-3">
                  {analysisResults.feedback.map((feedback, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">{feedback}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Session Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Session ID:</span>
                  <span className="font-mono text-gray-800">
                    {sessionId ? sessionId.slice(0, 8) + '...' : 'Not started'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-800">{formatTime(sessionDuration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frames Processed:</span>
                  <span className="text-gray-800">{frameCountRef.current}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Analysis Time:</span>
                  <span className="text-gray-800">
                    {analysisResults?.analysis_time 
                      ? `${(analysisResults.analysis_time * 1000).toFixed(0)}ms`
                      : 'N/A'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback History */}
        {feedbackHistory.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Feedback History</h3>
              <div className="space-y-4">
                {feedbackHistory.slice(0, 5).map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-l-4 border-blue-500 pl-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-gray-500">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                      {item.scores && (
                        <span className="text-sm font-medium text-gray-800">
                          Overall: {Math.round(item.scores.overall * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {item.feedback.map((feedback, fIndex) => (
                        <p key={fIndex} className="text-sm text-gray-700">
                          • {feedback}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeVideoAnalysis; 
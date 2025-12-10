import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Play,
  Pause,
  Square,
  Settings,
  Brain,
  Activity,
  TrendingUp,
  Eye,
  MessageSquare,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Info,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  Share2,
  RotateCcw,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Monitor,
  Smartphone,
  Headphones,
  Users,
  Award,
  Clock,
  Star,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Minus,
  RefreshCw
} from 'lucide-react';

import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils
} from '@mediapipe/tasks-vision';

const AdvancedRealTimeAnalysis = () => {
  // Core state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [drawingUtils, setDrawingUtils] = useState(null);
  
  // Media state
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioStream, setAudioStream] = useState(null);
  const [videoStream, setVideoStream] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Analysis state
  const [speechMetrics, setSpeechMetrics] = useState({
    clarity: 0,
    pace: 0,
    volume: 0,
    pitch: 0,
    fillerWords: 0,
    sentiment: 'neutral',
    confidence: 0
  });
  
  const [videoMetrics, setVideoMetrics] = useState({
    eyeContact: 0,
    posture: 0,
    gestures: 0,
    facialExpressions: {
      happy: 0,
      neutral: 0,
      surprised: 0,
      sad: 0,
      angry: 0,
      fearful: 0,
      disgusted: 0
    },
    engagement: 0
  });
  
  const [liveFeedback, setLiveFeedback] = useState([]);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  
  // UI state
  const [selectedTab, setSelectedTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  
  // Refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const wsRef = useRef(null);
  const sessionTimerRef = useRef(null);
  const analysisIntervalRef = useRef(null);
  const predictWebcamRef = useRef(null);
  const isAnalyzingRef = useRef(false);
  const sessionStartedRef = useRef(false);

  // Initialize MediaPipe PoseLandmarker
  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      const newPoseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });
      setPoseLandmarker(newPoseLandmarker);
      const canvas = canvasRef.current;
      if (canvas) {
        const newDrawingUtils = new DrawingUtils(canvas.getContext('2d'));
        setDrawingUtils(newDrawingUtils);
      }
    };
    createPoseLandmarker();
  }, []);

  // WebSocket connection state
  const [wsConnected, setWsConnected] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 1000; // Start with 1 second

  // Handle WebSocket messages - defined first
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'speech_metrics':
        setSpeechMetrics(data.metrics);
        break;
      case 'video_metrics':
        setVideoMetrics(data.metrics);
        break;
      case 'feedback':
        setLiveFeedback(prev => [...prev, data.feedback]);
        setFeedbackHistory(prev => [...prev, {
          timestamp: Date.now(),
          feedback: data.feedback,
          metrics: data.metrics
        }]);
        break;
      case 'session_summary':
        setSessionSummary(data.summary);
        break;
      default:
        console.log('📨 Received message:', data);
    }
  }, []);

  // Send WebSocket message with retry logic
  const sendMessage = useCallback((message) => {
    if (!wsRef.current) {
      // Don't spam warnings if WebSocket isn't initialized yet
      if (sessionStarted) {
        console.warn('⚠️ WebSocket not initialized');
      }
      return false;
    }

    if (wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(message));
        return true;
      } catch (error) {
        console.error('❌ Error sending WebSocket message:', error);
        return false;
      }
    } else {
      // Only warn if we're actually trying to send during an active session
      if (sessionStarted && wsRef.current.readyState !== WebSocket.CONNECTING) {
        console.warn('⚠️ WebSocket not open, state:', wsRef.current.readyState);
      }
      // Queue message for when connection is restored
      return false;
    }
  }, [sessionStarted]);

  // Generate session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Initialize WebSocket connection with reconnection logic
  useEffect(() => {
    if (!sessionStarted) {
      // Clean up if session stopped
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setWsConnected(false);
      reconnectAttemptsRef.current = 0;
      return;
    }

    const connectWebSocket = () => {
      let connectionTimeout = null;
      
      try {
        // Close existing connection if any
        if (wsRef.current) {
          try {
            wsRef.current.close();
          } catch (e) {
            // Ignore errors when closing
          }
          wsRef.current = null;
        }
        
        const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5001/ws';
        console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);
        console.log(`🔌 Session started: ${sessionStarted}`);
        
        wsRef.current = new WebSocket(wsUrl);
        
        // Set a connection timeout
        connectionTimeout = setTimeout(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
            console.error('❌ WebSocket connection timeout');
            wsRef.current.close();
            wsRef.current = null;
            setWsConnected(false);
            
            // Show error message
            setLiveFeedback(prev => {
              const hasError = prev.some(f => f.message && f.message.includes('WebSocket connection timeout'));
              if (hasError) return prev;
              return [...prev, {
                type: 'error',
                message: 'WebSocket connection timeout. Please check if the server is running on port 5001.',
                priority: 'high',
                timestamp: Date.now()
              }];
            });
          }
        }, 10000); // 10 second timeout
        
        wsRef.current.onopen = () => {
          if (connectionTimeout) clearTimeout(connectionTimeout);
          console.log('✅ WebSocket connected');
          setWsConnected(true);
          reconnectAttemptsRef.current = 0; // Reset on successful connection
          
          const sessionId = generateSessionId();
          console.log('📤 Starting analysis with session ID:', sessionId);
          sendMessage({ 
            type: 'start_analysis', 
            sessionId: sessionId,
            timestamp: Date.now()
          });
        };
        
        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Received WebSocket message:', data.type);
            handleWebSocketMessage(data);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };
        
        wsRef.current.onclose = (event) => {
          if (connectionTimeout) clearTimeout(connectionTimeout);
          console.log('🔌 WebSocket connection closed', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            sessionStarted: sessionStartedRef.current
          });
          setWsConnected(false);
          
          // Don't reconnect if session was intentionally stopped
          if (!sessionStartedRef.current) {
            console.log('✅ WebSocket closed - session stopped');
            return;
          }
          
          // Attempt to reconnect if session is still active
          if (sessionStartedRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
            const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current);
            reconnectAttemptsRef.current++;
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              if (sessionStartedRef.current) {
                connectWebSocket();
              }
            }, delay);
          } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            console.error('❌ Max reconnection attempts reached');
            setLiveFeedback(prev => {
              const hasError = prev.some(f => f.message && f.message.includes('Lost connection to server'));
              if (hasError) return prev;
              return [...prev, {
                type: 'error',
                message: 'Lost connection to server. Please refresh the page.',
                priority: 'high',
                timestamp: Date.now()
              }];
            });
          }
        };
        
        wsRef.current.onerror = (error) => {
          // Only log error if we're actually trying to connect
          if (sessionStarted) {
            console.error('❌ WebSocket error:', error);
            console.error('WebSocket state:', wsRef.current?.readyState);
            console.error('WebSocket URL:', wsUrl);
            setWsConnected(false);
            
            // Only show error once to avoid spam
            setLiveFeedback(prev => {
              const hasError = prev.some(f => f.message && f.message.includes('WebSocket connection error'));
              if (hasError) return prev;
              return [...prev, {
                type: 'error',
                message: 'WebSocket connection error. Please ensure the server is running on port 5001.',
                priority: 'high',
                timestamp: Date.now()
              }];
            });
          }
        };
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        setWsConnected(false);
      }
    };

    // Initial connection
    connectWebSocket();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
    };
  }, [sessionStarted, handleWebSocketMessage, sendMessage]);

  // Start session timer
  const startSessionTimer = useCallback(() => {
    sessionTimerRef.current = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
  }, []);

  // Stop session timer
  const stopSessionTimer = useCallback(() => {
    if (sessionTimerRef.current) {
      clearInterval(sessionTimerRef.current);
      sessionTimerRef.current = null;
    }
  }, []);

  // Setup audio analysis with MediaRecorder for better compatibility - defined before initializeMediaStreams
  const setupAudioAnalysis = useCallback((stream) => {
    try {
      // Use AudioContext for real-time analysis
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
          sampleRate: 16000
        });
      }

      // Resume audio context if suspended (browser autoplay policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().then(() => {
          console.log('✅ Audio context resumed');
        }).catch(err => {
          console.error('❌ Failed to resume audio context:', err);
        });
      }
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      // Use AudioWorklet if available, otherwise fall back to ScriptProcessor
      if (audioContextRef.current.audioWorklet) {
        // AudioWorklet is preferred but requires module loading
        // For now, use ScriptProcessor as fallback
        const scriptNode = audioContextRef.current.createScriptProcessor(4096, 1, 1);

        scriptNode.onaudioprocess = (audioProcessingEvent) => {
          if (!isAnalyzing || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
          }

          try {
            const inputBuffer = audioProcessingEvent.inputBuffer;
            const inputData = inputBuffer.getChannelData(0);
            
            // Convert Float32Array to regular array for JSON serialization
            const audioArray = Array.from(inputData);
            
            // Send audio data for analysis (throttle to avoid overwhelming the connection)
            if (Math.random() < 0.1) { // Send ~10% of frames
              sendMessage({
                type: 'audio_data',
                data: audioArray,
                timestamp: Date.now(),
                sampleRate: audioContextRef.current.sampleRate
              });
            }
          } catch (err) {
            console.error('❌ Error processing audio:', err);
          }
        };

        source.connect(scriptNode);
        scriptNode.connect(audioContextRef.current.destination);
        console.log('✅ Audio analysis setup complete');
      } else {
        console.warn('⚠️ AudioWorklet not supported, using ScriptProcessor');
        const scriptNode = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        scriptNode.onaudioprocess = (audioProcessingEvent) => {
          if (!isAnalyzing || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            return;
          }
          try {
            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
            if (Math.random() < 0.1) {
              sendMessage({
                type: 'audio_data',
                data: Array.from(inputData),
                timestamp: Date.now(),
                sampleRate: audioContextRef.current.sampleRate
              });
            }
          } catch (err) {
            console.error('❌ Error processing audio:', err);
          }
        };
        source.connect(scriptNode);
        scriptNode.connect(audioContextRef.current.destination);
      }
    } catch (error) {
      console.error('❌ Error setting up audio analysis:', error);
      setLiveFeedback(prev => [...prev, {
        type: 'error',
        message: 'Failed to setup audio analysis',
        priority: 'medium',
        timestamp: Date.now()
      }]);
    }
  }, [isAnalyzing, sendMessage]);

  // Setup video analysis with proper error handling - defined before initializeMediaStreams
  const setupVideoAnalysis = useCallback((stream) => {
    try {
      if (!videoRef.current) {
        console.error('❌ Video ref not available');
        return;
      }

      const video = videoRef.current;
      
      // CRITICAL: Check track state BEFORE setting up video element
      const tracks = stream.getTracks();
      const videoTrack = tracks.find(t => t.kind === 'video');
      if (videoTrack && videoTrack.readyState === 'ended') {
        console.error('❌ Video track ended before we could set it up!');
        setLiveFeedback(prev => [...prev, {
          type: 'error',
          message: 'Video track ended before setup. The camera may be in use by another application.',
          priority: 'high',
          timestamp: Date.now()
        }]);
        return; // Don't proceed if track is already ended
      }
      
      // CRITICAL: Clean up old keep-alive mechanisms before setting up new ones
      if (video.dataset) {
        if (video.dataset.keepAliveAnimationFrame) {
          cancelAnimationFrame(parseInt(video.dataset.keepAliveAnimationFrame));
          video.dataset.keepAliveAnimationFrame = null;
        }
        if (video.dataset.keepAliveInterval) {
          clearInterval(parseInt(video.dataset.keepAliveInterval));
          video.dataset.keepAliveInterval = null;
        }
        if (video.dataset.preventTrackEndInterval) {
          clearInterval(parseInt(video.dataset.preventTrackEndInterval));
          video.dataset.preventTrackEndInterval = null;
        }
      }
      
      // Clear any existing stream first (but don't stop tracks if they're the same stream)
      if (video.srcObject && video.srcObject !== stream) {
        console.log('🔄 Replacing existing video stream');
        const oldStream = video.srcObject;
        oldStream.getTracks().forEach(track => {
          if (track.readyState !== 'ended') {
            track.stop();
          }
        });
        video.srcObject = null;
      }
      
      // Video element should already be set up in initializeMediaStreams
      // Just ensure it's configured correctly and playing
      if (video.srcObject !== stream) {
        // Only set if not already set (shouldn't happen, but safety check)
        video.srcObject = stream;
      }
      
      // Ensure video element properties are set
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
      video.style.display = 'block';
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';
      
      // Ensure video is playing (it should already be from initializeMediaStreams)
      if (video.paused) {
        video.play().catch(err => {
          console.warn('⚠️ Video play failed in setupVideoAnalysis:', err);
        });
      }
      
      console.log('✅ Video element configured', {
        hasStream: !!video.srcObject,
        muted: video.muted,
        autoplay: video.autoplay,
        playsInline: video.playsInline,
        paused: video.paused
      });
      
      // Set canvas dimensions to match video
      if (canvasRef.current) {
        video.addEventListener('loadedmetadata', () => {
          canvasRef.current.width = video.videoWidth || 1280;
          canvasRef.current.height = video.videoHeight || 720;
          console.log(`✅ Canvas set to ${canvasRef.current.width}x${canvasRef.current.height}`);
        });
      }
      
      
      // Monitor video element state to ensure it stays active
      let lastTrackState = 'unknown';
      const checkVideoState = () => {
        if (!isAnalyzingRef.current || !video.srcObject) {
          return;
        }
        
        const tracks = video.srcObject.getTracks();
        const videoTrack = tracks.find(t => t.kind === 'video');
        
        if (!videoTrack) {
          return;
        }
        
        const currentState = videoTrack.readyState;
        
        // Only log state changes to avoid spam
        if (currentState !== lastTrackState) {
          console.log(`📹 Video track state: ${lastTrackState} → ${currentState}`);
          lastTrackState = currentState;
        }
        
        if (currentState === 'ended') {
          // Only show error once per ended state
          if (lastTrackState !== 'ended') {
            console.warn('⚠️ Video track ended while video element is active');
            setLiveFeedback(prev => {
              // Check if we already have this error to avoid duplicates
              const hasError = prev.some(f => f.message === 'Video track ended. Please stop and restart the analysis.');
              if (hasError) return prev;
              return [...prev, {
                type: 'error',
                message: 'Video track ended. Please stop and restart the analysis.',
                priority: 'high',
                timestamp: Date.now()
              }];
            });
          }
        } else if (currentState === 'live') {
          // Ensure track stays enabled
          if (!videoTrack.enabled) {
            console.warn('⚠️ Video track was disabled, re-enabling');
            videoTrack.enabled = true;
          }
          
          // CRITICAL: Ensure video is playing to keep stream active
          if (video.paused && !video.ended) {
            console.log('🔄 Video element paused, resuming to keep stream alive');
            video.play().catch(err => {
              console.error('❌ Failed to resume video:', err);
            });
          }
        }
      };
      
      // Check video state periodically (less frequently to avoid overhead)
      const videoStateInterval = setInterval(checkVideoState, 5000); // Check every 5 seconds
      
      // Clean up interval when component unmounts or stream changes
      const cleanup = () => {
        clearInterval(videoStateInterval);
      };
      
      video.addEventListener('loadedmetadata', () => {
        // Store cleanup function
        if (video.dataset) {
          video.dataset.stateCheckCleanup = cleanup;
        }
      });
      
      // Start video analysis when video is ready
      // Note: predictWebcam will be stored in a ref, so we can access it later
      const startAnalysis = () => {
        console.log('✅ Video loaded, starting analysis', {
          readyState: video.readyState,
          isAnalyzing: isAnalyzing,
          hasStream: !!video.srcObject,
          playing: !video.paused
        });
        
        // Ensure video is playing
        if (video.paused) {
          video.play().catch(err => {
            console.error('❌ Failed to play video in startAnalysis:', err);
          });
        }
        
        // Start the predictWebcam loop if analyzing
        if (isAnalyzing && predictWebcamRef.current && typeof predictWebcamRef.current === 'function') {
          // Use requestAnimationFrame to ensure predictWebcam is available
          requestAnimationFrame(() => {
            if (predictWebcamRef.current && typeof predictWebcamRef.current === 'function') {
              predictWebcamRef.current();
            }
          });
        }
      };
      
      video.addEventListener('loadeddata', startAnalysis);
      video.addEventListener('loadedmetadata', startAnalysis);
      video.addEventListener('playing', () => {
        console.log('✅ Video is now playing');
        // Start analysis when video starts playing
        if (isAnalyzing && predictWebcamRef.current) {
          requestAnimationFrame(() => {
            if (predictWebcamRef.current && typeof predictWebcamRef.current === 'function') {
              predictWebcamRef.current();
            }
          });
        }
      });

      // Handle video errors
      video.onerror = (error) => {
        console.error('❌ Video error:', error);
        setLiveFeedback(prev => [...prev, {
          type: 'error',
          message: 'Video playback error',
          priority: 'high',
          timestamp: Date.now()
        }]);
      };

      // Play video with better error handling
      const playVideo = async () => {
        try {
          // Ensure video has a stream
          if (!video.srcObject) {
            console.error('❌ Video has no stream to play');
            return;
          }
          
          // Check if stream has active tracks
          const tracks = video.srcObject.getTracks();
          const videoTrack = tracks.find(t => t.kind === 'video');
          
          // If track exists but isn't live yet, wait a bit for it to become live
          if (videoTrack && videoTrack.readyState !== 'live') {
            console.log('⏳ Video track not live yet, waiting...', {
              readyState: videoTrack.readyState
            });
            // Wait for track to become live (max 2 seconds)
            let attempts = 0;
            const checkTrack = setInterval(() => {
              attempts++;
              if (videoTrack.readyState === 'live') {
                clearInterval(checkTrack);
                video.play().catch(err => {
                  console.warn('⚠️ Failed to play after track became live:', err);
                });
              } else if (attempts > 20) {
                clearInterval(checkTrack);
                console.warn('⚠️ Video track did not become live after waiting');
              }
            }, 100);
            return;
          }
          
          if (!videoTrack) {
            console.warn('⚠️ No video track found in stream');
            return;
          }
          
          await video.play();
          console.log('✅ Video playback started', {
            videoWidth: video.videoWidth,
            videoHeight: video.videoHeight,
            readyState: video.readyState,
            paused: video.paused
          });
        } catch (err) {
          console.error('❌ Failed to play video:', err);
          // Try again after a short delay (autoplay policy might block it)
          setTimeout(() => {
            if (video.srcObject && !video.paused) {
              return; // Already playing or no stream
            }
            video.play().catch(playErr => {
              console.error('❌ Failed to play video on retry:', playErr);
              setLiveFeedback(prev => [...prev, {
                type: 'error',
                message: 'Failed to start video playback. Please click to interact with the page first.',
                priority: 'high',
                timestamp: Date.now()
              }]);
            });
          }, 100);
        }
      };
      
      // Start playing when video is ready
      if (video.readyState >= 2) {
        playVideo();
      } else {
        video.addEventListener('loadeddata', playVideo, { once: true });
        video.addEventListener('loadedmetadata', playVideo, { once: true });
      }
      
      // Also try to play immediately (might work if stream is already ready)
      playVideo();
      
      // CRITICAL: Aggressive keep-alive to prevent track from ending
      // Use both requestAnimationFrame AND setInterval for maximum coverage
      let keepAliveFrameId = null;
      let keepAliveIntervalId = null;
      
      const keepVideoActive = () => {
        if (!isAnalyzingRef.current || !videoRef.current || !videoRef.current.srcObject) {
          if (keepAliveFrameId) {
            cancelAnimationFrame(keepAliveFrameId);
            keepAliveFrameId = null;
          }
          if (keepAliveIntervalId) {
            clearInterval(keepAliveIntervalId);
            keepAliveIntervalId = null;
          }
          return;
        }
        
        const video = videoRef.current;
        const stream = video.srcObject;
        const tracks = stream?.getTracks();
        const videoTrack = tracks?.find(t => t.kind === 'video');
        
        if (videoTrack) {
          // CRITICAL: If track is live, ensure it stays active
          if (videoTrack.readyState === 'live') {
            // Ensure video is playing (browser requirement for keeping stream active)
            if (video.paused || video.ended) {
              video.play().catch(err => {
                console.warn('⚠️ Keep-alive play failed:', err);
              });
            }
            
            // Ensure track is enabled - do this aggressively
            if (!videoTrack.enabled) {
              videoTrack.enabled = true;
              console.log('🔄 Re-enabled video track');
            }
            
            // Draw a frame to canvas to keep the stream actively consumed
            // This is critical - the browser stops tracks that aren't being consumed
            if (canvasRef.current && video.videoWidth > 0 && video.videoHeight > 0) {
              try {
                const ctx = canvasRef.current.getContext('2d');
                ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
              } catch (err) {
                // Ignore canvas errors - video might not be ready yet
              }
            }
          } else if (videoTrack.readyState === 'ended') {
            // Track has ended - this is the problem we're trying to prevent
            console.error('❌ Video track ended despite keep-alive efforts');
            if (isAnalyzingRef.current) {
              setLiveFeedback(prev => {
                const hasError = prev.some(f => f.message && f.message.includes('Video track ended'));
                if (hasError) return prev;
                return [...prev, {
                  type: 'error',
                  message: 'Video track ended unexpectedly. This may be due to browser resource limits or another application using the camera.',
                  priority: 'high',
                  timestamp: Date.now()
                }];
              });
            }
            // Stop the keep-alive loops if track is ended
            if (keepAliveFrameId) {
              cancelAnimationFrame(keepAliveFrameId);
              keepAliveFrameId = null;
            }
            if (keepAliveIntervalId) {
              clearInterval(keepAliveIntervalId);
              keepAliveIntervalId = null;
            }
            return;
          }
        }
        
        // Continue the loop to keep stream active
        keepAliveFrameId = requestAnimationFrame(keepVideoActive);
      };
      
      // Additional aggressive interval-based keep-alive (every 100ms)
      const aggressiveKeepAlive = () => {
        if (!isAnalyzingRef.current || !videoRef.current || !videoRef.current.srcObject) {
          if (keepAliveIntervalId) {
            clearInterval(keepAliveIntervalId);
            keepAliveIntervalId = null;
          }
          return;
        }
        
        const video = videoRef.current;
        const stream = video.srcObject;
        const tracks = stream?.getTracks();
        const videoTrack = tracks?.find(t => t.kind === 'video');
        
        if (videoTrack && videoTrack.readyState === 'live') {
          // CRITICAL: Ensure video element is visible and rendering
          // Some browsers stop tracks if video element isn't visible
          if (video.style.display === 'none' || video.style.visibility === 'hidden') {
            video.style.display = 'block';
            video.style.visibility = 'visible';
            video.style.opacity = '1';
          }
          
          // Aggressively ensure video is playing
          if (video.paused || video.ended) {
            video.play().catch(() => {});
          }
          
          // Aggressively ensure track is enabled
          if (!videoTrack.enabled) {
            videoTrack.enabled = true;
          }
          
          // Force a frame draw to keep stream active
          // This is critical - browsers stop tracks that aren't being consumed
          if (canvasRef.current && video.videoWidth > 0 && video.videoHeight > 0) {
            try {
              const ctx = canvasRef.current.getContext('2d');
              // Draw video frame to canvas to keep stream actively consumed
              ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
            } catch (e) {
              // Ignore canvas errors
            }
          }
          
          // Also ensure video element itself is rendering
          // Access video properties to keep it "active" in browser's view
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            // Accessing these properties helps keep the stream active
            const _ = video.videoWidth + video.videoHeight;
          }
        }
      };
      
      // Start both keep-alive mechanisms immediately
      keepVideoActive();
      keepAliveIntervalId = setInterval(aggressiveKeepAlive, 100); // Check every 100ms
      
      // Store for cleanup
      if (video.dataset) {
        video.dataset.keepAliveAnimationFrame = keepAliveFrameId;
        video.dataset.keepAliveInterval = keepAliveIntervalId;
      }

      console.log('✅ Video analysis setup complete');
    } catch (error) {
      console.error('❌ Error setting up video analysis:', error);
      setLiveFeedback(prev => [...prev, {
        type: 'error',
        message: 'Failed to setup video analysis',
        priority: 'high',
        timestamp: Date.now()
      }]);
    }
  }, [isAnalyzing]);

  // Initialize media streams with proper error handling
  const initializeMediaStreams = useCallback(async () => {
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API is not supported in this browser');
      }

      // Build constraints based on enabled features
      const constraints = {
        audio: audioEnabled ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } : false,
        video: videoEnabled ? {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          frameRate: { ideal: 30, min: 15 },
          facingMode: 'user'
        } : false
      };

      // Request media access
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (permissionError) {
        if (permissionError.name === 'NotAllowedError') {
          throw new Error('Camera/microphone permission denied. Please allow access in your browser settings.');
        } else if (permissionError.name === 'NotFoundError') {
          throw new Error('No camera or microphone found. Please connect a device and try again.');
        } else if (permissionError.name === 'NotReadableError') {
          throw new Error('Camera or microphone is already in use by another application.');
        } else {
          throw new Error(`Failed to access media devices: ${permissionError.message}`);
        }
      }
      
      // Verify stream was obtained
      if (!stream) {
        throw new Error('Failed to obtain media stream');
      }

      // Ensure all tracks are enabled and active
      stream.getTracks().forEach(track => {
        track.enabled = true;
        console.log(`✅ Track ${track.kind} enabled, readyState: ${track.readyState}`);
      });

      // CRITICAL FIX: Set video element srcObject IMMEDIATELY to start consuming stream
      // This must happen BEFORE any state updates or async operations
      if (videoEnabled && stream.getVideoTracks().length > 0 && videoRef.current) {
        const videoTrack = stream.getVideoTracks()[0];
        
        if (videoTrack.readyState === 'ended') {
          console.error('❌ Video track already ended when obtained!');
          setLiveFeedback(prev => [...prev, {
            type: 'error',
            message: 'Video track ended immediately. Please check if another application is using the camera.',
            priority: 'high',
            timestamp: Date.now()
          }]);
          return;
        }
        
        // CRITICAL: Set video source IMMEDIATELY (synchronously)
        const video = videoRef.current;
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        
        // Start playing IMMEDIATELY to consume the stream
        video.play().catch(err => {
          console.warn('⚠️ Initial play failed, will retry:', err);
        });
        
        console.log('✅ Video element attached to stream immediately', {
          readyState: videoTrack.readyState,
          enabled: videoTrack.enabled
        });
      }

      // Setup audio if enabled and available
      if (audioEnabled && stream.getAudioTracks().length > 0) {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack.readyState === 'live') {
          setAudioStream(stream);
          setupAudioAnalysis(stream);
          console.log('✅ Audio stream initialized');
        } else {
          console.warn('⚠️ Audio track not live, readyState:', audioTrack.readyState);
        }
      } else if (audioEnabled) {
        console.warn('⚠️ Audio requested but no audio tracks available');
      }
      
      // Now do the rest of the setup after video is already consuming
      if (videoEnabled && stream.getVideoTracks().length > 0) {
        const videoTrack = stream.getVideoTracks()[0];
        
        if (videoTrack.readyState === 'live') {
          videoTrack.enabled = true;
          
          // Update state and setup analysis
          setVideoStream(stream);
          setupVideoAnalysis(stream);
          
          // Monitor track state
          videoTrack.addEventListener('ended', () => {
            console.warn('⚠️ Video track ended event fired');
          });
          
          videoTrack.addEventListener('mute', () => {
            console.warn('⚠️ Video track muted');
          });
          
          videoTrack.addEventListener('unmute', () => {
            console.log('✅ Video track unmuted');
          });
          
          console.log('✅ Video stream initialized', {
            readyState: videoTrack.readyState,
            enabled: videoTrack.enabled,
            settings: videoTrack.getSettings()
          });
        } else {
          console.warn('⚠️ Video track not live, readyState:', videoTrack.readyState);
        }
      } else if (videoEnabled) {
        console.warn('⚠️ Video requested but no video tracks available');
      }

      // CRITICAL: Prevent track from ending by aggressively monitoring and keeping it active
      // Set up track ended handlers with better logging
      // Use refs to get current state values (avoid closure issues)
      // IMPORTANT: Set this up AFTER video element is configured
      stream.getTracks().forEach(track => {
        // Remove any existing onended handler to avoid duplicates
        track.onended = null;
        
        // CRITICAL: Add aggressive keep-alive for video tracks BEFORE the ended handler
        if (track.kind === 'video') {
          // Continuously monitor and prevent track from ending
          // Use a very aggressive interval to keep the track alive
          const preventTrackEnd = setInterval(() => {
            if (!isAnalyzingRef.current || !sessionStartedRef.current) {
              clearInterval(preventTrackEnd);
              return;
            }
            
            // Check track state - if it's ended, we can't prevent it anymore
            if (track.readyState === 'ended') {
              clearInterval(preventTrackEnd);
              return;
            }
            
            // Track is live - aggressively keep it active
            if (track.readyState === 'live') {
              // CRITICAL: Continuously access track properties to keep it "active"
              // This prevents the browser from thinking the track is unused
              const _enabled = track.enabled;
              const _readyState = track.readyState;
              const _muted = track.muted;
              
              // Aggressively keep track enabled
              if (!track.enabled) {
                track.enabled = true;
              }
              
              // Ensure video element is playing and visible
              if (videoRef.current) {
                const video = videoRef.current;
                
                // Ensure video is visible
                if (video.style.display === 'none' || video.style.visibility === 'hidden') {
                  video.style.display = 'block';
                  video.style.visibility = 'visible';
                  video.style.opacity = '1';
                }
                
                // Ensure video is playing
                if (video.paused || video.ended) {
                  video.play().catch(() => {});
                }
                
                // Force frame consumption by drawing to canvas
                if (canvasRef.current && video.videoWidth > 0 && video.videoHeight > 0) {
                  try {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.drawImage(video, 0, 0, 
                      canvasRef.current.width, canvasRef.current.height);
                  } catch (e) {
                    // Ignore canvas errors
                  }
                }
                
                // Access video properties to keep it "active"
                const _ = video.videoWidth + video.videoHeight + video.readyState;
              }
            }
          }, 33); // Check every 33ms (~30 FPS) - very aggressive
          
          // Store for cleanup
          if (videoRef.current && videoRef.current.dataset) {
            // Clear any existing interval first
            if (videoRef.current.dataset.preventTrackEndInterval) {
              clearInterval(parseInt(videoRef.current.dataset.preventTrackEndInterval));
            }
            videoRef.current.dataset.preventTrackEndInterval = preventTrackEnd;
          }
        }
        
        track.onended = () => {
          const currentIsAnalyzing = isAnalyzingRef.current;
          const currentSessionStarted = sessionStartedRef.current;
          
          console.log(`Track ended: ${track.kind}`, {
            readyState: track.readyState,
            enabled: track.enabled,
            muted: track.muted,
            isAnalyzing: currentIsAnalyzing,
            sessionStarted: currentSessionStarted
          });
          
          // Only clear stream if session is actually stopped
          if (!currentSessionStarted && !currentIsAnalyzing) {
            console.log(`✅ Track ${track.kind} ended - session already stopped`);
            if (track.kind === 'audio') {
              setAudioStream(null);
            } else if (track.kind === 'video') {
              setVideoStream(null);
            }
          } else {
            // Track ended unexpectedly - this is a browser/system issue
            console.warn(`⚠️ Track ${track.kind} ended unexpectedly during active session!`, {
              isAnalyzing: currentIsAnalyzing,
              sessionStarted: currentSessionStarted
            });
            
            if (currentSessionStarted || currentIsAnalyzing) {
              // Try to prevent the track from ending by ensuring video is playing
              if (track.kind === 'video' && videoRef.current) {
                const video = videoRef.current;
                const currentStream = video.srcObject;
                
                // If we still have a stream, try to keep it alive
                if (currentStream && currentStream.getVideoTracks().length > 0) {
                  const videoTrack = currentStream.getVideoTracks()[0];
                  
                  // If track is still live but ended event fired, it might be a false alarm
                  if (videoTrack.readyState === 'live') {
                    console.log('🔄 Track ended event fired but track is still live - keeping stream active');
                    // Ensure video is playing to consume the stream
                    if (video.paused) {
                      video.play().catch(err => console.warn('⚠️ Failed to resume video:', err));
                    }
                    return; // Don't show error if track is actually still live
                  }
                }
                
                // Track is actually ended - try to get a new stream with retry logic
                console.error(`❌ ${track.kind} track ended during active session. Attempting to recover...`);
                
                // Try to get a new stream if session is still active
                if (currentIsAnalyzing && currentSessionStarted) {
                  // Stop the old stream tracks first and wait for cleanup
                  if (currentStream) {
                    currentStream.getTracks().forEach(t => {
                      if (t.readyState !== 'ended') {
                        t.stop();
                      }
                    });
                  }
                  
                  // Clear video element
                  if (video) {
                    video.srcObject = null;
                  }
                  
                  // Retry recovery with exponential backoff
                  let recoveryAttempts = 0;
                  const maxRecoveryAttempts = 3;
                  
                  const attemptRecovery = async () => {
                    if (!isAnalyzingRef.current || !sessionStartedRef.current) {
                      return; // Session stopped, don't recover
                    }
                    
                    recoveryAttempts++;
                    console.log(`🔄 Recovery attempt ${recoveryAttempts}/${maxRecoveryAttempts}...`);
                    
                    try {
                      // Wait longer between attempts to let camera release
                      // First attempt waits 2 seconds, subsequent attempts wait longer
                      const waitTime = recoveryAttempts === 1 ? 2000 : Math.min(2000 * recoveryAttempts, 5000);
                      if (recoveryAttempts > 1) {
                        console.log(`⏳ Waiting ${waitTime}ms before recovery attempt ${recoveryAttempts}...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                      } else {
                        // First attempt - wait 2 seconds for camera to release
                        await new Promise(resolve => setTimeout(resolve, 2000));
                      }
                      
                      // Check if camera is available by trying to enumerate devices first
                      try {
                        const devices = await navigator.mediaDevices.enumerateDevices();
                        const videoDevices = devices.filter(d => d.kind === 'videoinput');
                        if (videoDevices.length === 0) {
                          throw new Error('No video devices available');
                        }
                        console.log(`✅ Found ${videoDevices.length} video device(s)`);
                      } catch (enumError) {
                        console.warn('⚠️ Cannot enumerate devices, camera may be locked:', enumError.message);
                      }
                      
                      // Request new media stream with more lenient constraints
                      const constraints = {
                        video: {
                          width: { ideal: 1280, min: 640 },
                          height: { ideal: 720, min: 480 },
                          frameRate: { ideal: 30, min: 15 },
                          facingMode: 'user'
                        }
                      };
                      
                      console.log('📹 Requesting new video stream...');
                      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
                      
                      // Set up the new stream immediately
                      if (video && newStream.getVideoTracks().length > 0) {
                        const newVideoTrack = newStream.getVideoTracks()[0];
                        if (newVideoTrack.readyState === 'live') {
                          // CRITICAL: Clean up old keep-alive mechanisms first
                          if (video.dataset) {
                            if (video.dataset.keepAliveAnimationFrame) {
                              cancelAnimationFrame(parseInt(video.dataset.keepAliveAnimationFrame));
                            }
                            if (video.dataset.keepAliveInterval) {
                              clearInterval(parseInt(video.dataset.keepAliveInterval));
                            }
                            if (video.dataset.preventTrackEndInterval) {
                              clearInterval(parseInt(video.dataset.preventTrackEndInterval));
                            }
                          }
                          
                          // CRITICAL: Set up video element immediately (synchronously)
                          video.srcObject = newStream;
                          video.muted = true;
                          video.playsInline = true;
                          video.autoplay = true;
                          video.style.display = 'block';
                          video.style.width = '100%';
                          video.style.height = '100%';
                          video.style.objectFit = 'cover';
                          
                          // Start playing immediately
                          video.play().catch(() => {});
                          
                          // Update state
                          setVideoStream(newStream);
                          
                          // Re-run setup to attach all handlers and keep-alive mechanisms
                          // This will set up new keep-alive mechanisms for the recovered stream
                          setupVideoAnalysis(newStream);
                          
                          // Also re-attach track ended handlers for the new stream
                          newStream.getTracks().forEach(track => {
                            if (track.kind === 'video') {
                              track.addEventListener('ended', () => {
                                console.warn('⚠️ Recovered video track ended event fired');
                              });
                            }
                          });
                          
                          console.log('✅ Video stream recovered successfully');
                          setLiveFeedback(prev => {
                            const hasSuccess = prev.some(f => f.message && f.message.includes('recovered successfully'));
                            if (hasSuccess) return prev;
                            return [...prev, {
                              type: 'success',
                              message: 'Video stream recovered successfully',
                              priority: 'medium',
                              timestamp: Date.now()
                            }];
                          });
                          return; // Success!
                        } else {
                          throw new Error(`New stream track not live, readyState: ${newVideoTrack.readyState}`);
                        }
                      } else {
                        throw new Error('No video tracks in new stream');
                      }
                    } catch (recoveryError) {
                      console.error(`❌ Recovery attempt ${recoveryAttempts} failed:`, recoveryError);
                      
                      // Check if it's a NotReadableError (camera locked)
                      if (recoveryError.name === 'NotReadableError' || 
                          recoveryError.message.includes('Could not start video source')) {
                        console.warn('⚠️ Camera appears to be locked/in use');
                        
                        if (recoveryAttempts < maxRecoveryAttempts && 
                            isAnalyzingRef.current && 
                            sessionStartedRef.current) {
                          // Wait longer for camera to release, then retry
                          const retryDelay = 3000 * recoveryAttempts; // 3s, 6s, 9s
                          console.log(`⏳ Camera locked, waiting ${retryDelay}ms before retry...`);
                          setTimeout(attemptRecovery, retryDelay);
                        } else {
                          // All recovery attempts failed
                          console.error('❌ All recovery attempts failed - camera may be in use by another application');
                          setLiveFeedback(prev => {
                            const hasError = prev.some(f => f.message && f.message.includes('recovery failed'));
                            if (hasError) return prev;
                            return [...prev, {
                              type: 'error',
                              message: 'Video track ended and recovery failed. The camera appears to be in use by another application. Please close other applications using the camera and restart the analysis.',
                              priority: 'high',
                              timestamp: Date.now()
                            }];
                          });
                        }
                      } else {
                        // Other error - retry with exponential backoff
                        if (recoveryAttempts < maxRecoveryAttempts && 
                            isAnalyzingRef.current && 
                            sessionStartedRef.current) {
                          const retryDelay = 2000 * Math.pow(2, recoveryAttempts - 1);
                          setTimeout(attemptRecovery, retryDelay);
                        } else {
                          console.error('❌ All recovery attempts failed');
                          setLiveFeedback(prev => {
                            const hasError = prev.some(f => f.message && f.message.includes('recovery failed'));
                            if (hasError) return prev;
                            return [...prev, {
                              type: 'error',
                              message: 'Video track ended and recovery failed. Please stop and restart the analysis.',
                              priority: 'high',
                              timestamp: Date.now()
                            }];
                          });
                        }
                      }
                    }
                  };
                  
                  // Start recovery attempt after initial delay
                  setTimeout(attemptRecovery, 1000); // Wait 1 second before first attempt
                  
                  return; // Don't show error yet, wait for recovery attempt
                }
                
                setLiveFeedback(prev => [...prev, {
                  type: 'error',
                  message: 'Video track ended unexpectedly. This may be due to browser resource limits or another application using the camera.',
                  priority: 'high',
                  timestamp: Date.now()
                }]);
              } else {
                setLiveFeedback(prev => [...prev, {
                  type: 'error',
                  message: `${track.kind} track ended unexpectedly. Please stop and restart the analysis.`,
                  priority: 'high',
                  timestamp: Date.now()
                }]);
              }
            }
          }
        };
      });
      
      return stream;
    } catch (error) {
      console.error('❌ Error accessing media devices:', error);
      // Show user-friendly error message
      setLiveFeedback(prev => [...prev, {
        type: 'error',
        message: error.message || 'Failed to access camera or microphone',
        priority: 'high',
        timestamp: Date.now()
      }]);
      throw error;
    }
  }, [audioEnabled, videoEnabled, setupAudioAnalysis, setupVideoAnalysis]);

  const lastVideoTimeRef = useRef(-1);
  const frameTimestampRef = useRef(0); // MediaPipe requires strictly increasing timestamps
  const mediaPipeErrorCountRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const lastWebSocketSendRef = useRef(0);
  const frameSkipCountRef = useRef(0);
  
  const predictWebcam = useCallback(async () => {
    // Check if we should continue analyzing
    if (!isAnalyzing) {
      return; // Stop the loop if not analyzing
    }
    
    if (!videoRef.current || !poseLandmarker || !drawingUtils) {
      // If components aren't ready but we're still analyzing, try again
      if (isAnalyzing) {
        requestAnimationFrame(predictWebcam);
      }
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      if (!canvas) {
        console.warn('⚠️ Canvas not available');
        if (isAnalyzing) {
          requestAnimationFrame(predictWebcam);
        }
        return;
      }

      const context = canvas.getContext('2d');
      if (!context) {
        console.warn('⚠️ Canvas context not available');
        if (isAnalyzing) {
          requestAnimationFrame(predictWebcam);
        }
        return;
      }

      // Check if video is ready and playing
      if (video.readyState < 2) { // HAVE_CURRENT_DATA
        if (isAnalyzing) {
          requestAnimationFrame(predictWebcam);
        }
        return;
      }

      // Ensure video is actually playing
      if (video.paused || video.ended) {
        if (isAnalyzing) {
          requestAnimationFrame(predictWebcam);
        }
        return;
      }

      // Throttle frame processing to avoid overwhelming MediaPipe and improve performance
      const now = performance.now();
      const timeSinceLastFrame = now - lastFrameTimeRef.current;
      const minFrameInterval = 50; // ~20 FPS max (50ms between frames) - reduced for better performance
      
      if (timeSinceLastFrame < minFrameInterval && lastFrameTimeRef.current > 0) {
        // Skip this frame to maintain proper frame rate and reduce load
        frameSkipCountRef.current++;
        if (isAnalyzing) {
          requestAnimationFrame(predictWebcam);
        }
        return;
      }

      // Only process if video time has changed (new frame)
      // Also check that video dimensions are valid
      if (video.currentTime !== lastVideoTimeRef.current && 
          video.videoWidth > 0 && 
          video.videoHeight > 0) {
        lastVideoTimeRef.current = video.currentTime;
        lastFrameTimeRef.current = now;
        
        // Ensure timestamp is strictly monotonically increasing
        // Use performance.now() for better precision and ensure it's always increasing
        frameTimestampRef.current = Math.max(frameTimestampRef.current + 1, Math.floor(performance.now() * 1000));
        
        try {
          const results = await poseLandmarker.detectForVideo(video, frameTimestampRef.current);

          // Reset error count on successful detection
          mediaPipeErrorCountRef.current = 0;

          // Only draw on canvas every few frames to improve performance
          const shouldDraw = frameSkipCountRef.current % 3 === 0; // Draw every 3rd processed frame
          
          if (shouldDraw) {
            context.save();
            context.clearRect(0, 0, canvas.width, canvas.height);
          }

          if (results && results.landmarks && results.landmarks.length > 0) {
            // Draw landmarks only if we're drawing this frame
            if (shouldDraw) {
              for (const landmark of results.landmarks) {
                if (drawingUtils && landmark) {
                  drawingUtils.drawLandmarks(landmark, { color: '#FF0000', lineWidth: 2 });
                  drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 3 });
                }
              }
            }

            // Basic posture analysis using first detected person (always calculate for metrics)
            const firstLandmark = results.landmarks[0];
            if (firstLandmark && firstLandmark.length > 24) {
              const leftShoulder = firstLandmark[11];
              const rightShoulder = firstLandmark[12];
              const leftHip = firstLandmark[23];
              const rightHip = firstLandmark[24];

              if (leftShoulder && rightShoulder && leftHip && rightHip) {
                const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
                const hipY = (leftHip.y + rightHip.y) / 2;
                const postureScore = 100 - Math.abs(shoulderY - hipY) * 100;
                setVideoMetrics(prev => ({...prev, posture: Math.max(0, Math.min(100, postureScore))}));
              }
            }

            // Throttle WebSocket sends to reduce network load (send every 5th frame)
            const timeSinceLastSend = now - lastWebSocketSendRef.current;
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && results.landmarks && timeSinceLastSend > 200) {
              lastWebSocketSendRef.current = now;
              // Send landmarks data (much smaller than full frame)
              sendMessage({
                type: 'video_data',
                landmarks: results.landmarks.map(landmark => ({
                  x: landmark.x,
                  y: landmark.y,
                  z: landmark.z,
                  visibility: landmark.visibility
                })),
                width: video.videoWidth || 1280,
                height: video.videoHeight || 720,
                timestamp: Date.now()
              });
            }
          }

          if (shouldDraw) {
            context.restore();
          }
          
          frameSkipCountRef.current = 0; // Reset after processing
        } catch (detectionError) {
          mediaPipeErrorCountRef.current++;
          console.error('❌ Error in pose detection:', detectionError);
          
          // If we get too many consecutive errors, stop the loop to prevent spam
          if (mediaPipeErrorCountRef.current > 10) {
            console.error('❌ Too many MediaPipe errors, stopping pose detection');
            setLiveFeedback(prev => [...prev, {
              type: 'error',
              message: 'MediaPipe pose detection encountered errors. Please refresh the page.',
              priority: 'high',
              timestamp: Date.now()
            }]);
            setIsAnalyzing(false);
            return;
          }
          
          // For timestamp errors, try to reset the timestamp counter
          if (detectionError.message && detectionError.message.includes('timestamp')) {
            console.warn('⚠️ Resetting MediaPipe timestamp counter due to timestamp error');
            frameTimestampRef.current = Math.floor(performance.now() * 1000);
          }
        }
      }

      if (isAnalyzing) {
        requestAnimationFrame(predictWebcam);
      }
    } catch (error) {
      console.error('❌ Error in predictWebcam:', error);
      mediaPipeErrorCountRef.current++;
      
      if (mediaPipeErrorCountRef.current > 10) {
        console.error('❌ Too many errors in predictWebcam, stopping');
        isAnalyzingRef.current = false;
        setIsAnalyzing(false);
        return;
      }
      
      if (isAnalyzing) {
        requestAnimationFrame(predictWebcam);
      }
    }
  }, [isAnalyzing, poseLandmarker, drawingUtils, sendMessage]);

  // Keep refs in sync with state
  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);
  
  useEffect(() => {
    sessionStartedRef.current = sessionStarted;
  }, [sessionStarted]);

  // Store predictWebcam in ref so setupVideoAnalysis can access it
  useEffect(() => {
    predictWebcamRef.current = predictWebcam;
  }, [predictWebcam]);

  // Start predictWebcam loop when analysis starts
  useEffect(() => {
    if (isAnalyzing && videoRef.current && poseLandmarker && drawingUtils) {
      const video = videoRef.current;
      // Wait for video to be ready, then start the loop
      const checkAndStart = () => {
        if (video.readyState >= 2 && !video.paused) {
          console.log('🎬 Starting predictWebcam loop');
          predictWebcam();
        } else if (isAnalyzing) {
          // Video not ready yet, try again
          setTimeout(checkAndStart, 100);
        }
      };
      
      if (video.readyState >= 2) {
        checkAndStart();
      } else {
        video.addEventListener('loadeddata', checkAndStart, { once: true });
        video.addEventListener('playing', checkAndStart, { once: true });
      }
    }
  }, [isAnalyzing, poseLandmarker, drawingUtils, predictWebcam]);

  // Start analysis session
  const startAnalysis = useCallback(async () => {
    try {
      // Reset MediaPipe state for new session
      frameTimestampRef.current = Math.floor(performance.now() * 1000);
      mediaPipeErrorCountRef.current = 0;
      lastFrameTimeRef.current = 0;
      lastVideoTimeRef.current = -1;
      
      setIsAnalyzing(true);
      setSessionStarted(true);
      // Update refs immediately
      isAnalyzingRef.current = true;
      sessionStartedRef.current = true;
      
      setSessionDuration(0);
      setLiveFeedback([]);
      setFeedbackHistory([]);
      
      await initializeMediaStreams();
      startSessionTimer();
      
      // Start periodic analysis
      analysisIntervalRef.current = setInterval(() => {
        sendMessage({ type: 'request_feedback' });
      }, 2000);
      
      console.log('🎯 Real-time analysis started');
    } catch (error) {
      console.error('❌ Failed to start analysis:', error);
      setIsAnalyzing(false);
      setSessionStarted(false);
      isAnalyzingRef.current = false;
      sessionStartedRef.current = false;
    }
  }, [initializeMediaStreams, startSessionTimer, sendMessage]);

  // Stop analysis session
  const stopAnalysis = useCallback(() => {
    // Update refs first
    isAnalyzingRef.current = false;
    sessionStartedRef.current = false;
    
    setIsAnalyzing(false);
    setIsRecording(false);
    setSessionStarted(false);
    
    stopSessionTimer();
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    
    // Stop media streams
    if (audioStream) {
      audioStream.getTracks().forEach(track => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      });
      setAudioStream(null);
    }
    
    if (videoStream) {
      videoStream.getTracks().forEach(track => {
        track.stop();
        console.log(`🛑 Stopped ${track.kind} track`);
      });
      setVideoStream(null);
    }
    
    // Clean up keep-alive mechanisms
    if (videoRef.current) {
      const video = videoRef.current;
      if (video.dataset) {
        if (video.dataset.keepAliveAnimationFrame) {
          cancelAnimationFrame(parseInt(video.dataset.keepAliveAnimationFrame));
        }
        if (video.dataset.keepAliveInterval) {
          clearInterval(parseInt(video.dataset.keepAliveInterval));
        }
        if (video.dataset.preventTrackEndInterval) {
          clearInterval(parseInt(video.dataset.preventTrackEndInterval));
        }
      }
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Request session summary
    sendMessage({ type: 'request_session_summary' });
    
    console.log('🏁 Real-time analysis stopped');
  }, [audioStream, videoStream, stopSessionTimer, sendMessage]);

  // Toggle recording
  const toggleRecording = useCallback(() => {
    if (!sessionStarted) {
      startAnalysis();
    } else if (isAnalyzing) {
      isAnalyzingRef.current = false;
      setIsAnalyzing(false);
      setIsRecording(false);
    } else {
      isAnalyzingRef.current = true;
      setIsAnalyzing(true);
      setIsRecording(true);
    }
  }, [sessionStarted, isAnalyzing, startAnalysis]);

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get metric color
  const getMetricColor = (value, thresholds = { good: 80, okay: 60 }) => {
    if (value >= thresholds.good) return 'text-green-600';
    if (value >= thresholds.okay) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get feedback priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 border-red-200 text-red-800';
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low': return 'bg-orange-100 border-orange-200 text-orange-800';
      default: return 'bg-white border-gray-300 text-gray-700';
    }
  };

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'speech', label: 'Speech Analysis', icon: Mic },
    { id: 'video', label: 'Video Analysis', icon: Video },
    { id: 'feedback', label: 'Live Feedback', icon: MessageSquare },
    { id: 'history', label: 'Session History', icon: Clock }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Real-Time Analysis</h1>
                <p className="text-sm text-gray-600">AI Communication Coach</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Session Duration */}
              {sessionStarted && (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg border border-orange-200">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatDuration(sessionDuration)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl p-1 border border-orange-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Video Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Feed - Transparent Panel */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
              <div className="relative aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  loop={false}
                  className={`w-full h-full object-cover ${videoEnabled ? 'block' : 'hidden'}`}
                  style={{ transform: 'scaleX(-1)' }} // Mirror the video
                  onPlay={() => {
                    console.log('✅ Video element started playing', {
                      videoWidth: videoRef.current?.videoWidth,
                      videoHeight: videoRef.current?.videoHeight,
                      hasStream: !!videoRef.current?.srcObject
                    });
                  }}
                  onPause={() => {
                    console.warn('⚠️ Video element paused', {
                      hasStream: !!videoRef.current?.srcObject,
                      isAnalyzing: isAnalyzingRef.current
                    });
                    // Try to resume if analysis is still active
                    if (isAnalyzingRef.current && videoRef.current && videoRef.current.srcObject) {
                      const tracks = videoRef.current.srcObject.getTracks();
                      const videoTrack = tracks.find(t => t.kind === 'video');
                      if (videoTrack && videoTrack.readyState === 'live') {
                        videoRef.current.play().catch(err => {
                          console.error('❌ Failed to resume video:', err);
                        });
                      }
                    }
                  }}
                  onEnded={() => {
                    console.warn('⚠️ Video element ended', {
                      hasStream: !!videoRef.current?.srcObject,
                      isAnalyzing: isAnalyzingRef.current
                    });
                    // This shouldn't happen with a live stream, but handle it
                    if (isAnalyzingRef.current && videoRef.current && videoRef.current.srcObject) {
                      const tracks = videoRef.current.srcObject.getTracks();
                      const videoTrack = tracks.find(t => t.kind === 'video');
                      if (videoTrack && videoTrack.readyState === 'live') {
                        videoRef.current.play().catch(err => {
                          console.error('❌ Failed to restart video:', err);
                        });
                      }
                    }
                  }}
                  onLoadedMetadata={() => {
                    console.log('✅ Video metadata loaded', {
                      videoWidth: videoRef.current?.videoWidth,
                      videoHeight: videoRef.current?.videoHeight,
                      hasStream: !!videoRef.current?.srcObject
                    });
                  }}
                  onLoadedData={() => {
                    console.log('✅ Video data loaded', {
                      readyState: videoRef.current?.readyState,
                      paused: videoRef.current?.paused
                    });
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ transform: 'scaleX(-1)' }} // Mirror the canvas to match video
                />
                
                {!videoEnabled && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 via-pink-50/50 to-orange-50/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <CameraOff className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Video disabled</p>
                    </div>
                  </div>
                )}
                
                {/* Video Overlay - Transparent badges */}
                {isAnalyzing && (
                  <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-red-500/90 backdrop-blur-sm text-white rounded-full text-xs font-medium shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>REC</span>
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-orange-500/90 to-pink-500/90 backdrop-blur-sm text-white rounded-full text-xs font-medium shadow-lg">
                      <Brain className="w-3 h-3" />
                      <span>AI</span>
                    </div>
                  </div>
                )}
                
                {/* Live Metrics Overlay - Bottom right */}
                {isAnalyzing && (
                  <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md rounded-xl p-3 border border-white/30 shadow-lg z-10">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-white">
                        <div className="text-white/70">Eye Contact</div>
                        <div className="font-bold text-white">{Math.round(videoMetrics.eyeContact)}%</div>
                      </div>
                      <div className="text-white">
                        <div className="text-white/70">Clarity</div>
                        <div className="font-bold text-white">{Math.round(speechMetrics.clarity)}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {selectedTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Key Metrics */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                        <span className={`text-2xl font-bold ${getMetricColor(videoMetrics.eyeContact)}`}>
                          {Math.round(videoMetrics.eyeContact)}%
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Eye Contact</h3>
                      <p className="text-sm text-gray-600">Maintaining audience connection</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Activity className="w-6 h-6 text-white" />
                        </div>
                        <span className={`text-2xl font-bold ${getMetricColor(speechMetrics.clarity)}`}>
                          {Math.round(speechMetrics.clarity)}%
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Speech Clarity</h3>
                      <p className="text-sm text-gray-600">Clear and understandable speech</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <span className={`text-2xl font-bold ${getMetricColor(videoMetrics.posture)}`}>
                          {Math.round(videoMetrics.posture)}%
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Posture</h3>
                      <p className="text-sm text-gray-600">Body alignment and presence</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <span className={`text-2xl font-bold ${getMetricColor(videoMetrics.engagement)}`}>
                          {Math.round(videoMetrics.engagement)}%
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Engagement</h3>
                      <p className="text-sm text-gray-600">Overall presentation engagement</p>
                    </div>
                  </div>

                  {/* Recent Feedback */}
                  {liveFeedback.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                        Recent Feedback
                      </h3>
                      <div className="space-y-3">
                        {liveFeedback.slice(-3).map((feedback, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-gradient-to-r from-orange-50/50 to-pink-50/50 rounded-lg border border-orange-100">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <div>
                              <p className="text-sm text-gray-900">{feedback.message}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                                  {feedback.priority}
                                </span>
                                <span className="text-xs text-gray-500">{feedback.category}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {selectedTab === 'speech' && (
                <motion.div
                  key="speech"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Speech Metrics */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Speech Quality</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Clarity</span>
                            <span className={`text-sm font-bold ${getMetricColor(speechMetrics.clarity)}`}>
                              {Math.round(speechMetrics.clarity)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${speechMetrics.clarity}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Volume</span>
                            <span className={`text-sm font-bold ${getMetricColor(speechMetrics.volume)}`}>
                              {Math.round(speechMetrics.volume)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${speechMetrics.volume}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Pace</span>
                            <span className="text-sm font-bold text-gray-900">
                              {Math.round(speechMetrics.pace)} WPM
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, (speechMetrics.pace / 200) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Speech Analysis</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Filler Words</span>
                          <span className={`text-sm font-bold ${speechMetrics.fillerWords > 5 ? 'text-red-600' : 'text-green-600'}`}>
                            {speechMetrics.fillerWords.toFixed(1)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Confidence</span>
                          <span className={`text-sm font-bold ${getMetricColor(speechMetrics.confidence)}`}>
                            {Math.round(speechMetrics.confidence)}%
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Sentiment</span>
                          <span className="text-sm font-bold text-gray-900 capitalize">
                            {speechMetrics.sentiment}
                          </span>
                        </div>
                      </div>  
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'video' && (
                <motion.div
                  key="video"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Video Metrics */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Body Language</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Eye Contact</span>
                            <span className={`text-sm font-bold ${getMetricColor(videoMetrics.eyeContact)}`}>
                              {Math.round(videoMetrics.eyeContact)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${videoMetrics.eyeContact}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Posture</span>
                            <span className={`text-sm font-bold ${getMetricColor(videoMetrics.posture)}`}>
                              {Math.round(videoMetrics.posture)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${videoMetrics.posture}%` }}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Gestures</span>
                            <span className={`text-sm font-bold ${getMetricColor(videoMetrics.gestures)}`}>
                              {Math.round(videoMetrics.gestures)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${videoMetrics.gestures}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Facial Expressions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(videoMetrics.facialExpressions).map(([emotion, score]) => (
                          <div key={emotion} className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {Math.round(score * 100)}%
                            </div>
                            <div className="text-xs text-gray-600 capitalize">{emotion}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {selectedTab === 'feedback' && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Live Feedback */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                      Live Feedback
                    </h3>
                    
                    {liveFeedback.length > 0 ? (
                      <div className="space-y-4">
                        {liveFeedback.map((feedback, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-4 border border-gray-200 rounded-xl"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${
                                feedback.priority === 'high' ? 'bg-red-500' :
                                feedback.priority === 'medium' ? 'bg-yellow-500' : 'bg-gradient-to-r from-orange-500 to-pink-500'
                              }`}></div>
                              <div className="flex-1">
                                <p className="text-gray-900 mb-2">{feedback.message}</p>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                                    {feedback.priority}
                                  </span>
                                  <span className="text-xs text-gray-500">{feedback.category}</span>
                                  <span className="text-xs text-gray-500">{feedback.type}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No feedback yet. Start analyzing to receive real-time insights!</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {selectedTab === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Session History */}
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-600" />
                      Session History
                    </h3>
                    
                    {feedbackHistory.length > 0 ? (
                      <div className="space-y-4">
                        {feedbackHistory.map((entry, index) => (
                          <div key={index} className="p-4 border border-gray-200 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-600">
                                {new Date(entry.timestamp).toLocaleTimeString()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {entry.feedback.length} feedback items
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className="text-lg font-bold text-green-600">
                                  {Math.round(entry.metrics.speech?.clarity || 0)}%
                                </div>
                                <div className="text-xs text-gray-600">Clarity</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-green-600">
                                  {Math.round(entry.metrics.video?.eyeContact || 0)}%
                                </div>
                                <div className="text-xs text-gray-600">Eye Contact</div>
                              </div>
                              <div>
                                <div className="text-lg font-bold text-green-600">
                                  {Math.round(entry.metrics.video?.engagement || 0)}%
                                </div>
                                <div className="text-xs text-gray-600">Engagement</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No session history yet. Start analyzing to build your history!</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel - Controls & Metrics */}
          <div className="space-y-6">
            {/* Session Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Session Controls</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Audio</span>
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      audioEnabled ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        audioEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Video</span>
                  <button
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      videoEnabled ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        videoEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Advanced Metrics</span>
                  <button
                    onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      showAdvancedMetrics ? 'bg-gradient-to-r from-orange-500 to-pink-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        showAdvancedMetrics ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Session Time</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatDuration(sessionDuration)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Feedback Items</span>
                  <span className="text-sm font-bold text-gray-900">
                    {liveFeedback.length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Score</span>
                  <span className={`text-sm font-bold ${getMetricColor((speechMetrics.clarity + videoMetrics.engagement) / 2)}`}>
                    {Math.round((speechMetrics.clarity + videoMetrics.engagement) / 2)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Session Summary */}
            {sessionSummary && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Session Summary</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-bold text-gray-900">
                      {formatDuration(sessionSummary.duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Clarity</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(sessionSummary.metrics.speech.averageClarity)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Avg Engagement</span>
                    <span className="text-sm font-bold text-gray-900">
                      {Math.round(sessionSummary.metrics.video.averageEngagement)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bottom Control Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 text-gray-900 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-20 space-x-4">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-red-500" />}
              <span className="text-xs mt-1">{audioEnabled ? 'Mute' : 'Unmute'}</span>
            </button>

            <button
              onClick={() => setVideoEnabled(!videoEnabled)}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6 text-red-500" />}
              <span className="text-xs mt-1">{videoEnabled ? 'Stop Video' : 'Start Video'}</span>
            </button>

            <button
              onClick={toggleRecording}
              disabled={!poseLandmarker}
              className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center space-x-2 ${
                isAnalyzing
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600'
              } ${
                !poseLandmarker && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {!poseLandmarker ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Loading AI...</span>
                </>
              ) : isAnalyzing ? (
                <>
                  <Square className="w-5 h-5" />
                  <span>Stop</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  <span>Start Analysis</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs mt-1">Settings</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
              <span className="text-xs mt-1">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedRealTimeAnalysis;
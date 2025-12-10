import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  AlertCircle,
  Settings,
  Maximize2
} from 'lucide-react';
import { MediaPipeManager, getMediaPipeManager } from '@/lib/mediapipe';
import { HeuristicsEngine } from '@/lib/heuristics';
import { AudioProcessor } from '@/lib/audio';
import { LandmarkData, FeedbackCard } from '@/types';

interface CameraCaptureProps {
  onFeedbackUpdate: (feedback: FeedbackCard[]) => void;
  onLandmarksUpdate: (landmarks: LandmarkData) => void;
  className?: string;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onFeedbackUpdate,
  onLandmarksUpdate,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaPipeManager = useRef<MediaPipeManager | null>(null);
  const heuristicsEngine = useRef<HeuristicsEngine | null>(null);
  const audioProcessor = useRef<AudioProcessor | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [deviceInfo, setDeviceInfo] = useState<{
    camera: boolean;
    microphone: boolean;
    webgl: boolean;
  }>({ camera: false, microphone: false, webgl: false });

  // Initialize components
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize MediaPipe manager
        mediaPipeManager.current = getMediaPipeManager();
        
        // Initialize heuristics engine
        heuristicsEngine.current = new HeuristicsEngine();
        
        // Initialize audio processor
        audioProcessor.current = new AudioProcessor();

        // Check device capabilities
        const camera = await checkCameraAvailability();
        const microphone = await checkMicrophoneAvailability();
        const webgl = checkWebGLSupport();

        setDeviceInfo({ camera, microphone, webgl });

        setIsInitialized(true);
        console.log('✅ Camera capture initialized');
      } catch (err) {
        console.error('❌ Failed to initialize camera capture:', err);
        setError('Failed to initialize camera and audio');
      }
    };

    initialize();

    return () => {
      cleanup();
    };
  }, []);

  // Check camera availability
  const checkCameraAvailability = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'videoinput');
    } catch {
      return false;
    }
  };

  // Check microphone availability
  const checkMicrophoneAvailability = async (): Promise<boolean> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some(device => device.kind === 'audioinput');
    } catch {
      return false;
    }
  };

  // Check WebGL support
  const checkWebGLSupport = (): boolean => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  };

  // Start camera and MediaPipe
  const startCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !mediaPipeManager.current) {
      return;
    }

    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: isAudioEnabled,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      videoRef.current.srcObject = stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = resolve;
        }
      });

      // Setup canvas
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Start MediaPipe analysis
      await mediaPipeManager.current.startAnalysis(
        video,
        canvas,
        undefined, // onResults callback
        handleLandmarks // onLandmarks callback
      );

      console.log('✅ Camera started successfully');
    } catch (err) {
      console.error('❌ Failed to start camera:', err);
      setError('Failed to access camera. Please check permissions.');
    }
  }, [isAudioEnabled]);

  // Handle landmarks from MediaPipe
  const handleLandmarks = useCallback((landmarks: LandmarkData) => {
    if (!heuristicsEngine.current) return;

    try {
      // Analyze landmarks for feedback
      const feedback = heuristicsEngine.current.analyzeLandmarks(landmarks);
      
      // Convert to feedback cards
      const feedbackCards: FeedbackCard[] = feedback.map((item, index) => ({
        id: `${item.type}_${item.timestamp}_${index}`,
        type: item.type,
        title: getFeedbackTitle(item.type),
        message: item.message,
        severity: item.severity,
        actionable_tip: item.actionable_tip,
        timestamp: item.timestamp,
        show_example: true,
        dismissible: false,
      }));

      onFeedbackUpdate(feedbackCards);
      onLandmarksUpdate(landmarks);
    } catch (err) {
      console.error('❌ Failed to process landmarks:', err);
    }
  }, [onFeedbackUpdate, onLandmarksUpdate]);

  // Get feedback title based on type
  const getFeedbackTitle = (type: string): string => {
    const titles = {
      eye_contact: 'Eye Contact',
      posture: 'Posture',
      smile: 'Smile',
      fidget: 'Hand Movement',
      gesture: 'Gestures',
    };
    return titles[type as keyof typeof titles] || 'Communication';
  };

  // Start recording
  const startRecording = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setIsRecording(true);
      
      if (isVideoEnabled) {
        await startCamera();
      }
      
      if (isAudioEnabled && audioProcessor.current) {
        await audioProcessor.current.startRecording();
      }

      // Start audio level monitoring
      if (isAudioEnabled && audioProcessor.current) {
        const monitorAudio = () => {
          if (isRecording && audioProcessor.current) {
            const level = audioProcessor.current.getAudioLevel();
            setAudioLevel(level);
            requestAnimationFrame(monitorAudio);
          }
        };
        monitorAudio();
      }

      console.log('✅ Recording started');
    } catch (err) {
      console.error('❌ Failed to start recording:', err);
      setError('Failed to start recording');
      setIsRecording(false);
    }
  }, [isInitialized, isVideoEnabled, isAudioEnabled, startCamera]);

  // Stop recording
  const stopRecording = useCallback(() => {
    try {
      setIsRecording(false);
      
      if (audioProcessor.current) {
        audioProcessor.current.stopRecording();
      }

      // Stop video stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      // Stop MediaPipe
      if (mediaPipeManager.current) {
        mediaPipeManager.current.stopAnalysis();
      }

      console.log('✅ Recording stopped');
    } catch (err) {
      console.error('❌ Failed to stop recording:', err);
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    setIsVideoEnabled(!isVideoEnabled);
    if (isRecording) {
      stopRecording();
      setTimeout(() => {
        if (isVideoEnabled) {
          startRecording();
        }
      }, 100);
    }
  }, [isVideoEnabled, isRecording, stopRecording, startRecording]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(!isAudioEnabled);
  }, [isAudioEnabled]);

  // Cleanup
  const cleanup = useCallback(() => {
    stopRecording();
    if (audioProcessor.current) {
      audioProcessor.current.cleanup();
    }
    if (mediaPipeManager.current) {
      mediaPipeManager.current.cleanup();
    }
  }, [stopRecording]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (canvasRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        canvasRef.current.requestFullscreen();
      }
    }
  }, []);

  return (
    <div className={`relative bg-gray-900 rounded-2xl overflow-hidden ${className}`}>
      {/* Video and Canvas */}
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        
        {/* Overlay UI */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
          {/* Status indicators */}
          <div className="flex items-center space-x-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isRecording ? 'bg-red-500 text-white' : 'bg-gray-600 text-white'
            }`}>
              {isRecording ? 'REC' : 'READY'}
            </div>
            {audioLevel > 0.1 && (
              <div className="flex items-center space-x-1 text-white text-xs">
                <Mic className="h-3 w-3" />
                <span>{Math.round(audioLevel * 100)}%</span>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <h3 className="font-semibold text-gray-900">Error</h3>
              </div>
              <p className="text-gray-700 text-sm mb-4">{error}</p>
              <button
                onClick={() => setError(null)}
                className="w-full bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-4">
          {/* Video toggle */}
          <button
            onClick={toggleVideo}
            disabled={!deviceInfo.camera}
            className={`p-3 rounded-xl transition-colors ${
              isVideoEnabled 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            } ${!deviceInfo.camera ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>

          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            disabled={!deviceInfo.microphone}
            className={`p-3 rounded-xl transition-colors ${
              isAudioEnabled 
                ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            } ${!deviceInfo.microphone ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>

          {/* Record/Stop button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isInitialized || (!deviceInfo.camera && !deviceInfo.microphone)}
            className={`p-4 rounded-xl transition-all ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'bg-emerald-500 text-white hover:bg-emerald-600'
            } ${(!isInitialized || (!deviceInfo.camera && !deviceInfo.microphone)) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? (
              <Square className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Device status */}
      <div className="absolute bottom-4 left-4 text-xs text-white/70">
        <div>Camera: {deviceInfo.camera ? '✅' : '❌'}</div>
        <div>Mic: {deviceInfo.microphone ? '✅' : '❌'}</div>
        <div>WebGL: {deviceInfo.webgl ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};

export default CameraCapture;

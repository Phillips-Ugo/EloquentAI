// Core types for the Communication Coach application

export interface LandmarkData {
  t: number; // timestamp
  face: number[][]; // face landmarks
  pose: number[][]; // pose landmarks
  left_hand: number[][]; // left hand landmarks
  right_hand: number[][]; // right hand landmarks
}

export interface AudioAnalysisResult {
  emotion: string;
  probabilities: Record<string, number>;
  wpm: number;
  filler_word_counts: Record<string, number>;
  suggested_replacements: Replacement[];
  timestamps: Timestamp[];
}

export interface Replacement {
  position: number;
  original: string;
  suggestion: string;
}

export interface Timestamp {
  t: number;
  type: 'filler' | 'emotion' | 'pace' | 'other';
  word?: string;
  emotion?: string;
  message?: string;
}

export interface LandmarkAnalysisResult {
  feedback: FeedbackItem[];
  aggregate_scores: AggregateScores;
}

export interface FeedbackItem {
  timestamp: number;
  type: 'eye_contact' | 'posture' | 'smile' | 'fidget' | 'gesture';
  score: number;
  message: string;
  severity: 'good' | 'warning' | 'critical';
  actionable_tip?: string;
  suggested_action?: string;
}

export interface AggregateScores {
  posture_score: number;
  eye_contact_score: number;
  fidget_score: number;
  smile_score: number;
  gesture_score?: number;
}

export interface Session {
  id: string;
  user_id?: string;
  started_at: string;
  ended_at?: string;
  device_info: DeviceInfo;
  privacy_opt_in: boolean;
  analysis_results?: {
    audio?: AudioAnalysisResult;
    landmarks?: LandmarkAnalysisResult;
  };
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  camera_available: boolean;
  microphone_available: boolean;
  webgl_support: boolean;
  mediapipe_support: boolean;
}

export interface HeuristicConfig {
  eye_contact: {
    yaw_threshold: number; // default: 15 degrees
    pitch_threshold: number; // default: 12 degrees
  };
  smile: {
    ratio_threshold: number; // default: 0.38
    lip_corner_threshold: number; // default: 0.1
  };
  posture: {
    torso_angle_warning: number; // default: 12 degrees
    torso_angle_critical: number; // default: 25 degrees
  };
  fidget: {
    velocity_threshold: number; // default: 0.18
    smoothing_window: number; // default: 30 frames
  };
  speech: {
    wpm_ideal_min: number; // default: 120
    wpm_ideal_max: number; // default: 160
    wpm_slow_threshold: number; // default: 100
    wpm_fast_threshold: number; // default: 180
  };
}

export interface FeedbackCard {
  id: string;
  type: FeedbackItem['type'];
  title: string;
  message: string;
  severity: FeedbackItem['severity'];
  actionable_tip: string;
  timestamp?: number;
  show_example?: boolean;
  dismissible: boolean;
}

export interface MediaStreamState {
  video: MediaStream | null;
  audio: MediaStream | null;
  isRecording: boolean;
  isAnalyzing: boolean;
  error: string | null;
}

export interface AnalysisState {
  currentSession: Session | null;
  feedbackCards: FeedbackCard[];
  liveMetrics: {
    eye_contact: number;
    posture: number;
    smile: number;
    fidget: number;
    emotion: string;
    wpm: number;
  };
  isProcessing: boolean;
}

// API Request/Response types
export interface AudioAnalysisRequest {
  file: File;
  user_id?: string;
  session_id?: string;
}

export interface LandmarkAnalysisRequest {
  landmarks: LandmarkData[];
  fps: number;
  user_id?: string;
}

export interface SessionFinalizeRequest {
  session_id: string;
  summary_requested: boolean;
}

export interface SessionFinalizeResponse {
  report_url?: string;
  pdf?: string; // base64 encoded
  summary?: {
    overall_score: number;
    duration: number;
    key_insights: string[];
    recommendations: string[];
  };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Configuration types
export interface AppConfig {
  apiBaseUrl: string;
  mediapipeModelPath: string;
  maxFileSize: number; // in bytes
  supportedAudioFormats: string[];
  supportedVideoFormats: string[];
  heuristics: HeuristicConfig;
}

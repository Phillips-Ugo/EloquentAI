import { AppConfig, HeuristicConfig } from '@/types';

export const defaultHeuristics: HeuristicConfig = {
  eye_contact: {
    yaw_threshold: 15, // degrees
    pitch_threshold: 12, // degrees
  },
  smile: {
    ratio_threshold: 0.38,
    lip_corner_threshold: 0.1,
  },
  posture: {
    torso_angle_warning: 12, // degrees
    torso_angle_critical: 25, // degrees
  },
  fidget: {
    velocity_threshold: 0.18,
    smoothing_window: 30, // frames
  },
  speech: {
    wpm_ideal_min: 120,
    wpm_ideal_max: 160,
    wpm_slow_threshold: 100,
    wpm_fast_threshold: 180,
  },
};

export const appConfig: AppConfig = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  mediapipeModelPath: '/models',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  supportedAudioFormats: ['audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac'],
  supportedVideoFormats: ['video/mp4', 'video/webm', 'video/avi', 'video/mov'],
  heuristics: defaultHeuristics,
};

export const API_ENDPOINTS = {
  AUDIO_ANALYSIS: '/api/predict/audio',
  LANDMARK_ANALYSIS: '/api/analyze/landmarks',
  SESSION_FINALIZE: '/api/session/finalize',
  HEALTH: '/api/health',
} as const;

export const FEEDBACK_SEVERITY_COLORS = {
  good: 'text-green-600 bg-green-50 border-green-200',
  warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  critical: 'text-red-600 bg-red-50 border-red-200',
} as const;

export const EMOTION_COLORS = {
  confident: 'text-blue-600 bg-blue-50',
  neutral: 'text-gray-600 bg-gray-50',
  anxious: 'text-orange-600 bg-orange-50',
  excited: 'text-purple-600 bg-purple-50',
  calm: 'text-green-600 bg-green-50',
  frustrated: 'text-red-600 bg-red-50',
} as const;

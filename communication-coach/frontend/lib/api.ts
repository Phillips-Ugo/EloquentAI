import { 
  AudioAnalysisResult, 
  LandmarkAnalysisResult, 
  SessionFinalizeResponse,
  AudioAnalysisRequest,
  LandmarkAnalysisRequest,
  SessionFinalizeRequest,
  ApiError 
} from '@/types';
import { appConfig, API_ENDPOINTS } from './config';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || appConfig.apiBaseUrl;
  }

  /**
   * Analyze audio file for emotion, speech rate, and filler words
   */
  public async analyzeAudio(request: AudioAnalysisRequest): Promise<AudioAnalysisResult> {
    try {
      const formData = new FormData();
      formData.append('file', request.file);
      
      if (request.user_id) {
        formData.append('user_id', request.user_id);
      }
      if (request.session_id) {
        formData.append('session_id', request.session_id);
      }

      const response = await this.makeRequest(
        `${this.baseUrl}${API_ENDPOINTS.AUDIO_ANALYSIS}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      return response;
    } catch (error) {
      console.error('Audio analysis failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Analyze landmark data for posture, eye contact, etc.
   */
  public async analyzeLandmarks(request: LandmarkAnalysisRequest): Promise<LandmarkAnalysisResult> {
    try {
      const response = await this.makeRequest(
        `${this.baseUrl}${API_ENDPOINTS.LANDMARK_ANALYSIS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      return response;
    } catch (error) {
      console.error('Landmark analysis failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Finalize session and generate report
   */
  public async finalizeSession(request: SessionFinalizeRequest): Promise<SessionFinalizeResponse> {
    try {
      const response = await this.makeRequest(
        `${this.baseUrl}${API_ENDPOINTS.SESSION_FINALIZE}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        }
      );

      return response;
    } catch (error) {
      console.error('Session finalization failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Check API health
   */
  public async checkHealth(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.makeRequest(
        `${this.baseUrl}${API_ENDPOINTS.HEALTH}`,
        {
          method: 'GET',
        }
      );

      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Make HTTP request with error handling
   */
  private async makeRequest(url: string, options: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): ApiError {
    if (error instanceof Error) {
      return {
        code: 'API_ERROR',
        message: error.message,
        details: { originalError: error },
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
      details: { error },
    };
  }

  /**
   * Mock API responses for development/testing
   */
  public async mockAnalyzeAudio(request: AudioAnalysisRequest): Promise<AudioAnalysisResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock response based on file name or content
    const mockEmotions = ['confident', 'neutral', 'anxious', 'excited', 'calm'];
    const mockEmotion = mockEmotions[Math.floor(Math.random() * mockEmotions.length)];
    
    return {
      emotion: mockEmotion,
      probabilities: {
        confident: 0.72,
        neutral: 0.14,
        anxious: 0.08,
        excited: 0.04,
        calm: 0.02,
      },
      wpm: Math.floor(Math.random() * 60) + 120, // 120-180 WPM
      filler_word_counts: {
        um: Math.floor(Math.random() * 5),
        like: Math.floor(Math.random() * 3),
        so: Math.floor(Math.random() * 2),
      },
      suggested_replacements: [
        { position: 10, original: 'um', suggestion: '(pause)' },
        { position: 25, original: 'like', suggestion: '(remove)' },
      ],
      timestamps: [
        { t: 2.1, type: 'filler', word: 'um' },
        { t: 5.3, type: 'filler', word: 'like' },
        { t: 8.7, type: 'emotion', emotion: mockEmotion },
      ],
    };
  }

  public async mockAnalyzeLandmarks(request: LandmarkAnalysisRequest): Promise<LandmarkAnalysisResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockFeedback = [
      {
        timestamp: 0.04,
        type: 'eye_contact' as const,
        score: 0.85,
        message: 'Good eye contact maintained',
        severity: 'good' as const,
        actionable_tip: 'Keep looking at the camera or audience',
      },
      {
        timestamp: 0.08,
        type: 'posture' as const,
        score: 0.78,
        message: 'Slight posture deviation detected',
        severity: 'warning' as const,
        actionable_tip: 'Straighten your back slightly',
      },
      {
        timestamp: 0.12,
        type: 'smile' as const,
        score: 0.65,
        message: 'Consider smiling more',
        severity: 'warning' as const,
        actionable_tip: 'A genuine smile can make you appear more confident',
      },
    ];

    return {
      feedback: mockFeedback,
      aggregate_scores: {
        posture_score: 0.78,
        eye_contact_score: 0.85,
        fidget_score: 0.23,
        smile_score: 0.65,
      },
    };
  }

  public async mockFinalizeSession(request: SessionFinalizeRequest): Promise<SessionFinalizeResponse> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      report_url: `https://example.com/reports/${request.session_id}.pdf`,
      summary: {
        overall_score: 0.78,
        duration: 120, // 2 minutes
        key_insights: [
          'Good eye contact maintained throughout',
          'Consider reducing filler words',
          'Posture could be improved',
          'Speaking rate is optimal',
        ],
        recommendations: [
          'Practice maintaining eye contact during longer presentations',
          'Work on reducing "um" and "like" usage',
          'Focus on keeping shoulders back and spine straight',
          'Continue the good work on speaking pace',
        ],
      },
    };
  }

  public async mockCheckHealth(): Promise<{ status: string; timestamp: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}

// Singleton instance
let apiClientInstance: ApiClient | null = null;

export const getApiClient = (): ApiClient => {
  if (!apiClientInstance) {
    apiClientInstance = new ApiClient();
  }
  return apiClientInstance;
};

export default ApiClient;

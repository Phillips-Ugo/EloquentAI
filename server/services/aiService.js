const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class AIService {
  constructor() {
    // HARDCODED API KEYS (for development)
    this.azureSpeechKey = process.env.AZURE_SPEECH_KEY || 'dummy-azure-speech-key-123456789';
    this.azureSpeechRegion = process.env.AZURE_SPEECH_REGION || 'eastus';
    
    this.googleCloudKey = process.env.GOOGLE_CLOUD_KEY || 'dummy-google-cloud-key-123456789';
    
    this.analysisCache = new Map();
    this.maxCacheSize = 1000;
  }

  async analyzeText(text, options = {}) {
    console.warn('AI service is not available. Returning fallback analysis.');
    return this.getFallbackTextAnalysis(text);
  }

  async transcribeAudio(audioFilePath, options = {}) {
    console.warn('AI service is not available. Returning fallback transcription.');
    return this.getFallbackTranscription();
  }

  async analyzeSpeech(transcription, audioMetadata = {}) {
    console.warn('AI service is not available. Returning fallback speech analysis.');
    return this.getFallbackSpeechAnalysis();
  }

  async analyzeVideo(videoFilePath, options = {}) {
    console.warn('AI service is not available. Returning fallback video analysis.');
    return this.getFallbackVideoAnalysis();
  }

  async generateInsights(analysis, type = 'comprehensive') {
    console.warn('AI service is not available. Returning fallback insights.');
    return this.getFallbackInsights();
  }

  buildTextAnalysisPrompt(text, options = {}) {
    return '';
  }

  parseTextAnalysis(response) {
    return this.getFallbackTextAnalysis();
  }

  buildInsightPrompt(analysis, type) {
    return '';
  }

  parseInsights(response) {
    return this.getFallbackInsights();
  }

  calculateSpeakingPace(transcription) {
    if (!transcription.words || !transcription.duration) {
      return 150; // Default words per minute
    }
    
    const wordCount = transcription.words.length;
    const durationMinutes = transcription.duration / 60000;
    
    return Math.round(wordCount / durationMinutes);
  }

  analyzePauses(words) {
    if (!words || words.length < 2) {
      return { average: 0.5, total: 0, distribution: 'normal' };
    }
    
    const pauses = [];
    for (let i = 1; i < words.length; i++) {
      const pause = words[i].Offset - (words[i-1].Offset + words[i-1].Duration);
      if (pause > 100) { // Pause longer than 100ms
        pauses.push(pause);
      }
    }
    
    const averagePause = pauses.length > 0 ? pauses.reduce((a, b) => a + b, 0) / pauses.length : 0;
    
    return {
      average: averagePause / 1000, // Convert to seconds
      total: pauses.length,
      distribution: averagePause > 1000 ? 'frequent' : 'normal'
    };
  }

  analyzeFillers(text) {
    const fillerWords = ['um', 'uh', 'like', 'you know', 'so', 'well', 'actually', 'basically'];
    const words = text.toLowerCase().split(/\s+/);
    
    const fillers = words.filter(word => fillerWords.includes(word));
    const fillerRate = (fillers.length / words.length) * 100;
    
    return {
      count: fillers.length,
      rate: fillerRate,
      level: fillerRate > 5 ? 'high' : fillerRate > 2 ? 'medium' : 'low'
    };
  }

  generateRealisticMetric(min, max) {
    return Math.round(Math.random() * (max - min) + min);
  }

  cacheResult(key, result) {}

  getFallbackTextAnalysis(text = '') {
    return {
      overallScore: 85,
      clarity: 88,
      engagement: 82,
      structure: 85,
      tone: 87,
      strengths: [
        'Clear and concise communication',
        'Good structure and organization',
        'Appropriate tone for the audience'
      ],
      improvements: [
        'Consider adding more engaging elements',
        'Include more specific examples',
        'Enhance emotional connection with audience'
      ],
      insights: [
        {
          type: 'success',
          message: 'Communication demonstrates strong clarity and structure',
          impact: 'high',
          category: 'clarity'
        },
        {
          type: 'info',
          message: 'Consider adding more interactive elements to increase engagement',
          impact: 'medium',
          category: 'engagement'
        }
      ],
      recommendations: [
        'Practice varying your tone to maintain audience interest',
        'Include more personal stories or examples',
        'Consider adding visual aids to support your message'
      ],
      summary: 'Solid communication with room for enhanced engagement and emotional connection.'
    };
  }

  getFallbackTranscription() {
    return {
      text: 'This is a demo transcription. In a real implementation, this would be the actual transcribed text from your audio file.',
      confidence: 0.85,
      duration: 45000,
      words: [],
      language: 'en-US'
    };
  }

  getFallbackSpeechAnalysis() {
    return {
      ...this.getFallbackTextAnalysis(),
      speechMetrics: {
        pace: 145,
        clarity: 85,
        pauses: { average: 0.8, total: 12, distribution: 'normal' },
        fillers: { count: 8, rate: 3.2, level: 'medium' },
        volume: 0.75,
        pitch: 0.6
      }
    };
  }

  getFallbackVideoAnalysis() {
    return {
      overallScore: 82,
      metrics: {
        eyeContact: 88,
        posture: 85,
        gestures: 78,
        energy: 83,
        confidence: 87
      },
      insights: [
        {
          type: 'success',
          message: 'Strong presence and confidence demonstrated',
          impact: 'high',
          category: 'presence'
        },
        {
          type: 'warning',
          message: 'Consider using more hand gestures to emphasize points',
          impact: 'medium',
          category: 'body_language'
        }
      ],
      recommendations: [
        'Practice using hand gestures to emphasize key points',
        'Maintain the strong eye contact you demonstrated',
        'Consider varying your speaking pace for better engagement'
      ],
      timestamp: new Date().toISOString(),
      processingTime: 1500
    };
  }

  getFallbackInsights() {
    return {
      keyInsights: [
        'Communication shows strong foundational skills',
        'Opportunities exist for enhanced engagement',
        'Structure and clarity are well-developed'
      ],
      actionItems: [
        'Practice incorporating more interactive elements',
        'Work on varying tone and pace',
        'Develop personal examples to strengthen connection'
      ],
      nextSteps: [
        'Schedule follow-up analysis in 2 weeks',
        'Focus on implementing gesture techniques',
        'Practice with different audience types'
      ],
      resources: [
        'Public speaking best practices guide',
        'Gesture and body language techniques',
        'Audience engagement strategies'
      ]
    };
  }
}

module.exports = new AIService();
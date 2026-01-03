/**
 * Standardizes analysis response formats
 * Ensures all analysis types return consistent data structures
 */

/**
 * Transform Python analysis result to standard format
 * Handles both camelCase (from text_analyzer.py) and snake_case (from audio/video analyzers)
 */
function transformAnalysisResult(result, analysisType = 'text') {
  if (!result || typeof result !== 'object') {
    throw new Error('Invalid analysis result: result must be an object');
  }

  // Standard response format (camelCase for consistency with frontend)
  const standardized = {
    overallScore: result.overallScore || result.overall_score || result.overall || 0,
    strengths: result.strengths || [],
    improvements: result.improvements || [],
    suggestions: result.suggestions || [],
    categories: result.categories || {},
    detailedAnalysis: result.detailedAnalysis || result.detailed_analysis || {},
    _source: result._source || 'unknown',
    _analysisType: analysisType
  };

  // Type-specific fields
  if (analysisType === 'text' || analysisType === 'audio') {
    standardized.clarity_score = result.clarity_score || result.clarityScore || 0;
    standardized.pace_score = result.pace_score || result.paceScore || 0;
    standardized.sentiment_score = result.sentiment_score || result.sentimentScore || 0;
    standardized.engagement_score = result.engagement_score || result.engagementScore || 0;
    
    if (analysisType === 'audio') {
      standardized.audioMetrics = result.audioMetrics || result.audio_metrics || {};
      standardized.filler_words = result.filler_words || result.fillerWords || {};
      standardized.transcript = result.transcript || '';
    }
  }

  if (analysisType === 'video') {
    standardized.posture_score = result.posture_score || result.postureScore || result.posture || 0;
    standardized.eye_contact_score = result.eye_contact_score || result.eyeContactScore || result.eye_contact || 0;
    standardized.gesture_score = result.gesture_score || result.gestureScore || result.gestures || 0;
    standardized.movement_score = result.movement_score || result.movementScore || result.movement || 0;
    standardized.videoMetrics = result.videoMetrics || result.video_metrics || {};
  }

  // Validate required fields
  if (!standardized.strengths || standardized.strengths.length === 0) {
    throw new Error('Analysis result missing required field: strengths');
  }
  if (!standardized.improvements || standardized.improvements.length === 0) {
    throw new Error('Analysis result missing required field: improvements');
  }
  if (!standardized.suggestions || standardized.suggestions.length === 0) {
    throw new Error('Analysis result missing required field: suggestions');
  }
  if (standardized.overallScore === 0 && !standardized._source) {
    throw new Error('Analysis result appears invalid: overallScore is 0 and no source indicator');
  }

  return standardized;
}

module.exports = {
  transformAnalysisResult
};

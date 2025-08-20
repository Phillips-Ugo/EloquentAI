from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SpeechAnalysisRequest(BaseModel):
    """Request model for speech analysis"""
    file_path: str = Field(..., description="Path to the audio file")
    include_transcript: bool = Field(default=True, description="Whether to include transcription")
    analyze_emotion: bool = Field(default=True, description="Whether to analyze emotional tone")

class SpeechAnalysisResponse(BaseModel):
    """Response model for speech analysis results"""
    
    # Basic information
    file_name: str = Field(..., description="Original filename")
    duration_seconds: float = Field(..., description="Audio duration in seconds")
    
    # Transcription
    transcript: Optional[str] = Field(None, description="Speech-to-text transcription")
    confidence_score: Optional[float] = Field(None, description="Transcription confidence (0-1)")
    
    # Speech metrics
    speaking_rate: float = Field(..., description="Words per minute")
    pause_frequency: float = Field(..., description="Number of pauses per minute")
    average_pause_duration: float = Field(..., description="Average pause duration in seconds")
    
    # Clarity and pronunciation
    clarity_score: float = Field(..., description="Overall clarity score (0-100)")
    pronunciation_score: float = Field(..., description="Pronunciation quality (0-100)")
    
    # Filler words
    filler_words: List[str] = Field(default_factory=list, description="Detected filler words")
    filler_word_count: int = Field(..., description="Total number of filler words")
    filler_word_frequency: float = Field(..., description="Filler words per minute")
    
    # Tone and emotion
    emotional_tone: Optional[str] = Field(None, description="Detected emotional tone")
    confidence_level: Optional[str] = Field(None, description="Confidence level in speech")
    enthusiasm_score: Optional[float] = Field(None, description="Enthusiasm level (0-100)")
    
    # Volume and pitch analysis
    volume_consistency: float = Field(..., description="Volume consistency score (0-100)")
    pitch_variation: float = Field(..., description="Pitch variation score (0-100)")
    average_volume: float = Field(..., description="Average volume level (dB)")
    
    # Recommendations
    recommendations: List[str] = Field(default_factory=list, description="Improvement recommendations")
    overall_score: float = Field(..., description="Overall speech quality score (0-100)")
    
    # Metadata
    analysis_timestamp: datetime = Field(default_factory=datetime.now, description="When analysis was performed")
    processing_time_seconds: float = Field(..., description="Time taken to process the analysis")

class FillerWord(BaseModel):
    """Model for individual filler word detection"""
    word: str = Field(..., description="The filler word")
    count: int = Field(..., description="Number of occurrences")
    timestamp: Optional[float] = Field(None, description="When it occurred in the audio")

class Recommendation(BaseModel):
    """Model for improvement recommendations"""
    category: str = Field(..., description="Category of recommendation")
    title: str = Field(..., description="Recommendation title")
    description: str = Field(..., description="Detailed description")
    priority: str = Field(..., description="Priority level (high, medium, low)")
    actionable: bool = Field(..., description="Whether the recommendation is actionable") 
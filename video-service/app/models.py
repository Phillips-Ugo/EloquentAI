from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class VideoAnalysisRequest(BaseModel):
    """Request model for video analysis"""
    file_path: str = Field(..., description="Path to the video file")
    analyze_posture: bool = Field(default=True, description="Whether to analyze posture")
    analyze_gestures: bool = Field(default=True, description="Whether to analyze hand gestures")
    analyze_eye_contact: bool = Field(default=True, description="Whether to analyze eye contact")

class VideoAnalysisResponse(BaseModel):
    """Response model for video analysis results"""
    
    # Basic information
    file_name: str = Field(..., description="Original filename")
    duration_seconds: float = Field(..., description="Video duration in seconds")
    frame_count: int = Field(..., description="Total number of frames analyzed")
    
    # Posture analysis
    posture_score: float = Field(..., description="Overall posture quality (0-100)")
    shoulder_alignment: float = Field(..., description="Shoulder alignment score (0-100)")
    spine_position: float = Field(..., description="Spine position score (0-100)")
    head_position: float = Field(..., description="Head position score (0-100)")
    
    # Gesture analysis
    gesture_score: float = Field(..., description="Hand gesture effectiveness (0-100)")
    hand_movement_frequency: float = Field(..., description="Hand movements per minute")
    excessive_gestures: int = Field(..., description="Number of excessive/distracting gestures")
    gesture_variety: float = Field(..., description="Gesture variety score (0-100)")
    
    # Eye contact analysis
    eye_contact_score: float = Field(..., description="Eye contact effectiveness (0-100)")
    eye_contact_percentage: float = Field(..., description="Percentage of time maintaining eye contact")
    gaze_direction: str = Field(..., description="Primary gaze direction")
    eye_contact_consistency: float = Field(..., description="Eye contact consistency (0-100)")
    
    # Movement analysis
    movement_score: float = Field(..., description="Overall movement quality (0-100)")
    excessive_movement: int = Field(..., description="Number of excessive movements")
    movement_smoothness: float = Field(..., description="Movement smoothness score (0-100)")
    fidgeting_detected: bool = Field(..., description="Whether fidgeting was detected")
    
    # Professional presence
    professional_presence_score: float = Field(..., description="Overall professional presence (0-100)")
    confidence_level: str = Field(..., description="Detected confidence level")
    engagement_score: float = Field(..., description="Audience engagement potential (0-100)")
    
    # Detailed metrics
    posture_issues: List[str] = Field(default_factory=list, description="Detected posture issues")
    gesture_recommendations: List[str] = Field(default_factory=list, description="Gesture improvement suggestions")
    eye_contact_issues: List[str] = Field(default_factory=list, description="Eye contact issues")
    
    # Recommendations
    recommendations: List[str] = Field(default_factory=list, description="Overall improvement recommendations")
    overall_score: float = Field(..., description="Overall presentation quality score (0-100)")
    
    # Metadata
    analysis_timestamp: datetime = Field(default_factory=datetime.now, description="When analysis was performed")
    processing_time_seconds: float = Field(..., description="Time taken to process the analysis")

class PostureMetrics(BaseModel):
    """Detailed posture metrics"""
    shoulder_angle: float = Field(..., description="Shoulder angle in degrees")
    spine_curvature: float = Field(..., description="Spine curvature measurement")
    head_tilt: float = Field(..., description="Head tilt angle")
    overall_alignment: float = Field(..., description="Overall body alignment score")

class GestureMetrics(BaseModel):
    """Detailed gesture metrics"""
    hand_visibility: float = Field(..., description="Percentage of time hands are visible")
    gesture_types: List[str] = Field(default_factory=list, description="Types of gestures detected")
    gesture_timing: List[float] = Field(default_factory=list, description="Timing of gestures")

class EyeContactMetrics(BaseModel):
    """Detailed eye contact metrics"""
    gaze_directions: List[str] = Field(default_factory=list, description="Gaze directions over time")
    eye_contact_duration: float = Field(..., description="Total eye contact duration")
    eye_contact_breaks: int = Field(..., description="Number of eye contact breaks") 
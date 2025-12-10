"""
Pydantic schemas for API requests and responses
"""

from pydantic import BaseModel, Field, validator
from typing import List, Dict, Optional, Any, Union
from datetime import datetime
from enum import Enum

class SeverityLevel(str, Enum):
    GOOD = "good"
    WARNING = "warning"
    CRITICAL = "critical"

class FeedbackType(str, Enum):
    EYE_CONTACT = "eye_contact"
    POSTURE = "posture"
    SMILE = "smile"
    FIDGET = "fidget"
    GESTURE = "gesture"

class AnalysisType(str, Enum):
    AUDIO = "audio"
    VIDEO = "video"
    COMBINED = "combined"

# Request Schemas
class AudioAnalysisRequest(BaseModel):
    file: UploadFile
    user_id: Optional[str] = None
    session_id: Optional[str] = None

class LandmarkData(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    face: List[List[float]] = Field(..., description="Face landmarks")
    pose: List[List[float]] = Field(..., description="Pose landmarks")
    left_hand: List[List[float]] = Field(default=[], description="Left hand landmarks")
    right_hand: List[List[float]] = Field(default=[], description="Right hand landmarks")

class LandmarkAnalysisRequest(BaseModel):
    landmarks: List[LandmarkData] = Field(..., description="List of landmark data")
    fps: int = Field(default=30, description="Frames per second")
    user_id: Optional[str] = None

class SessionFinalizeRequest(BaseModel):
    session_id: str = Field(..., description="Session ID to finalize")
    summary_requested: bool = Field(default=True, description="Whether to generate summary")

# Response Schemas
class Timestamp(BaseModel):
    t: float = Field(..., description="Timestamp in seconds")
    type: str = Field(..., description="Type of event")
    word: Optional[str] = None
    emotion: Optional[str] = None
    message: Optional[str] = None

class Replacement(BaseModel):
    position: int = Field(..., description="Position in transcript")
    original: str = Field(..., description="Original word/phrase")
    suggestion: str = Field(..., description="Suggested replacement")

class AudioAnalysisResponse(BaseModel):
    emotion: str = Field(..., description="Primary emotion detected")
    probabilities: Dict[str, float] = Field(..., description="Emotion probabilities")
    wpm: int = Field(..., description="Words per minute")
    filler_word_counts: Dict[str, int] = Field(..., description="Count of filler words")
    suggested_replacements: List[Replacement] = Field(..., description="Suggested replacements")
    timestamps: List[Timestamp] = Field(..., description="Event timestamps")
    
    class Config:
        json_schema_extra = {
            "example": {
                "emotion": "confident",
                "probabilities": {
                    "confident": 0.72,
                    "neutral": 0.14,
                    "anxious": 0.08,
                    "excited": 0.04,
                    "calm": 0.02
                },
                "wpm": 132,
                "filler_word_counts": {
                    "um": 3,
                    "like": 5,
                    "so": 2
                },
                "suggested_replacements": [
                    {
                        "position": 10,
                        "original": "um",
                        "suggestion": "(pause)"
                    }
                ],
                "timestamps": [
                    {
                        "t": 2.1,
                        "type": "filler",
                        "word": "um"
                    }
                ]
            }
        }

class FeedbackItem(BaseModel):
    timestamp: float = Field(..., description="Timestamp of feedback")
    type: FeedbackType = Field(..., description="Type of feedback")
    score: float = Field(..., ge=0, le=1, description="Score from 0 to 1")
    message: str = Field(..., description="Feedback message")
    severity: SeverityLevel = Field(..., description="Severity level")
    actionable_tip: Optional[str] = Field(None, description="Actionable tip")
    suggested_action: Optional[str] = Field(None, description="Suggested action")

class AggregateScores(BaseModel):
    posture_score: float = Field(..., ge=0, le=1, description="Average posture score")
    eye_contact_score: float = Field(..., ge=0, le=1, description="Average eye contact score")
    fidget_score: float = Field(..., ge=0, le=1, description="Average fidget score")
    smile_score: float = Field(..., ge=0, le=1, description="Average smile score")
    gesture_score: Optional[float] = Field(None, ge=0, le=1, description="Average gesture score")

class LandmarkAnalysisResponse(BaseModel):
    feedback: List[FeedbackItem] = Field(..., description="List of feedback items")
    aggregate_scores: AggregateScores = Field(..., description="Aggregate scores")
    
    class Config:
        json_schema_extra = {
            "example": {
                "feedback": [
                    {
                        "timestamp": 0.04,
                        "type": "eye_contact",
                        "score": 0.85,
                        "message": "Good eye contact maintained",
                        "severity": "good",
                        "actionable_tip": "Keep looking at the camera or audience"
                    }
                ],
                "aggregate_scores": {
                    "posture_score": 0.78,
                    "eye_contact_score": 0.85,
                    "fidget_score": 0.23,
                    "smile_score": 0.67
                }
            }
        }

class SessionSummary(BaseModel):
    overall_score: float = Field(..., ge=0, le=1, description="Overall session score")
    duration: float = Field(..., description="Session duration in seconds")
    key_insights: List[str] = Field(..., description="Key insights from analysis")
    recommendations: List[str] = Field(..., description="Recommendations for improvement")

class SessionFinalizeResponse(BaseModel):
    report_url: Optional[str] = Field(None, description="URL to generated report")
    pdf: Optional[str] = Field(None, description="Base64 encoded PDF report")
    summary: Optional[SessionSummary] = Field(None, description="Session summary")

class HealthResponse(BaseModel):
    status: str = Field(..., description="Health status")
    timestamp: str = Field(..., description="Timestamp of health check")
    version: str = Field(..., description="API version")
    services: Dict[str, str] = Field(..., description="Status of various services")

# Error Schemas
class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[Dict[str, Any]] = Field(None, description="Additional error details")
    timestamp: str = Field(..., description="Timestamp of error")

# Database Schemas
class UserBase(BaseModel):
    email: str = Field(..., description="User email")
    preferences: Optional[Dict[str, Any]] = Field(default={}, description="User preferences")

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: str = Field(..., description="User ID")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True

class SessionBase(BaseModel):
    user_id: Optional[str] = None
    device_info: Optional[Dict[str, Any]] = None
    privacy_opt_in: bool = Field(default=False, description="Privacy opt-in status")

class SessionCreate(SessionBase):
    pass

class Session(SessionBase):
    id: str = Field(..., description="Session ID")
    started_at: datetime = Field(..., description="Session start time")
    ended_at: Optional[datetime] = Field(None, description="Session end time")
    analysis_results: Optional[Dict[str, Any]] = Field(None, description="Analysis results")
    
    class Config:
        from_attributes = True

class PredictionBase(BaseModel):
    session_id: str = Field(..., description="Session ID")
    timestamp: datetime = Field(..., description="Prediction timestamp")
    type: AnalysisType = Field(..., description="Analysis type")
    payload: Dict[str, Any] = Field(..., description="Prediction payload")

class PredictionCreate(PredictionBase):
    pass

class Prediction(PredictionBase):
    id: str = Field(..., description="Prediction ID")
    
    class Config:
        from_attributes = True

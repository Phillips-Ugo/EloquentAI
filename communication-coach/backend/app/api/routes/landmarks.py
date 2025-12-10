"""
Landmark analysis API routes
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import List, Optional
import logging
import uuid
from datetime import datetime

from app.models.schemas import (
    LandmarkAnalysisRequest, 
    LandmarkAnalysisResponse,
    FeedbackItem,
    AggregateScores,
    FeedbackType,
    SeverityLevel
)
from app.services.landmark_service import LandmarkAnalysisService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize landmark service
landmark_service = LandmarkAnalysisService()

@router.post("/landmarks", response_model=LandmarkAnalysisResponse)
async def analyze_landmarks(
    background_tasks: BackgroundTasks,
    request: LandmarkAnalysisRequest
):
    """
    Analyze landmark data for posture, eye contact, smile, and gesture feedback
    
    - **landmarks**: List of landmark data with timestamps
    - **fps**: Frames per second of the video
    - **user_id**: Optional user ID for tracking
    
    Returns analysis results including:
    - Real-time feedback for each frame
    - Aggregate scores across the session
    - Actionable tips and suggestions
    """
    try:
        # Validate request
        if not request.landmarks:
            raise HTTPException(status_code=400, detail="No landmarks provided")
        
        if request.fps <= 0 or request.fps > 60:
            raise HTTPException(status_code=400, detail="Invalid FPS value")
        
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        logger.info(f"Starting landmark analysis {analysis_id} with {len(request.landmarks)} frames")
        
        # Analyze landmarks
        try:
            result = await landmark_service.analyze_landmarks(
                landmarks=request.landmarks,
                fps=request.fps,
                user_id=request.user_id
            )
            
            logger.info(f"Landmark analysis {analysis_id} completed successfully")
            
            # Store results in background if user_id provided
            if request.user_id:
                background_tasks.add_task(
                    store_landmark_analysis,
                    user_id=request.user_id,
                    analysis_id=analysis_id,
                    result=result.dict()
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Landmark analysis {analysis_id} failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Landmark analysis failed: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in landmark analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/landmarks/stream")
async def analyze_landmark_stream(
    background_tasks: BackgroundTasks,
    request: LandmarkAnalysisRequest
):
    """
    Analyze streaming landmark data for real-time feedback
    
    Optimized for real-time processing with lower latency
    """
    try:
        if not request.landmarks:
            raise HTTPException(status_code=400, detail="No landmarks provided")
        
        # For streaming, only analyze the latest landmarks
        recent_landmarks = request.landmarks[-10:]  # Last 10 frames
        
        result = await landmark_service.analyze_landmarks(
            landmarks=recent_landmarks,
            fps=request.fps,
            user_id=request.user_id,
            streaming=True
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Streaming landmark analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Streaming analysis failed")

@router.get("/landmarks/heuristics")
async def get_heuristic_config():
    """Get current heuristic configuration"""
    return landmark_service.get_heuristic_config()

@router.put("/landmarks/heuristics")
async def update_heuristic_config(config: dict):
    """Update heuristic configuration"""
    try:
        landmark_service.update_heuristic_config(config)
        return {"message": "Heuristic configuration updated successfully"}
    except Exception as e:
        logger.error(f"Failed to update heuristic config: {e}")
        raise HTTPException(status_code=500, detail="Failed to update configuration")

async def store_landmark_analysis(
    user_id: str,
    analysis_id: str,
    result: dict
):
    """Store landmark analysis result in background task"""
    try:
        # This would typically store in database
        logger.info(f"Stored landmark analysis {analysis_id} for user {user_id}")
    except Exception as e:
        logger.error(f"Failed to store landmark analysis: {str(e)}")

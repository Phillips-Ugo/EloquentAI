"""
Audio analysis API routes
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends, BackgroundTasks
from typing import Optional
import logging
import uuid
from datetime import datetime

from app.models.schemas import AudioAnalysisResponse
from app.services.audio_service import AudioAnalysisService
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize audio service
audio_service = AudioAnalysisService()

@router.post("/audio", response_model=AudioAnalysisResponse)
async def analyze_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None)
):
    """
    Analyze audio file for emotion, speech rate, and filler words
    
    - **file**: Audio file (WAV, MP3, M4A, AAC)
    - **user_id**: Optional user ID for tracking
    - **session_id**: Optional session ID for grouping analyses
    
    Returns analysis results including:
    - Primary emotion and probabilities
    - Words per minute (WPM)
    - Filler word counts and replacements
    - Timestamped events
    """
    try:
        # Validate file
        if not file.content_type or file.content_type not in settings.SUPPORTED_AUDIO_FORMATS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file format. Supported formats: {settings.SUPPORTED_AUDIO_FORMATS}"
            )
        
        if file.size and file.size > settings.MAX_AUDIO_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {settings.MAX_AUDIO_FILE_SIZE} bytes"
            )
        
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        logger.info(f"Starting audio analysis {analysis_id} for user {user_id}")
        
        # Process audio file
        try:
            # Read file content
            file_content = await file.read()
            
            # Analyze audio
            if settings.MOCK_RESPONSES:
                # Return mock response for development
                result = await audio_service.mock_analyze_audio(file_content, file.filename or "audio.wav")
            else:
                result = await audio_service.analyze_audio(file_content, file.filename or "audio.wav")
            
            logger.info(f"Audio analysis {analysis_id} completed successfully")
            
            # Store results in background (if needed)
            if session_id:
                background_tasks.add_task(
                    store_analysis_result,
                    session_id=session_id,
                    analysis_type="audio",
                    result=result.dict(),
                    user_id=user_id
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Audio analysis {analysis_id} failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Audio analysis failed: {str(e)}")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in audio analysis: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/audio/formats")
async def get_supported_audio_formats():
    """Get list of supported audio formats"""
    return {
        "supported_formats": settings.SUPPORTED_AUDIO_FORMATS,
        "max_file_size": settings.MAX_AUDIO_FILE_SIZE,
        "max_duration": settings.MAX_AUDIO_DURATION
    }

@router.post("/audio/stream")
async def analyze_audio_stream(
    background_tasks: BackgroundTasks,
    audio_chunk: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    session_id: Optional[str] = Form(None),
    chunk_index: int = Form(0)
):
    """
    Analyze audio stream chunk for real-time processing
    
    - **audio_chunk**: Audio chunk from stream
    - **user_id**: Optional user ID
    - **session_id**: Session ID for real-time analysis
    - **chunk_index**: Index of chunk in stream
    """
    try:
        if not session_id:
            raise HTTPException(status_code=400, detail="session_id is required for streaming")
        
        # Read chunk content
        chunk_content = await audio_chunk.read()
        
        # Process chunk
        result = await audio_service.analyze_audio_chunk(
            chunk_content, 
            session_id, 
            chunk_index
        )
        
        logger.info(f"Audio chunk {chunk_index} processed for session {session_id}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing audio chunk: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process audio chunk")

async def store_analysis_result(
    session_id: str,
    analysis_type: str,
    result: dict,
    user_id: Optional[str] = None
):
    """Store analysis result in background task"""
    try:
        # This would typically store in database
        # For now, just log
        logger.info(f"Stored {analysis_type} analysis result for session {session_id}")
    except Exception as e:
        logger.error(f"Failed to store analysis result: {str(e)}")

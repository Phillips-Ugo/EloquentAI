import os
import logging
import tempfile
import shutil
from typing import Dict, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
from audio_processor import AudioProcessor

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="EloquentAI Speech Analysis Service",
    description="AI-powered speech analysis and feedback service",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize audio processor
try:
    audio_processor = AudioProcessor()
    logger.info("Audio processor initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize audio processor: {e}")
    audio_processor = None

class AnalysisRequest(BaseModel):
    """Request model for text analysis"""
    text_content: str
    analysis_type: Optional[str] = "speech"

class AnalysisResponse(BaseModel):
    """Response model for analysis results"""
    success: bool
    data: Optional[Dict] = None
    error: Optional[str] = None
    message: Optional[str] = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "EloquentAI Speech Analysis Service",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "Audio transcription with Whisper",
            "Enhanced filler word detection",
            "Speech metrics analysis",
            "AI-powered feedback generation",
            "Text analysis support"
        ]
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    health_status = {
        "status": "healthy",
        "audio_processor": "initialized" if audio_processor else "failed",
        "openai_available": "available" if audio_processor and audio_processor.openai_client else "unavailable"
    }
    
    if not audio_processor:
        health_status["status"] = "unhealthy"
        health_status["error"] = "Audio processor not initialized"
    
    return health_status

@app.post("/analyze/audio", response_model=AnalysisResponse)
async def analyze_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    analysis_type: Optional[str] = "auto"
):
    """
    Analyze audio file for speech patterns and provide feedback
    
    Supports:
    - Audio files: MP3, WAV, M4A, AAC, OGG, FLAC
    - Video files: MP4, AVI, MOV, WMV, FLV, WebM, MKV, M4V
    """
    if not audio_processor:
        raise HTTPException(status_code=503, detail="Audio processor not available")
    
    # Validate file type
    allowed_types = [
        'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg', 'audio/flac',
        'video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv',
        'video/webm', 'video/x-matroska'
    ]
    
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file.content_type}. Supported types: {allowed_types}"
        )
    
    # Create temporary file
    temp_file = None
    try:
        # Create temp file with proper extension
        suffix = os.path.splitext(file.filename)[1] if file.filename else '.tmp'
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        
        # Write uploaded file to temp file
        shutil.copyfileobj(file.file, temp_file)
        temp_file.close()
        
        logger.info(f"Processing audio file: {file.filename}")
        
        # Process audio
        result = audio_processor.process_audio(temp_file.name)
        
        # Clean up temp file
        background_tasks.add_task(os.unlink, temp_file.name)
        
        return AnalysisResponse(
            success=True,
            data=result,
            message="Audio analysis completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Error processing audio: {e}")
        
        # Clean up temp file on error
        if temp_file and os.path.exists(temp_file.name):
            background_tasks.add_task(os.unlink, temp_file.name)
        
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@app.post("/analyze/text", response_model=AnalysisResponse)
async def analyze_text(request: AnalysisRequest):
    """
    Analyze text content for communication patterns and provide feedback
    """
    if not audio_processor:
        raise HTTPException(status_code=503, detail="Audio processor not available")
    
    try:
        # For text analysis, we'll create a simplified analysis
        # since we don't have audio metrics
        text = request.text_content.strip()
        
        if len(text) < 10:
            raise HTTPException(status_code=400, detail="Text content too short. Minimum 10 characters required.")
        
        # Basic text analysis
        words = text.split()
        word_count = len(words)
        
        # Detect filler words in text
        filler_count, filler_words_used = audio_processor._detect_filler_words(text)
        
        # Calculate basic metrics
        sentences = text.split('.')
        sentence_count = len([s for s in sentences if s.strip()])
        avg_words_per_sentence = word_count / sentence_count if sentence_count > 0 else 0
        
        # Generate AI feedback for text
        ai_feedback = audio_processor.generate_ai_feedback(text, None)
        
        # Create analysis result
        result = {
            "transcription": text,
            "metrics": {
                "word_count": word_count,
                "sentence_count": sentence_count,
                "avg_words_per_sentence": round(avg_words_per_sentence, 2),
                "filler_word_count": filler_count,
                "filler_words_used": filler_words_used,
                "text_length": len(text),
                "analysis_type": "text"
            },
            "feedback": {
                "ai_generated": ai_feedback
            },
            "recommendations": [
                "Consider varying sentence length for better flow",
                "Review and reduce filler word usage",
                "Ensure clear topic sentences in each paragraph"
            ] if filler_count > 3 else [
                "Good use of language with minimal filler words",
                "Consider adding more variety in sentence structure"
            ],
            "strengths": [
                "Clear written communication",
                "Good vocabulary usage"
            ] if filler_count <= 2 else [],
            "areas_for_improvement": [
                "Reduce filler word usage",
                "Improve sentence variety"
            ] if filler_count > 5 else []
        }
        
        return AnalysisResponse(
            success=True,
            data=result,
            message="Text analysis completed successfully"
        )
        
    except Exception as e:
        logger.error(f"Error analyzing text: {e}")
        raise HTTPException(status_code=500, detail=f"Error analyzing text: {str(e)}")

@app.get("/filler-words")
async def get_filler_words():
    """Get the list of filler words used for detection"""
    if not audio_processor:
        raise HTTPException(status_code=503, detail="Audio processor not available")
    
    return {
        "filler_words": audio_processor.filler_words,
        "total_categories": len(audio_processor.filler_words),
        "total_words": sum(len(words) for words in audio_processor.filler_words.values())
    }

@app.post("/test")
async def test_analysis():
    """Test endpoint with sample data"""
    sample_text = """
    Hi and welcome to this course about React.js, the most popular JavaScript library 
    you can learn these days. I'm super happy to welcome you on board. My name is 
    Maximilian Schwarzmuller, and I will be your instructor in this course.
    """
    
    request = AnalysisRequest(text_content=sample_text)
    return await analyze_text(request)

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "message": "Request failed"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": "An unexpected error occurred"
        }
    )

if __name__ == "__main__":
    # Load environment variables
    from dotenv import load_dotenv
    import os
    
    # Load from local env file first, then fallback to main .env
    load_dotenv("env.local")
    load_dotenv()  # Load main .env as fallback
    
    # Get configuration - prioritize local env file
    port = int(os.getenv("PORT", 8002))
    host = os.getenv("HOST", "127.0.0.1")
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    logger.info(f"Starting Speech Analysis Service on {host}:{port}")
    
    uvicorn.run(
        "speech_service:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    ) 
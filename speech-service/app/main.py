from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import tempfile
import json
from typing import Dict, Any

from .speech_analyzer import SpeechAnalyzer
from .models import SpeechAnalysisRequest, SpeechAnalysisResponse

app = FastAPI(
    title="Eloquent AI Speech Analysis Service",
    description="AI-powered speech analysis for communication enhancement",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize speech analyzer
speech_analyzer = SpeechAnalyzer()

@app.on_event("startup")
async def startup_event():
    """Initialize models and resources on startup"""
    await speech_analyzer.initialize()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "speech-analysis"}

@app.post("/analyze-speech")
async def analyze_speech(file: UploadFile = File(...)):
    """
    Analyze speech from uploaded audio file
    
    Args:
        file: Audio file (MP3, WAV, M4A, FLAC)
    
    Returns:
        JSON with comprehensive speech analysis results
    """
    try:
        # Validate file type
        if not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail="File must be an audio file")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Analyze speech
            analysis_result = await speech_analyzer.analyze(temp_file_path)
            
            return JSONResponse(
                content=analysis_result,
                status_code=200
            )
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Eloquent AI Speech Analysis",
        "version": "1.0.0",
        "endpoints": {
            "analyze_speech": "/analyze-speech",
            "health": "/health",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    ) 
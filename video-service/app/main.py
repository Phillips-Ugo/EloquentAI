from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import tempfile
import json
from typing import Dict, Any

from .video_analyzer import VideoAnalyzer
from .models import VideoAnalysisRequest, VideoAnalysisResponse

app = FastAPI(
    title="Eloquent AI Video Analysis Service",
    description="AI-powered video analysis for body language and presentation skills",
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

# Initialize video analyzer
video_analyzer = VideoAnalyzer()

@app.on_event("startup")
async def startup_event():
    """Initialize models and resources on startup"""
    await video_analyzer.initialize()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "video-analysis"}

@app.post("/analyze-video")
async def analyze_video(file: UploadFile = File(...)):
    """
    Analyze video for body language and presentation skills
    
    Args:
        file: Video file (MP4, AVI, MOV, WMV)
    
    Returns:
        JSON with comprehensive video analysis results
    """
    try:
        # Validate file type
        if not file.content_type.startswith('video/'):
            raise HTTPException(status_code=400, detail="File must be a video file")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Analyze video
            analysis_result = await video_analyzer.analyze(temp_file_path)
            
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
        "service": "Eloquent AI Video Analysis",
        "version": "1.0.0",
        "endpoints": {
            "analyze_video": "/analyze-video",
            "health": "/health",
            "docs": "/docs"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8002,
        reload=True
    ) 
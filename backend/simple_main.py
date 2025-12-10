#!/usr/bin/env python3
"""
Simple Communication Coach Backend API
FastAPI application for multimodal communication analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Communication Coach API",
    description="AI-powered multimodal communication analysis",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Communication Coach API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0",
        "services": {
            "database": "healthy",
            "ml_models": "mock_mode",
            "file_storage": "healthy"
        }
    }

@app.post("/api/predict/audio")
async def analyze_audio():
    """Mock audio analysis endpoint"""
    return {
        "emotion": "confident",
        "probabilities": {
            "confident": 0.72,
            "neutral": 0.14,
            "anxious": 0.08,
            "excited": 0.04,
            "calm": 0.02
        },
        "wpm": 142,
        "filler_word_counts": {
            "um": 2,
            "like": 1,
            "so": 1
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
            },
            {
                "t": 5.3,
                "type": "filler",
                "word": "like"
            }
        ]
    }

@app.post("/api/analyze/landmarks")
async def analyze_landmarks():
    """Mock landmark analysis endpoint"""
    return {
        "feedback": [
            {
                "timestamp": 0.04,
                "type": "eye_contact",
                "score": 0.85,
                "message": "Good eye contact maintained",
                "severity": "good",
                "actionable_tip": "Keep looking at the camera or audience"
            },
            {
                "timestamp": 0.08,
                "type": "posture",
                "score": 0.78,
                "message": "Slight posture deviation detected",
                "severity": "warning",
                "actionable_tip": "Straighten your back slightly"
            }
        ],
        "aggregate_scores": {
            "posture_score": 0.78,
            "eye_contact_score": 0.85,
            "fidget_score": 0.23,
            "smile_score": 0.67
        }
    }

@app.post("/api/session/finalize")
async def finalize_session():
    """Mock session finalization endpoint"""
    return {
        "report_url": None,
        "pdf": None,
        "summary": {
            "overall_score": 0.78,
            "duration": 120.0,
            "key_insights": [
                "Good eye contact maintained throughout",
                "Speaking pace is optimal",
                "Some filler words detected",
                "Posture could be improved"
            ],
            "recommendations": [
                "Practice maintaining eye contact during longer presentations",
                "Work on reducing filler word usage",
                "Focus on keeping shoulders back and spine straight",
                "Continue the good work on speaking pace"
            ]
        }
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    logger.info("🚀 Starting Communication Coach API")
    uvicorn.run(
        "simple_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


"""
Communication Coach Backend API
FastAPI application for multimodal communication analysis
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid

from app.api.routes import audio, landmarks, sessions, health, analysis, upload
from app.core.config import settings
from app.core.database import init_db
from app.models.schemas import (
    AudioAnalysisRequest,
    AudioAnalysisResponse,
    LandmarkAnalysisRequest,
    LandmarkAnalysisResponse,
    SessionFinalizeRequest,
    SessionFinalizeResponse,
    HealthResponse
)

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
    allow_origins=["*"] if settings.DEBUG else settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(audio.router, prefix="/api/predict", tags=["audio"])
app.include_router(landmarks.router, prefix="/api/analyze", tags=["landmarks"])
app.include_router(sessions.router, prefix="/api/session", tags=["sessions"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["analysis"])
app.include_router(health.router, prefix="/api", tags=["health"])

# Mount static files
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.on_event("startup")
async def startup_event():
    """Initialize database and models on startup"""
    try:
        await init_db()
        logger.info("✅ Database initialized successfully")
    except Exception as e:
        logger.warning(f"⚠️ Database initialization failed (continuing anyway): {e}")
        # Don't raise - allow server to start without database for file uploads

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🔄 Shutting down Communication Coach API")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Communication Coach API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    import traceback
    error_trace = traceback.format_exc()
    logger.error(f"Unhandled exception: {exc}\n{error_trace}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred",
            "detail": error_trace if settings.DEBUG else None,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )

#!/usr/bin/env python3
"""
Eloquent AI - Speech Analysis Service
Simplified standalone service for speech analysis
"""

import os
import sys
import json
import asyncio
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import tempfile
import shutil

# Add current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from fastapi import FastAPI, HTTPException, UploadFile, File, Form
    from fastapi.responses import JSONResponse
    from pydantic import BaseModel
    import uvicorn
    import librosa
    import numpy as np
    from transformers import pipeline
    import whisper
    import spacy
    from scipy import signal
    import soundfile as sf
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Please install required packages: pip install fastapi uvicorn librosa transformers whisper spacy scipy soundfile")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Eloquent AI Speech Analyzer",
    description="AI-powered speech analysis for presentation feedback",
    version="2.0.0"
)

# Global variables for loaded models
whisper_model = None
sentiment_analyzer = None
nlp = None

class AnalysisRequest(BaseModel):
    file_path: str
    file_type: str
    original_name: str

class SpeechAnalysisResult(BaseModel):
    transcription: str
    clarity_score: float
    pace_score: float
    filler_words: Dict[str, int]
    sentiment_score: float
    recommendations: list
    metrics: Dict[str, Any]

def load_models():
    """Load AI models on startup"""
    global whisper_model, sentiment_analyzer, nlp
    
    logger.info("Loading AI models...")
    
    try:
        # Load Whisper model for transcription
        whisper_model = whisper.load_model("base")
        logger.info("✓ Whisper model loaded")
        
        # Load sentiment analyzer
        sentiment_analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
        logger.info("✓ Sentiment analyzer loaded")
        
        # Load spaCy for NLP
        try:
            nlp = spacy.load("en_core_web_sm")
        except OSError:
            logger.warning("spaCy model not found, downloading...")
            os.system("python -m spacy download en_core_web_sm")
            nlp = spacy.load("en_core_web_sm")
        logger.info("✓ spaCy model loaded")
        
    except Exception as e:
        logger.error(f"Error loading models: {e}")
        raise

def analyze_speech_quality(audio_path: str) -> Dict[str, Any]:
    """Analyze speech quality metrics"""
    try:
        # Load audio file
        y, sr = librosa.load(audio_path, sr=None)
        
        # Calculate duration
        duration = len(y) / sr
        
        # Calculate speaking rate (words per minute)
        # This is a simplified calculation - in production you'd use actual word count
        estimated_words = duration * 2.5  # Rough estimate: 150 words per minute
        speaking_rate = estimated_words / (duration / 60)
        
        # Calculate clarity metrics
        # Spectral centroid (brightness of sound)
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        clarity_score = np.mean(spectral_centroids) / 1000  # Normalize
        
        # Calculate pace consistency
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        pace_score = min(tempo / 120.0, 1.0)  # Normalize to 0-1
        
        # Detect silence gaps
        silence_threshold = 0.01
        silence_mask = np.abs(y) < silence_threshold
        silence_ratio = np.sum(silence_mask) / len(y)
        
        return {
            "duration": duration,
            "speaking_rate": speaking_rate,
            "clarity_score": clarity_score,
            "pace_score": pace_score,
            "silence_ratio": silence_ratio,
            "sample_rate": sr
        }
        
    except Exception as e:
        logger.error(f"Error analyzing speech quality: {e}")
        return {}

def detect_filler_words(text: str) -> Dict[str, int]:
    """Detect common filler words"""
    filler_words = {
        "um": 0, "uh": 0, "like": 0, "you know": 0, "basically": 0,
        "actually": 0, "literally": 0, "sort of": 0, "kind of": 0,
        "right": 0, "so": 0, "well": 0, "i mean": 0
    }
    
    text_lower = text.lower()
    
    for filler in filler_words:
        filler_words[filler] = text_lower.count(filler)
    
    return filler_words

def generate_recommendations(metrics: Dict[str, Any], filler_words: Dict[str, int]) -> list:
    """Generate personalized recommendations"""
    recommendations = []
    
    # Clarity recommendations
    if metrics.get("clarity_score", 0) < 0.5:
        recommendations.append("Consider speaking more clearly and enunciating your words")
    
    # Pace recommendations
    if metrics.get("speaking_rate", 0) > 200:
        recommendations.append("Try slowing down your speaking pace for better comprehension")
    elif metrics.get("speaking_rate", 0) < 100:
        recommendations.append("Consider increasing your speaking pace to maintain engagement")
    
    # Filler word recommendations
    total_fillers = sum(filler_words.values())
    if total_fillers > 10:
        recommendations.append("Reduce the use of filler words like 'um', 'uh', and 'like'")
    
    # Silence recommendations
    if metrics.get("silence_ratio", 0) > 0.3:
        recommendations.append("Consider reducing long pauses and silence gaps")
    
    if not recommendations:
        recommendations.append("Great job! Your speech quality is excellent")
    
    return recommendations

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    load_models()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "speech_analyzer",
        "version": "2.0.0",
        "models_loaded": {
            "whisper": whisper_model is not None,
            "sentiment": sentiment_analyzer is not None,
            "spacy": nlp is not None
        }
    }

@app.post("/analyze")
async def analyze_speech(request: AnalysisRequest):
    """Analyze speech from uploaded file"""
    try:
        logger.info(f"Starting speech analysis for: {request.original_name}")
        
        if not os.path.exists(request.file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Transcribe audio
        logger.info("Transcribing audio...")
        result = whisper_model.transcribe(request.file_path)
        transcription = result["text"]
        
        # Analyze speech quality
        logger.info("Analyzing speech quality...")
        quality_metrics = analyze_speech_quality(request.file_path)
        
        # Detect filler words
        logger.info("Detecting filler words...")
        filler_words = detect_filler_words(transcription)
        
        # Analyze sentiment
        logger.info("Analyzing sentiment...")
        sentiment_result = sentiment_analyzer(transcription[:512])[0]  # Limit text length
        sentiment_score = 1.0 if sentiment_result["label"] == "POSITIVE" else 0.0
        
        # Generate recommendations
        logger.info("Generating recommendations...")
        recommendations = generate_recommendations(quality_metrics, filler_words)
        
        # Compile results
        analysis_result = {
            "transcription": transcription,
            "clarity_score": quality_metrics.get("clarity_score", 0.0),
            "pace_score": quality_metrics.get("pace_score", 0.0),
            "filler_words": filler_words,
            "sentiment_score": sentiment_score,
            "recommendations": recommendations,
            "metrics": {
                "duration": quality_metrics.get("duration", 0.0),
                "speaking_rate": quality_metrics.get("speaking_rate", 0.0),
                "silence_ratio": quality_metrics.get("silence_ratio", 0.0),
                "total_filler_words": sum(filler_words.values())
            }
        }
        
        logger.info("Speech analysis completed successfully")
        return analysis_result
        
    except Exception as e:
        logger.error(f"Speech analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze-upload")
async def analyze_uploaded_file(file: UploadFile = File(...)):
    """Analyze uploaded audio file directly"""
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_path = tmp_file.name
        
        # Create analysis request
        request = AnalysisRequest(
            file_path=tmp_path,
            file_type=file.content_type,
            original_name=file.filename
        )
        
        # Perform analysis
        result = await analyze_speech(request)
        
        # Clean up temporary file
        os.unlink(tmp_path)
        
        return result
        
    except Exception as e:
        logger.error(f"Upload analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    # Run the FastAPI server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    ) 
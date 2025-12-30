"""
Analysis API routes
Handles getting analysis results by ID and starting analysis
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging
import os
import json
from pathlib import Path
import httpx

logger = logging.getLogger(__name__)

router = APIRouter()

# Node.js server URL for analysis
NODE_SERVER_URL = os.getenv("NODE_SERVER_URL", "http://localhost:5001")

# Path to sessions directory (should match Node.js server location)
# Try multiple possible paths
def get_sessions_dir():
    """Get the sessions directory path, trying multiple locations"""
    possible_paths = [
        # From backend/app/api/routes/analysis.py -> project root -> server/sessions
        Path(__file__).parent.parent.parent.parent.parent / "server" / "sessions",
        # From backend directory -> server/sessions
        Path(__file__).parent.parent.parent.parent / "server" / "sessions",
        # Absolute path from environment variable
        Path(os.getenv("SESSIONS_DIR", "")),
        # Relative to current working directory
        Path("server/sessions"),
        Path("../server/sessions"),
    ]
    
    for path in possible_paths:
        if path and str(path) and path.exists() and path.is_dir():
            return path
    
    # Default fallback - create if doesn't exist
    default_path = Path(__file__).parent.parent.parent.parent.parent / "server" / "sessions"
    default_path.mkdir(parents=True, exist_ok=True)
    return default_path

SESSIONS_DIR = get_sessions_dir()

@router.post("/{analysis_id}")
async def start_analysis(analysis_id: str) -> Dict[str, Any]:
    """
    Start analysis for an uploaded file
    
    - **analysis_id**: The analysis session ID
    
    Returns:
    - Analysis results including status, type, and results data
    """
    try:
        # Proxy the request to Node.js server which handles the actual analysis
        async with httpx.AsyncClient(timeout=600.0) as client:
            try:
                response = await client.post(
                    f"{NODE_SERVER_URL}/api/analysis/{analysis_id}"
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Node.js server error: {e.response.status_code} - {e.response.text}")
                raise HTTPException(
                    status_code=e.response.status_code,
                    detail=f"Analysis failed: {e.response.text}"
                )
            except httpx.RequestError as e:
                logger.error(f"Failed to connect to Node.js server: {e}")
                raise HTTPException(
                    status_code=503,
                    detail="Analysis service is unavailable. Please ensure the Node.js server is running on port 5001."
                )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting analysis for {analysis_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start analysis: {str(e)}"
        )

@router.get("/{analysis_id}")
async def get_analysis_results(analysis_id: str) -> Dict[str, Any]:
    """
    Get analysis results by ID
    
    - **analysis_id**: The analysis session ID
    
    Returns:
    - Analysis results including status, type, and results data
    """
    try:
        session_path = SESSIONS_DIR / f"{analysis_id}.json"
        
        if not session_path.exists():
            raise HTTPException(
                status_code=404,
                detail="Analysis session not found"
            )
        
        # Read session file
        with open(session_path, 'r', encoding='utf-8') as f:
            session = json.load(f)
        
        logger.info(f"Retrieved analysis results for {analysis_id}")
        
        return {
            "success": True,
            "data": {
                "analysisId": analysis_id,
                "status": session.get("status"),
                "type": session.get("type"),
                "uploadMode": session.get("uploadMode"),
                "results": session.get("results"),
                "error": session.get("error"),
                "createdAt": session.get("createdAt"),
                "analysisStartedAt": session.get("analysisStartedAt"),
                "analysisCompletedAt": session.get("analysisCompletedAt")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting analysis results for {analysis_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get analysis results: {str(e)}"
        )


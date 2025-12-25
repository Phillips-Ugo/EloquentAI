"""
File upload API routes
Handles file uploads for analysis
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import logging
import uuid
import os
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

# Path to uploads directory (should match Node.js server location)
def get_uploads_dir():
    """Get the uploads directory path"""
    possible_paths = [
        # From backend/app/api/routes/upload.py -> project root -> server/uploads
        Path(__file__).parent.parent.parent.parent.parent / "server" / "uploads",
        # From backend directory -> server/uploads
        Path(__file__).parent.parent.parent.parent / "server" / "uploads",
        # Relative to current working directory
        Path("server/uploads"),
        Path("../server/uploads"),
    ]
    
    for path in possible_paths:
        if path and str(path) and path.exists() and path.is_dir():
            return path
    
    # Default fallback - create if doesn't exist
    default_path = Path(__file__).parent.parent.parent.parent.parent / "server" / "uploads"
    default_path.mkdir(parents=True, exist_ok=True)
    return default_path

UPLOADS_DIR = get_uploads_dir()

# Path to sessions directory
def get_sessions_dir():
    """Get the sessions directory path"""
    possible_paths = [
        Path(__file__).parent.parent.parent.parent.parent / "server" / "sessions",
        Path(__file__).parent.parent.parent.parent / "server" / "sessions",
        Path("server/sessions"),
        Path("../server/sessions"),
    ]
    
    for path in possible_paths:
        if path and str(path) and path.exists() and path.is_dir():
            return path
    
    default_path = Path(__file__).parent.parent.parent.parent.parent / "server" / "sessions"
    default_path.mkdir(parents=True, exist_ok=True)
    return default_path

SESSIONS_DIR = get_sessions_dir()

@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    analysisType: Optional[str] = Form("auto"),
    uploadMode: Optional[str] = Form("file")
):
    """
    Upload a file for analysis
    
    - **file**: Audio or video file to analyze
    - **analysisType**: Type of analysis (auto, speech, video, text)
    - **uploadMode**: Upload mode (file, text)
    
    Returns:
    - analysisId: Unique ID for the analysis session
    - filename: Original filename
    - size: File size
    - type: Detected file type
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Determine file type
        filename_lower = file.filename.lower()
        if any(filename_lower.endswith(ext) for ext in ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg']):
            file_type = 'audio'
        elif any(filename_lower.endswith(ext) for ext in ['.mp4', '.avi', '.mov', '.wmv', '.webm', '.mkv']):
            file_type = 'video'
        else:
            file_type = 'unknown'
        
        # Override with analysisType if provided and valid
        if analysisType and analysisType in ['audio', 'video', 'speech']:
            if analysisType == 'speech':
                file_type = 'audio'
            else:
                file_type = analysisType
        
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Save file
        file_extension = Path(file.filename).suffix
        saved_filename = f"{analysis_id}{file_extension}"
        file_path = UPLOADS_DIR / saved_filename
        
        # Read and save file
        file_content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        # Create session data
        session_data = {
            "id": analysis_id,
            "originalName": file.filename,
            "filename": saved_filename,
            "path": str(file_path),
            "size": len(file_content),
            "mimetype": file.content_type or "application/octet-stream",
            "type": file_type,
            "uploadMode": uploadMode or "file",
            "analysisType": analysisType or "auto",
            "createdAt": datetime.now().isoformat(),
            "uploadedAt": datetime.now().isoformat(),
            "status": "uploaded",
            "results": None,
            "error": None
        }
        
        # Save session data
        session_path = SESSIONS_DIR / f"{analysis_id}.json"
        import json
        with open(session_path, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"File uploaded successfully: {file.filename} -> {analysis_id}")
        
        return {
            "success": True,
            "message": "File uploaded successfully",
            "data": {
                "analysisId": analysis_id,
                "filename": file.filename,
                "size": len(file_content),
                "type": file_type,
                "uploadMode": uploadMode or "file"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.post("/text")
async def upload_text(
    textContent: str = Form(...),
    analysisType: Optional[str] = Form("text")
):
    """
    Upload text for analysis
    
    - **textContent**: Text content to analyze
    - **analysisType**: Type of analysis (text)
    
    Returns:
    - analysisId: Unique ID for the analysis session
    """
    try:
        if not textContent or not textContent.strip():
            raise HTTPException(status_code=400, detail="No text content provided")
        
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Create session data
        session_data = {
            "id": analysis_id,
            "originalName": "text_input.txt",
            "filename": f"{analysis_id}.txt",
            "path": None,
            "size": len(textContent.encode('utf-8')),
            "mimetype": "text/plain",
            "type": "text",
            "uploadMode": "text",
            "analysisType": analysisType or "text",
            "textContent": textContent,
            "createdAt": datetime.now().isoformat(),
            "uploadedAt": datetime.now().isoformat(),
            "status": "uploaded",
            "results": None,
            "error": None
        }
        
        # Save session data
        session_path = SESSIONS_DIR / f"{analysis_id}.json"
        import json
        with open(session_path, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Text uploaded successfully: {analysis_id}")
        
        return {
            "success": True,
            "message": "Text uploaded successfully",
            "data": {
                "analysisId": analysis_id,
                "filename": "text_input.txt",
                "size": len(textContent.encode('utf-8')),
                "type": "text",
                "uploadMode": "text"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading text: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload text: {str(e)}"
        )


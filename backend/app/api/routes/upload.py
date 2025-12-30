"""
File upload API routes
Handles file uploads for analysis
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
import logging
import uuid
import os
import json
from pathlib import Path
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

# Get the project root directory (EloquentAI)
# This file is at: backend/app/api/routes/upload.py
# So we go up 4 levels to get to project root
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent.parent

# Define directories using absolute paths from project root
UPLOADS_DIR = PROJECT_ROOT / "server" / "uploads"
SESSIONS_DIR = PROJECT_ROOT / "server" / "sessions"

def init_directories():
    """Initialize upload and session directories"""
    global UPLOADS_DIR, SESSIONS_DIR
    
    logger.info(f"PROJECT_ROOT: {PROJECT_ROOT}")
    logger.info(f"UPLOADS_DIR initial: {UPLOADS_DIR}")
    logger.info(f"SESSIONS_DIR initial: {SESSIONS_DIR}")
    
    # Ensure uploads directory exists
    try:
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        logger.info(f"UPLOADS_DIR created/verified: {UPLOADS_DIR}")
    except Exception as e:
        logger.error(f"Failed to create UPLOADS_DIR: {e}")
        # Fallback to temp directory
        import tempfile
        UPLOADS_DIR = Path(tempfile.gettempdir()) / "eloquent_uploads"
        UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        logger.warning(f"Using fallback UPLOADS_DIR: {UPLOADS_DIR}")
    
    # Ensure sessions directory exists
    try:
        SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
        logger.info(f"SESSIONS_DIR created/verified: {SESSIONS_DIR}")
    except Exception as e:
        logger.error(f"Failed to create SESSIONS_DIR: {e}")
        # Fallback to temp directory
        import tempfile
        SESSIONS_DIR = Path(tempfile.gettempdir()) / "eloquent_sessions"
        SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
        logger.warning(f"Using fallback SESSIONS_DIR: {SESSIONS_DIR}")
    
    logger.info(f"Final UPLOADS_DIR: {UPLOADS_DIR} (exists: {UPLOADS_DIR.exists()}, absolute: {UPLOADS_DIR.is_absolute()})")
    logger.info(f"Final SESSIONS_DIR: {SESSIONS_DIR} (exists: {SESSIONS_DIR.exists()}, absolute: {SESSIONS_DIR.is_absolute()})")

# Initialize directories on module load
init_directories()

@router.post("/")
@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    analysisType: Optional[str] = Form(None),
    uploadMode: Optional[str] = Form(None)
):
    """
    Upload a file for analysis
    """
    global UPLOADS_DIR, SESSIONS_DIR
    
    try:
        logger.info(f"=== UPLOAD REQUEST ===")
        logger.info(f"Filename: {file.filename}")
        logger.info(f"Analysis type: {analysisType}")
        logger.info(f"Upload mode: {uploadMode}")
        logger.info(f"UPLOADS_DIR: {UPLOADS_DIR}")
        logger.info(f"UPLOADS_DIR exists: {UPLOADS_DIR.exists()}")
        logger.info(f"UPLOADS_DIR is_absolute: {UPLOADS_DIR.is_absolute()}")
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Set defaults
        analysisType = analysisType or "auto"
        uploadMode = uploadMode or "file"
        
        # Determine file type
        filename_lower = file.filename.lower()
        if any(filename_lower.endswith(ext) for ext in ['.mp3', '.wav', '.m4a', '.flac', '.aac', '.ogg']):
            file_type = 'audio'
        elif any(filename_lower.endswith(ext) for ext in ['.mp4', '.avi', '.mov', '.wmv', '.webm', '.mkv']):
            file_type = 'video'
        else:
            file_type = 'unknown'
        
        if analysisType in ['audio', 'video', 'speech']:
            file_type = 'audio' if analysisType == 'speech' else analysisType
        
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        logger.info(f"Generated analysis ID: {analysis_id}")
        
        # Build file path - MUST BE ABSOLUTE
        file_extension = Path(file.filename).suffix
        saved_filename = f"{analysis_id}{file_extension}"
        
        # Ensure UPLOADS_DIR is absolute
        if not UPLOADS_DIR.is_absolute():
            UPLOADS_DIR = UPLOADS_DIR.resolve()
        
        # Ensure directory exists
        if not UPLOADS_DIR.exists():
            logger.info(f"Creating UPLOADS_DIR: {UPLOADS_DIR}")
            UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
        
        # Build absolute file path
        file_path = UPLOADS_DIR / saved_filename
        file_path = file_path.resolve()  # Ensure absolute
        
        # Convert to string for open()
        file_path_str = str(file_path)
        
        logger.info(f"Target file path: {file_path_str}")
        logger.info(f"Target path is absolute: {os.path.isabs(file_path_str)}")
        
        # Read file content
        file_content = await file.read()
        logger.info(f"Read {len(file_content)} bytes")
        
        # Write file
        try:
            # Ensure parent directory exists
            os.makedirs(os.path.dirname(file_path_str), exist_ok=True)
            
            # Write using absolute path string
            with open(file_path_str, 'wb') as f:
                f.write(file_content)
            
            logger.info(f"File written successfully to: {file_path_str}")
            
            # Verify file exists
            if not os.path.exists(file_path_str):
                raise FileNotFoundError(f"File not found after write: {file_path_str}")
            
            file_size = os.path.getsize(file_path_str)
            logger.info(f"File verified: {file_path_str} ({file_size} bytes)")
            
        except Exception as e:
            logger.error(f"Error writing file: {e}")
            logger.error(f"Attempted path: {file_path_str}")
            logger.error(f"Path is absolute: {os.path.isabs(file_path_str)}")
            logger.error(f"Parent exists: {os.path.exists(os.path.dirname(file_path_str))}")
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
        # Create session data with absolute path
        session_data = {
            "id": analysis_id,
            "originalName": file.filename,
            "filename": saved_filename,
            "path": file_path_str,  # Absolute path
            "size": len(file_content),
            "mimetype": file.content_type or "application/octet-stream",
            "type": file_type,
            "uploadMode": uploadMode,
            "analysisType": analysisType,
            "createdAt": datetime.now().isoformat(),
            "uploadedAt": datetime.now().isoformat(),
            "status": "uploaded",
            "results": None,
            "error": None
        }
        
        # Save session data
        try:
            if not SESSIONS_DIR.is_absolute():
                SESSIONS_DIR = SESSIONS_DIR.resolve()
            
            if not SESSIONS_DIR.exists():
                SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
            
            session_path = SESSIONS_DIR / f"{analysis_id}.json"
            session_path_str = str(session_path.resolve())
            
            with open(session_path_str, 'w', encoding='utf-8') as f:
                json.dump(session_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Session saved: {session_path_str}")
            
        except Exception as e:
            logger.error(f"Error saving session: {e}")
            # Clean up uploaded file
            try:
                if os.path.exists(file_path_str):
                    os.remove(file_path_str)
            except:
                pass
            raise HTTPException(status_code=500, detail=f"Failed to save session: {str(e)}")
        
        logger.info(f"=== UPLOAD SUCCESS: {analysis_id} ===")
        
        return {
            "success": True,
            "message": "File uploaded successfully",
            "data": {
                "analysisId": analysis_id,
                "filename": file.filename,
                "size": len(file_content),
                "type": file_type,
                "uploadMode": uploadMode
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/text")
async def upload_text(
    textContent: str = Form(...),
    analysisType: Optional[str] = Form(None)
):
    """
    Upload text for analysis
    """
    global SESSIONS_DIR
    
    try:
        logger.info(f"Text upload - length: {len(textContent) if textContent else 0}")
        
        if not textContent or not textContent.strip():
            raise HTTPException(status_code=400, detail="No text content provided")
        
        analysis_id = str(uuid.uuid4())
        
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
        
        # Save session
        if not SESSIONS_DIR.is_absolute():
            SESSIONS_DIR = SESSIONS_DIR.resolve()
        
        if not SESSIONS_DIR.exists():
            SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
        
        session_path = str((SESSIONS_DIR / f"{analysis_id}.json").resolve())
        
        with open(session_path, 'w', encoding='utf-8') as f:
            json.dump(session_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Text session saved: {session_path}")
        
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
        logger.error(f"Error uploading text: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

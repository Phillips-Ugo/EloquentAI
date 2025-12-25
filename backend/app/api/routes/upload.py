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
        # Fallback to temp directory
        Path.home() / ".media_analyzer" / "uploads",
    ]
    
    for path in possible_paths:
        try:
            # Create directory if it doesn't exist
            path.mkdir(parents=True, exist_ok=True)
            
            # Test write permissions
            test_file = path / ".write_test"
            test_file.touch()
            test_file.unlink()
            
            logger.info(f"Using uploads directory: {path}")
            return path
        except Exception as e:
            logger.warning(f"Cannot use path {path}: {e}")
            continue
    
    # If all else fails, use temp directory
    import tempfile
    temp_path = Path(tempfile.gettempdir()) / "media_analyzer_uploads"
    temp_path.mkdir(parents=True, exist_ok=True)
    logger.warning(f"Using temporary uploads directory: {temp_path}")
    return temp_path

# Path to sessions directory
def get_sessions_dir():
    """Get the sessions directory path"""
    possible_paths = [
        Path(__file__).parent.parent.parent.parent.parent / "server" / "sessions",
        Path(__file__).parent.parent.parent.parent / "server" / "sessions",
        Path("server/sessions"),
        Path("../server/sessions"),
        # Fallback to temp directory
        Path.home() / ".media_analyzer" / "sessions",
    ]
    
    for path in possible_paths:
        try:
            # Create directory if it doesn't exist
            path.mkdir(parents=True, exist_ok=True)
            
            # Test write permissions
            test_file = path / ".write_test"
            test_file.touch()
            test_file.unlink()
            
            logger.info(f"Using sessions directory: {path}")
            return path
        except Exception as e:
            logger.warning(f"Cannot use path {path}: {e}")
            continue
    
    # If all else fails, use temp directory
    import tempfile
    temp_path = Path(tempfile.gettempdir()) / "media_analyzer_sessions"
    temp_path.mkdir(parents=True, exist_ok=True)
    logger.warning(f"Using temporary sessions directory: {temp_path}")
    return temp_path

# Initialize directories (lazy initialization to avoid startup crashes)
UPLOADS_DIR = None
SESSIONS_DIR = None

def ensure_directories():
    """Ensure directories are initialized"""
    global UPLOADS_DIR, SESSIONS_DIR
    if UPLOADS_DIR is None or SESSIONS_DIR is None:
        try:
            UPLOADS_DIR = get_uploads_dir()
            SESSIONS_DIR = get_sessions_dir()
            logger.info(f"Directories initialized - Uploads: {UPLOADS_DIR}, Sessions: {SESSIONS_DIR}")
        except Exception as e:
            logger.error(f"Failed to initialize directories: {e}")
            # Use temp directories as fallback
            import tempfile
            UPLOADS_DIR = Path(tempfile.gettempdir()) / "media_analyzer_uploads"
            SESSIONS_DIR = Path(tempfile.gettempdir()) / "media_analyzer_sessions"
            UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
            SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
            logger.warning(f"Using fallback temp directories: {UPLOADS_DIR}, {SESSIONS_DIR}")

@router.post("/")
@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    analysisType: Optional[str] = Form(None),
    uploadMode: Optional[str] = Form(None)
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
        # Ensure directories are initialized
        ensure_directories()
        
        logger.info(f"Upload request - filename: {file.filename}, analysisType: {analysisType}, uploadMode: {uploadMode}")
        
        # Validate file
        if not file.filename:
            logger.error("No filename provided")
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
        
        # Override with analysisType if provided and valid
        if analysisType and analysisType in ['audio', 'video', 'speech']:
            if analysisType == 'speech':
                file_type = 'audio'
            else:
                file_type = analysisType
        
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        logger.info(f"Generated analysis ID: {analysis_id}")
        
        # Save file
        file_extension = Path(file.filename).suffix
        saved_filename = f"{analysis_id}{file_extension}"
        file_path = UPLOADS_DIR / saved_filename
        
        logger.info(f"Saving file to: {file_path}")
        
        # Read and save file
        try:
            file_content = await file.read()
            logger.info(f"Read {len(file_content)} bytes from uploaded file")
            
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            logger.info(f"File saved successfully: {file_path}")
        except Exception as e:
            logger.error(f"Error saving file: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
        
        # Create session data
        session_data = {
            "id": analysis_id,
            "originalName": file.filename,
            "filename": saved_filename,
            "path": str(file_path),
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
            session_path = SESSIONS_DIR / f"{analysis_id}.json"
            logger.info(f"Saving session data to: {session_path}")
            
            with open(session_path, 'w', encoding='utf-8') as f:
                json.dump(session_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Session data saved successfully")
        except Exception as e:
            logger.error(f"Error saving session data: {e}")
            # Try to clean up uploaded file
            try:
                if file_path.exists():
                    file_path.unlink()
            except:
                pass
            raise HTTPException(status_code=500, detail=f"Failed to save session data: {str(e)}")
        
        logger.info(f"File uploaded successfully: {file.filename} -> {analysis_id}")
        
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
        logger.error(f"Unexpected error uploading file: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.post("/text")
async def upload_text(
    textContent: str = Form(...),
    analysisType: Optional[str] = Form(None)
):
    """
    Upload text for analysis
    
    - **textContent**: Text content to analyze
    - **analysisType**: Type of analysis (text)
    
    Returns:
    - analysisId: Unique ID for the analysis session
    """
    try:
        # Ensure directories are initialized
        ensure_directories()
        
        logger.info(f"Text upload request - length: {len(textContent) if textContent else 0}")
        
        if not textContent or not textContent.strip():
            logger.error("No text content provided")
            raise HTTPException(status_code=400, detail="No text content provided")
        
        # Set default
        analysisType = analysisType or "text"
        
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        logger.info(f"Generated analysis ID for text: {analysis_id}")
        
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
            "analysisType": analysisType,
            "textContent": textContent,
            "createdAt": datetime.now().isoformat(),
            "uploadedAt": datetime.now().isoformat(),
            "status": "uploaded",
            "results": None,
            "error": None
        }
        
        # Save session data
        try:
            session_path = SESSIONS_DIR / f"{analysis_id}.json"
            logger.info(f"Saving text session data to: {session_path}")
            
            with open(session_path, 'w', encoding='utf-8') as f:
                json.dump(session_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Text session data saved successfully")
        except Exception as e:
            logger.error(f"Error saving text session data: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save session data: {str(e)}")
        
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
        logger.error(f"Unexpected error uploading text: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload text: {str(e)}"
        )
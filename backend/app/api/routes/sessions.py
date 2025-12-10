"""
Session management API routes
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from typing import Optional
import logging
import uuid
from datetime import datetime

from app.models.schemas import (
    SessionFinalizeRequest,
    SessionFinalizeResponse,
    SessionSummary
)
from app.services.session_service import SessionService

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize session service
session_service = SessionService()

@router.post("/finalize", response_model=SessionFinalizeResponse)
async def finalize_session(
    background_tasks: BackgroundTasks,
    request: SessionFinalizeRequest
):
    """
    Finalize a communication coaching session and generate reports
    
    - **session_id**: ID of the session to finalize
    - **summary_requested**: Whether to generate a detailed summary
    
    Returns:
    - Report URL (if generated)
    - Base64 encoded PDF (if requested)
    - Session summary with insights and recommendations
    """
    try:
        logger.info(f"Finalizing session {request.session_id}")
        
        # Generate session summary
        summary = await session_service.generate_session_summary(
            session_id=request.session_id,
            include_recommendations=True
        )
        
        # Generate report if requested
        report_url = None
        pdf_content = None
        
        if request.summary_requested:
            # Generate PDF report
            pdf_content = await session_service.generate_pdf_report(
                session_id=request.session_id,
                summary=summary
            )
            
            # In a real implementation, you would save the PDF and return a URL
            # For now, we'll return the base64 content directly
        
        # Update session status
        background_tasks.add_task(
            update_session_status,
            session_id=request.session_id,
            status="completed"
        )
        
        logger.info(f"Session {request.session_id} finalized successfully")
        
        return SessionFinalizeResponse(
            report_url=report_url,
            pdf=pdf_content,
            summary=summary
        )
        
    except Exception as e:
        logger.error(f"Failed to finalize session {request.session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to finalize session: {str(e)}")

@router.get("/{session_id}/summary")
async def get_session_summary(session_id: str):
    """Get summary for a specific session"""
    try:
        summary = await session_service.generate_session_summary(session_id)
        return summary
    except Exception as e:
        logger.error(f"Failed to get session summary for {session_id}: {str(e)}")
        raise HTTPException(status_code=404, detail="Session not found")

@router.get("/{session_id}/history")
async def get_session_history(session_id: str):
    """Get detailed history for a session"""
    try:
        history = await session_service.get_session_history(session_id)
        return history
    except Exception as e:
        logger.error(f"Failed to get session history for {session_id}: {str(e)}")
        raise HTTPException(status_code=404, detail="Session not found")

@router.delete("/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and all associated data"""
    try:
        await session_service.delete_session(session_id)
        return {"message": "Session deleted successfully"}
    except Exception as e:
        logger.error(f"Failed to delete session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete session")

async def update_session_status(session_id: str, status: str):
    """Update session status in background task"""
    try:
        # This would typically update the database
        logger.info(f"Updated session {session_id} status to {status}")
    except Exception as e:
        logger.error(f"Failed to update session status: {str(e)}")

"""
Health check API routes
"""

from fastapi import APIRouter
import logging
from datetime import datetime
from typing import Dict, Any

from app.models.schemas import HealthResponse
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint
    
    Returns the current status of the API and its services
    """
    try:
        # Check various services
        services_status = await check_services()
        
        return HealthResponse(
            status="healthy",
            timestamp=datetime.utcnow().isoformat(),
            version=settings.VERSION,
            services=services_status
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            timestamp=datetime.utcnow().isoformat(),
            version=settings.VERSION,
            services={"error": str(e)}
        )

@router.get("/health/ready")
async def readiness_check():
    """Readiness check for Kubernetes/Docker"""
    try:
        # Check if all required services are ready
        services_status = await check_services()
        
        # Check if any critical services are down
        critical_services = ["database", "ml_models"]
        for service in critical_services:
            if services_status.get(service) != "healthy":
                return {"status": "not_ready", "reason": f"{service} not available"}
        
        return {"status": "ready"}
        
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return {"status": "not_ready", "reason": str(e)}

@router.get("/health/live")
async def liveness_check():
    """Liveness check for Kubernetes/Docker"""
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}

async def check_services() -> Dict[str, str]:
    """Check the status of various services"""
    services = {}
    
    try:
        # Check database
        services["database"] = await check_database()
        
        # Check ML models
        services["ml_models"] = await check_ml_models()
        
        # Check file storage
        services["file_storage"] = await check_file_storage()
        
        # Check Redis (if configured)
        services["redis"] = await check_redis()
        
        # Check external APIs
        services["external_apis"] = await check_external_apis()
        
    except Exception as e:
        logger.error(f"Service check failed: {e}")
        services["error"] = str(e)
    
    return services

async def check_database() -> str:
    """Check database connectivity"""
    try:
        # In a real implementation, this would test database connectivity
        # For now, we'll assume it's healthy
        return "healthy"
    except Exception as e:
        logger.error(f"Database check failed: {e}")
        return "unhealthy"

async def check_ml_models() -> str:
    """Check ML model availability"""
    try:
        # Check if models are loaded and available
        if settings.MOCK_RESPONSES:
            return "mock_mode"
        
        # In a real implementation, this would check if models are loaded
        return "healthy"
    except Exception as e:
        logger.error(f"ML models check failed: {e}")
        return "unhealthy"

async def check_file_storage() -> str:
    """Check file storage availability"""
    try:
        import os
        if os.path.exists(settings.UPLOAD_DIR):
            return "healthy"
        else:
            return "unhealthy"
    except Exception as e:
        logger.error(f"File storage check failed: {e}")
        return "unhealthy"

async def check_redis() -> str:
    """Check Redis connectivity"""
    try:
        # In a real implementation, this would test Redis connectivity
        # For now, we'll assume it's healthy if configured
        if settings.REDIS_URL:
            return "healthy"
        else:
            return "not_configured"
    except Exception as e:
        logger.error(f"Redis check failed: {e}")
        return "unhealthy"

async def check_external_apis() -> str:
    """Check external API dependencies"""
    try:
        # In a real implementation, this would check external APIs
        # For now, we'll assume they're healthy
        return "healthy"
    except Exception as e:
        logger.error(f"External APIs check failed: {e}")
        return "unhealthy"

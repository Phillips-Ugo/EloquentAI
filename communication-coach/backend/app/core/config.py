"""
Application configuration
"""

from pydantic import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Communication Coach"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3000",
        "https://localhost:3001",
    ]
    
    # Database Configuration
    DATABASE_URL: str = "sqlite:///./communication_coach.db"
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_PORT: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    
    @property
    def POSTGRES_URL(self) -> Optional[str]:
        if all([
            self.POSTGRES_USER,
            self.POSTGRES_PASSWORD,
            self.POSTGRES_SERVER,
            self.POSTGRES_PORT,
            self.POSTGRES_DB
        ]):
            return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        return None
    
    # Redis Configuration
    REDIS_URL: str = "redis://localhost:6379"
    
    # ML Model Configuration
    MODEL_CACHE_DIR: str = "./models"
    AUDIO_MODEL_PATH: str = "./models/audio_emotion_model.pt"
    MAX_AUDIO_FILE_SIZE: int = 100 * 1024 * 1024  # 100MB
    SUPPORTED_AUDIO_FORMATS: List[str] = ["audio/wav", "audio/mp3", "audio/m4a", "audio/aac"]
    
    # Audio Processing Configuration
    TARGET_SAMPLE_RATE: int = 16000
    TARGET_CHANNELS: int = 1
    MAX_AUDIO_DURATION: int = 300  # 5 minutes
    
    # Heuristics Configuration
    EYE_CONTACT_YAW_THRESHOLD: float = 15.0
    EYE_CONTACT_PITCH_THRESHOLD: float = 12.0
    SMILE_RATIO_THRESHOLD: float = 0.38
    POSTURE_WARNING_ANGLE: float = 12.0
    POSTURE_CRITICAL_ANGLE: float = 25.0
    FIDGET_VELOCITY_THRESHOLD: float = 0.18
    
    # Speech Analysis Configuration
    IDEAL_WPM_MIN: int = 120
    IDEAL_WPM_MAX: int = 160
    SLOW_WPM_THRESHOLD: int = 100
    FAST_WPM_THRESHOLD: int = 180
    
    # Security Configuration
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"
    
    # File Storage Configuration
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # Monitoring Configuration
    SENTRY_DSN: Optional[str] = None
    ENABLE_METRICS: bool = True
    
    # Development Configuration
    MOCK_RESPONSES: bool = False  # Set to True for development without ML models
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Create directories if they don't exist
os.makedirs(settings.MODEL_CACHE_DIR, exist_ok=True)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

"""
Application configuration settings
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    """Application settings"""
    
    # Basic app settings
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "info")
    
    # Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "your-jwt-secret-key-here")
    ENCRYPTION_KEY: str = os.getenv("ENCRYPTION_KEY", "your-32-byte-encryption-key-here")
    HMAC_SECRET: str = os.getenv("HMAC_SECRET", "your-hmac-secret-key-here")
    
    # CORS and security
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1", "0.0.0.0", "testserver"]
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://testserver"
    ]
    
    # Supabase configuration
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    
    # Redis configuration
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # External API keys
    AGMARKNET_API_KEY: Optional[str] = os.getenv("AGMARKNET_API_KEY")
    WEATHER_API_KEY: Optional[str] = os.getenv("WEATHER_API_KEY")
    BHASHINI_API_KEY: Optional[str] = os.getenv("BHASHINI_API_KEY")
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_PER_HOUR: int = 1000
    
    # PPI calculation settings
    PPI_CACHE_TTL: int = 300  # 5 minutes
    PPI_CALCULATION_TIMEOUT: int = 10  # 10 seconds
    
    # Voice processing settings
    VOICE_PROCESSING_TIMEOUT: int = 30  # 30 seconds
    ASR_ACCURACY_THRESHOLD: float = 0.85
    
    # Offline sync settings
    OFFLINE_CACHE_SIZE_MB: int = 50
    OFFLINE_SYNC_BATCH_SIZE: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Global settings instance
settings = Settings()
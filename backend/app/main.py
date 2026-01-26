"""
Market Mania FastAPI Application
Main entry point for the multilingual marketplace backend
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import init_db
from app.core.redis_client import init_redis
from app.core.logging_config import setup_logging
from app.middleware.rate_limiting import RateLimitMiddleware

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    setup_logging()
    await init_db()
    await init_redis()
    yield
    # Shutdown
    # Add cleanup code here if needed

app = FastAPI(
    title="Market Mania API",
    description="Multilingual marketplace application for Indian vendors with OTP authentication",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Rate limiting middleware (add before CORS)
app.add_middleware(
    RateLimitMiddleware,
    calls_per_minute=settings.RATE_LIMIT_PER_MINUTE,
    calls_per_hour=settings.RATE_LIMIT_PER_HOUR
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Market Mania API is running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        from app.core.database import DatabaseManager
        from app.core.redis_client import CacheManager
        
        db_manager = DatabaseManager()
        cache_manager = CacheManager()
        
        db_healthy = await db_manager.health_check()
        redis_healthy = await cache_manager.health_check()
        
        return {
            "status": "healthy" if db_healthy and redis_healthy else "degraded",
            "database": "connected" if db_healthy else "disconnected",
            "redis": "connected" if redis_healthy else "disconnected",
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "unknown",
            "redis": "unknown",
            "version": "1.0.0",
            "error": str(e)
        }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )
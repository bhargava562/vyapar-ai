"""
Database configuration and connection management
"""

from supabase import create_client, Client
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Global Supabase client
supabase: Client = None

async def init_db():
    """Initialize database connection"""
    global supabase
    
    try:
        supabase = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
        logger.info("Database connection initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

def get_supabase() -> Client:
    """Get Supabase client instance"""
    if supabase is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return supabase

class DatabaseManager:
    """Database operations manager"""
    
    def __init__(self):
        self.client = get_supabase()
    
    async def health_check(self) -> bool:
        """Check database connectivity"""
        try:
            # Simple query to test connection
            result = self.client.table("vendors").select("count").limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False
    
    async def cleanup_expired_data(self):
        """Clean up expired data (OTPs, PPI calculations, etc.)"""
        try:
            # This would call the cleanup_expired_data() function in the database
            result = self.client.rpc("cleanup_expired_data").execute()
            logger.info("Expired data cleanup completed")
        except Exception as e:
            logger.error(f"Failed to cleanup expired data: {e}")
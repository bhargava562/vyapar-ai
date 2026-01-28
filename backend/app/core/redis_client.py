"""
Redis client configuration and caching utilities
"""

import redis.asyncio as redis
from app.core.config import settings
import json
import logging
from typing import Any, Optional

logger = logging.getLogger(__name__)

# Global Redis client
redis_client: Optional[redis.Redis] = None

async def init_redis():
    """Initialize Redis connection"""
    global redis_client
    
    try:
        redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True
        )
        # Test connection
        await redis_client.ping()
        logger.info("Redis connection initialized successfully")
    except Exception as e:

        logger.warning(f"Failed to initialize Redis: {e}. Running without cache/rate-limiting.")
        # Do not raise, allow app to start without Redis
        # raise

def get_redis() -> redis.Redis:
    """Get Redis client instance"""
    if redis_client is None:
        raise RuntimeError("Redis not initialized. Call init_redis() first.")
    return redis_client

class CacheManager:
    """Redis cache operations manager"""
    
    def __init__(self):
        self.client = get_redis()
    
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set cache value with TTL"""
        try:
            serialized_value = json.dumps(value) if not isinstance(value, str) else value
            await self.client.setex(key, ttl, serialized_value)
            return True
        except Exception as e:
            logger.error(f"Failed to set cache key {key}: {e}")
            return False
    
    async def get(self, key: str) -> Optional[Any]:
        """Get cache value"""
        try:
            value = await self.client.get(key)
            if value is None:
                return None
            
            # Try to deserialize JSON, fallback to string
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return value
        except Exception as e:
            logger.error(f"Failed to get cache key {key}: {e}")
            return None
    
    async def delete(self, key: str) -> bool:
        """Delete cache key"""
        try:
            await self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Failed to delete cache key {key}: {e}")
            return False
    
    async def exists(self, key: str) -> bool:
        """Check if cache key exists"""
        try:
            return await self.client.exists(key) > 0
        except Exception as e:
            logger.error(f"Failed to check cache key {key}: {e}")
            return False
    
    async def health_check(self) -> bool:
        """Check Redis connectivity"""
        try:
            await self.client.ping()
            return True
        except Exception as e:
            logger.error(f"Redis health check failed: {e}")
            return False

# Cache key generators
def get_ppi_cache_key(vendor_id: str, product_id: str) -> str:
    """Generate PPI cache key"""
    return f"ppi:{vendor_id}:{product_id}"

def get_market_data_cache_key(location: str, date: str) -> str:
    """Generate market data cache key"""
    return f"market_data:{location}:{date}"

def get_vendor_session_key(session_id: str) -> str:
    """Generate vendor session cache key"""
    return f"vendor_session:{session_id}"

def get_voice_processing_key(request_id: str) -> str:
    """Generate voice processing cache key"""
    return f"voice_processing:{request_id}"

def get_fpc_verification_key(qr_code: str) -> str:
    """Generate FPC verification cache key"""
    return f"fpc_verification:{qr_code}"
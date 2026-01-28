"""
Rate limiting middleware for API endpoints
Provides additional protection against abuse and brute force attacks
"""

from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import time
import hashlib
import logging
from typing import Dict, Tuple, Any

from app.core.redis_client import get_redis
from app.core.config import settings

logger = logging.getLogger(__name__)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware with sliding window algorithm
    """
    
    def __init__(self, app, calls_per_minute: int = 60, calls_per_hour: int = 1000):
        super().__init__(app)
        self.calls_per_minute = calls_per_minute
        self.calls_per_hour = calls_per_hour
        
        # Sensitive endpoints with stricter limits
        self.sensitive_endpoints = {
            "/api/v1/auth/login": {"per_minute": 5, "per_hour": 20},
            "/api/v1/auth/verify-otp": {"per_minute": 10, "per_hour": 50},
            "/api/v1/auth/refresh": {"per_minute": 20, "per_hour": 200}
        }
    
    def _get_client_identifier(self, request: Request) -> str:
        """Get unique identifier for client (IP + User-Agent hash)"""
        if request.client and request.client.host:
            client_ip = request.client.host
        else:
            client_ip = "unknown"
        user_agent = request.headers.get("user-agent", "")
        
        # Create hash of IP + User-Agent for privacy
        identifier = f"{client_ip}:{hashlib.md5(user_agent.encode()).hexdigest()[:8]}"
        return identifier
    
    async def _check_rate_limit(self, identifier: str, endpoint: str) -> Tuple[bool, Dict[str, Any]]:
        """Check if request is within rate limits"""
        try:
            redis = get_redis()
            current_time = int(time.time())
            
            # Get limits for endpoint
            if endpoint in self.sensitive_endpoints:
                limits = self.sensitive_endpoints[endpoint]
                minute_limit = limits["per_minute"]
                hour_limit = limits["per_hour"]
            else:
                minute_limit = self.calls_per_minute
                hour_limit = self.calls_per_hour
            
            # Check minute window
            minute_key = f"rate_limit:minute:{identifier}:{current_time // 60}"
            minute_count = await redis.get(minute_key)
            minute_count = int(minute_count) if minute_count else 0
            
            # Check hour window
            hour_key = f"rate_limit:hour:{identifier}:{current_time // 3600}"
            hour_count = await redis.get(hour_key)
            hour_count = int(hour_count) if hour_count else 0
            
            # Check limits
            if minute_count >= minute_limit:
                return False, {
                    "limit": minute_limit,
                    "remaining": 0,
                    "reset": ((current_time // 60) + 1) * 60,
                    "window": "minute"
                }
            
            if hour_count >= hour_limit:
                return False, {
                    "limit": hour_limit,
                    "remaining": 0,
                    "reset": ((current_time // 3600) + 1) * 3600,
                    "window": "hour"
                }
            
            return True, {
                "minute_limit": minute_limit,
                "minute_remaining": minute_limit - minute_count - 1,
                "hour_limit": hour_limit,
                "hour_remaining": hour_limit - hour_count - 1
            }
            
        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            # Allow request on error to prevent blocking legitimate users
            return True, {}
    
    async def _increment_counters(self, identifier: str):
        """Increment rate limit counters"""
        try:
            redis = get_redis()
            current_time = int(time.time())
            
            # Increment minute counter
            minute_key = f"rate_limit:minute:{identifier}:{current_time // 60}"
            await redis.incr(minute_key)
            await redis.expire(minute_key, 60)  # Expire after 1 minute
            
            # Increment hour counter
            hour_key = f"rate_limit:hour:{identifier}:{current_time // 3600}"
            await redis.incr(hour_key)
            await redis.expire(hour_key, 3600)  # Expire after 1 hour
            
        except Exception as e:
            logger.error(f"Failed to increment rate limit counters: {e}")
    
    async def dispatch(self, request: Request, call_next) -> Response:
        """Process request with rate limiting"""
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/", "/health", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get client identifier
        identifier = self._get_client_identifier(request)
        endpoint = request.url.path
        
        # Check rate limits
        allowed, rate_info = await self._check_rate_limit(identifier, endpoint)
        
        if not allowed:
            # Log rate limit violation
            logger.warning(f"Rate limit exceeded for {identifier} on {endpoint}")
            
            # Return rate limit error
            headers = {
                "X-RateLimit-Limit": str(rate_info["limit"]),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(rate_info["reset"]),
                "Retry-After": str(rate_info["reset"] - int(time.time()))
            }
            
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {rate_info['reset'] - int(time.time())} seconds.",
                headers=headers
            )
        
        # Increment counters for successful requests
        await self._increment_counters(identifier)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        if rate_info:
            response.headers["X-RateLimit-Minute-Limit"] = str(rate_info.get("minute_limit", ""))
            response.headers["X-RateLimit-Minute-Remaining"] = str(rate_info.get("minute_remaining", ""))
            response.headers["X-RateLimit-Hour-Limit"] = str(rate_info.get("hour_limit", ""))
            response.headers["X-RateLimit-Hour-Remaining"] = str(rate_info.get("hour_remaining", ""))
        
        return response

class BruteForceProtection:
    """
    Additional brute force protection for authentication endpoints
    """
    
    def __init__(self):
        self.max_failed_attempts = 5
        self.lockout_duration = 15 * 60  # 15 minutes
        self.progressive_lockout = True
    
    async def record_failed_attempt(self, identifier: str, endpoint: str):
        """Record a failed authentication attempt"""
        try:
            redis = get_redis()
            key = f"failed_attempts:{endpoint}:{identifier}"
            
            # Get current failed attempts
            attempts = await redis.get(key)
            attempts = int(attempts) if attempts else 0
            
            attempts += 1
            
            # Calculate lockout duration (progressive)
            if self.progressive_lockout:
                lockout_duration = min(self.lockout_duration * (2 ** (attempts - self.max_failed_attempts)), 3600)  # Max 1 hour
            else:
                lockout_duration = self.lockout_duration
            
            # Store failed attempts with expiry
            await redis.setex(key, lockout_duration, attempts)
            
            # If exceeded max attempts, set lockout
            if attempts >= self.max_failed_attempts:
                lockout_key = f"lockout:{endpoint}:{identifier}"
                lockout_until = int(time.time()) + lockout_duration
                await redis.setex(lockout_key, lockout_duration, lockout_until)
                
                logger.warning(f"Account locked for {identifier} on {endpoint} after {attempts} failed attempts")
            
        except Exception as e:
            logger.error(f"Failed to record failed attempt: {e}")
    
    async def is_locked_out(self, identifier: str, endpoint: str) -> Tuple[bool, int]:
        """Check if identifier is locked out"""
        try:
            redis = get_redis()
            lockout_key = f"lockout:{endpoint}:{identifier}"
            
            lockout_until = await redis.get(lockout_key)
            if not lockout_until:
                return False, 0
            
            lockout_until = int(lockout_until)
            current_time = int(time.time())
            
            if current_time < lockout_until:
                return True, lockout_until - current_time
            else:
                # Lockout expired, clean up
                await redis.delete(lockout_key)
                failed_attempts_key = f"failed_attempts:{endpoint}:{identifier}"
                await redis.delete(failed_attempts_key)
                return False, 0
                
        except Exception as e:
            logger.error(f"Failed to check lockout status: {e}")
            return False, 0
    
    async def clear_failed_attempts(self, identifier: str, endpoint: str):
        """Clear failed attempts after successful authentication"""
        try:
            redis = get_redis()
            failed_attempts_key = f"failed_attempts:{endpoint}:{identifier}"
            lockout_key = f"lockout:{endpoint}:{identifier}"
            
            await redis.delete(failed_attempts_key)
            await redis.delete(lockout_key)
            
        except Exception as e:
            logger.error(f"Failed to clear failed attempts: {e}")


def rate_limit(calls: int = 60, period: int = 60):
    """
    Endpoint-level rate limiting decorator.
    
    Provides fine-grained rate limiting for individual endpoints.
    Uses Redis for distributed rate limit tracking.
    
    Args:
        calls: Maximum number of allowed calls within the period
        period: Time window in seconds for rate limiting
        
    Returns:
        Decorator function that wraps the endpoint with rate limiting logic
        
    Usage:
        @router.post("/endpoint")
        @rate_limit(calls=30, period=60)  # 30 calls per minute
        async def my_endpoint():
            ...
            
    Note:
        This decorator checks the rate limit before the endpoint executes.
        If the limit is exceeded, it raises an HTTP 429 Too Many Requests error.
    """
    from functools import wraps
    
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract the request object from kwargs or args
            request = kwargs.get('request')
            if not request:
                # Try to find Request in args (for dependency injection scenarios)
                for arg in args:
                    if isinstance(arg, Request):
                        request = arg
                        break
            
            # Get client identifier
            if request:
                client_ip = request.client.host if request.client else "unknown"
                endpoint = request.url.path
            else:
                client_ip = "unknown"
                endpoint = func.__name__
            
            identifier = f"{client_ip}:{endpoint}"
            
            try:
                redis = get_redis()
                current_time = int(time.time())
                window_key = current_time // period
                cache_key = f"rate_limit:endpoint:{identifier}:{window_key}"
                
                # Get current count
                current_count = await redis.get(cache_key)
                current_count = int(current_count) if current_count else 0
                
                # Check if limit exceeded
                if current_count >= calls:
                    reset_time = ((window_key + 1) * period) - current_time
                    raise HTTPException(
                        status_code=429,
                        detail=f"Rate limit exceeded. Try again in {reset_time} seconds.",
                        headers={
                            "X-RateLimit-Limit": str(calls),
                            "X-RateLimit-Remaining": "0",
                            "X-RateLimit-Reset": str((window_key + 1) * period),
                            "Retry-After": str(reset_time)
                        }
                    )
                
                # Increment counter
                await redis.incr(cache_key)
                await redis.expire(cache_key, period)
                
            except HTTPException:
                raise
            except Exception as e:
                # Log error but allow request (fail-open for availability)
                logger.error(f"Rate limit check failed for {identifier}: {e}")
            
            # Execute the wrapped function
            return await func(*args, **kwargs)
        
        return wrapper
    return decorator


# Global brute force protection instance
brute_force_protection = BruteForceProtection()
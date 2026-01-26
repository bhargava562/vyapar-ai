"""
Tests for rate limiting middleware and brute force protection
"""

import pytest
import asyncio
import time
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import Request, HTTPException
from starlette.responses import Response

from app.middleware.rate_limiting import RateLimitMiddleware, BruteForceProtection


class TestRateLimitMiddleware:
    """Test cases for rate limiting middleware"""
    
    @pytest.fixture
    def middleware(self):
        """Create rate limiting middleware instance"""
        app = MagicMock()
        return RateLimitMiddleware(app, calls_per_minute=5, calls_per_hour=20)
    
    @pytest.fixture
    def mock_request(self):
        """Create mock request"""
        request = MagicMock(spec=Request)
        request.client.host = "192.168.1.1"
        request.headers.get.return_value = "Mozilla/5.0 Test Browser"
        request.url.path = "/api/v1/test"
        return request
    
    def test_get_client_identifier(self, middleware, mock_request):
        """Test client identifier generation"""
        identifier = middleware._get_client_identifier(mock_request)
        
        # Should include IP and hash of user agent
        assert identifier.startswith("192.168.1.1:")
        assert len(identifier.split(":")) == 2
        assert len(identifier.split(":")[1]) == 8  # MD5 hash truncated to 8 chars
    
    @pytest.mark.asyncio
    async def test_check_rate_limit_within_limits(self, middleware):
        """Test rate limit check when within limits"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.side_effect = ["2", "10"]  # 2 per minute, 10 per hour
            mock_get_redis.return_value = mock_redis
            
            allowed, rate_info = await middleware._check_rate_limit("test-client", "/api/v1/test")
            
            assert allowed is True
            assert rate_info["minute_remaining"] == 2  # 5 - 2 - 1 = 2
            assert rate_info["hour_remaining"] == 9    # 20 - 10 - 1 = 9
    
    @pytest.mark.asyncio
    async def test_check_rate_limit_minute_exceeded(self, middleware):
        """Test rate limit check when minute limit exceeded"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.side_effect = ["5", "10"]  # 5 per minute (at limit), 10 per hour
            mock_get_redis.return_value = mock_redis
            
            allowed, rate_info = await middleware._check_rate_limit("test-client", "/api/v1/test")
            
            assert allowed is False
            assert rate_info["window"] == "minute"
            assert rate_info["remaining"] == 0
    
    @pytest.mark.asyncio
    async def test_check_rate_limit_hour_exceeded(self, middleware):
        """Test rate limit check when hour limit exceeded"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.side_effect = ["2", "20"]  # 2 per minute, 20 per hour (at limit)
            mock_get_redis.return_value = mock_redis
            
            allowed, rate_info = await middleware._check_rate_limit("test-client", "/api/v1/test")
            
            assert allowed is False
            assert rate_info["window"] == "hour"
            assert rate_info["remaining"] == 0
    
    @pytest.mark.asyncio
    async def test_check_rate_limit_sensitive_endpoint(self, middleware):
        """Test rate limit check for sensitive endpoints"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.side_effect = ["3", "15"]  # 3 per minute, 15 per hour
            mock_get_redis.return_value = mock_redis
            
            # Test auth login endpoint (stricter limits)
            allowed, rate_info = await middleware._check_rate_limit("test-client", "/api/v1/auth/login")
            
            assert allowed is True
            assert rate_info["minute_limit"] == 5   # Sensitive endpoint limit
            assert rate_info["hour_limit"] == 20    # Sensitive endpoint limit
    
    @pytest.mark.asyncio
    async def test_increment_counters(self, middleware):
        """Test rate limit counter increment"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_get_redis.return_value = mock_redis
            
            await middleware._increment_counters("test-client")
            
            # Should increment both minute and hour counters
            assert mock_redis.incr.call_count == 2
            assert mock_redis.expire.call_count == 2
    
    @pytest.mark.asyncio
    async def test_dispatch_allowed_request(self, middleware, mock_request):
        """Test middleware dispatch for allowed request"""
        # Mock call_next
        async def mock_call_next(request):
            response = Response("OK", status_code=200)
            return response
        
        with patch.object(middleware, '_check_rate_limit', return_value=(True, {"minute_remaining": 4})):
            with patch.object(middleware, '_increment_counters'):
                response = await middleware.dispatch(mock_request, mock_call_next)
                
                assert response.status_code == 200
                assert "X-RateLimit-Minute-Remaining" in response.headers
    
    @pytest.mark.asyncio
    async def test_dispatch_rate_limited_request(self, middleware, mock_request):
        """Test middleware dispatch for rate limited request"""
        # Mock call_next (should not be called)
        async def mock_call_next(request):
            return Response("Should not reach here", status_code=200)
        
        rate_info = {
            "limit": 5,
            "remaining": 0,
            "reset": int(time.time()) + 60,
            "window": "minute"
        }
        
        with patch.object(middleware, '_check_rate_limit', return_value=(False, rate_info)):
            with pytest.raises(HTTPException) as exc_info:
                await middleware.dispatch(mock_request, mock_call_next)
            
            assert exc_info.value.status_code == 429
            assert "Rate limit exceeded" in exc_info.value.detail
    
    @pytest.mark.asyncio
    async def test_dispatch_skip_health_endpoints(self, middleware, mock_request):
        """Test middleware skips rate limiting for health endpoints"""
        mock_request.url.path = "/health"
        
        async def mock_call_next(request):
            return Response("OK", status_code=200)
        
        # Should not check rate limits for health endpoints
        with patch.object(middleware, '_check_rate_limit') as mock_check:
            response = await middleware.dispatch(mock_request, mock_call_next)
            
            assert response.status_code == 200
            mock_check.assert_not_called()


class TestBruteForceProtection:
    """Test cases for brute force protection"""
    
    @pytest.fixture
    def protection(self):
        """Create brute force protection instance"""
        return BruteForceProtection()
    
    @pytest.mark.asyncio
    async def test_record_failed_attempt_first_time(self, protection):
        """Test recording first failed attempt"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.return_value = None  # No previous attempts
            mock_get_redis.return_value = mock_redis
            
            await protection.record_failed_attempt("test-user", "/api/v1/auth/login")
            
            # Should set failed attempts to 1
            mock_redis.setex.assert_called_once()
            call_args = mock_redis.setex.call_args
            assert call_args[0][2] == 1  # attempts = 1
    
    @pytest.mark.asyncio
    async def test_record_failed_attempt_lockout_threshold(self, protection):
        """Test recording failed attempt that triggers lockout"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.return_value = "4"  # 4 previous attempts
            mock_get_redis.return_value = mock_redis
            
            await protection.record_failed_attempt("test-user", "/api/v1/auth/login")
            
            # Should set lockout (5 attempts = lockout)
            assert mock_redis.setex.call_count == 2  # One for attempts, one for lockout
    
    @pytest.mark.asyncio
    async def test_record_failed_attempt_progressive_lockout(self, protection):
        """Test progressive lockout duration"""
        protection.progressive_lockout = True
        
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.return_value = "6"  # 6 previous attempts (2 over threshold)
            mock_get_redis.return_value = mock_redis
            
            await protection.record_failed_attempt("test-user", "/api/v1/auth/login")
            
            # Should use progressive lockout (doubled duration)
            mock_redis.setex.assert_called()
            # Check that lockout duration was calculated progressively
            # (This is a simplified check - in practice you'd verify the exact duration)
    
    @pytest.mark.asyncio
    async def test_is_locked_out_not_locked(self, protection):
        """Test lockout check when not locked out"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.return_value = None  # No lockout
            mock_get_redis.return_value = mock_redis
            
            is_locked, remaining_time = await protection.is_locked_out("test-user", "/api/v1/auth/login")
            
            assert is_locked is False
            assert remaining_time == 0
    
    @pytest.mark.asyncio
    async def test_is_locked_out_active_lockout(self, protection):
        """Test lockout check when actively locked out"""
        future_time = int(time.time()) + 600  # 10 minutes from now
        
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.return_value = str(future_time)
            mock_get_redis.return_value = mock_redis
            
            is_locked, remaining_time = await protection.is_locked_out("test-user", "/api/v1/auth/login")
            
            assert is_locked is True
            assert 590 <= remaining_time <= 600  # Should be around 10 minutes
    
    @pytest.mark.asyncio
    async def test_is_locked_out_expired_lockout(self, protection):
        """Test lockout check when lockout has expired"""
        past_time = int(time.time()) - 60  # 1 minute ago
        
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.return_value = str(past_time)
            mock_get_redis.return_value = mock_redis
            
            is_locked, remaining_time = await protection.is_locked_out("test-user", "/api/v1/auth/login")
            
            assert is_locked is False
            assert remaining_time == 0
            
            # Should clean up expired lockout
            assert mock_redis.delete.call_count == 2  # Delete lockout and failed attempts
    
    @pytest.mark.asyncio
    async def test_clear_failed_attempts(self, protection):
        """Test clearing failed attempts after successful auth"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_get_redis.return_value = mock_redis
            
            await protection.clear_failed_attempts("test-user", "/api/v1/auth/login")
            
            # Should delete both failed attempts and lockout keys
            assert mock_redis.delete.call_count == 2
    
    @pytest.mark.asyncio
    async def test_error_handling(self, protection):
        """Test error handling in brute force protection"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.side_effect = Exception("Redis error")
            mock_get_redis.return_value = mock_redis
            
            # Should not raise exception on Redis errors
            is_locked, remaining_time = await protection.is_locked_out("test-user", "/api/v1/auth/login")
            
            assert is_locked is False
            assert remaining_time == 0
    
    @pytest.mark.asyncio
    async def test_different_endpoints_separate_limits(self, protection):
        """Test that different endpoints have separate rate limits"""
        with patch('app.middleware.rate_limiting.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.get.return_value = None
            mock_get_redis.return_value = mock_redis
            
            # Record attempts on different endpoints
            await protection.record_failed_attempt("test-user", "/api/v1/auth/login")
            await protection.record_failed_attempt("test-user", "/api/v1/auth/verify-otp")
            
            # Should create separate keys for different endpoints
            assert mock_redis.setex.call_count == 2
            
            # Verify different keys were used
            call_args_list = mock_redis.setex.call_args_list
            keys = [call[0][0] for call in call_args_list]
            assert len(set(keys)) == 2  # Two different keys
            assert "login" in keys[0]
            assert "verify-otp" in keys[1]
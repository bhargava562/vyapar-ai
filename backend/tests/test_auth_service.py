"""
Unit tests for authentication service
Tests OTP generation, verification, rate limiting, and session management
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta
import secrets
import json

from app.services.auth_service import AuthService
from app.schemas.auth import AuthResponse


class TestAuthService:
    """Test cases for AuthService"""
    
    @pytest.fixture
    def auth_service(self):
        """Create AuthService instance with mocked dependencies"""
        with patch('app.services.auth_service.get_supabase') as mock_supabase, \
             patch('app.services.auth_service.get_redis') as mock_redis:
            
            # Mock Supabase client
            mock_supabase_client = MagicMock()
            mock_supabase.return_value = mock_supabase_client
            
            # Mock Redis client
            mock_redis_client = AsyncMock()
            mock_redis.return_value = mock_redis_client
            
            service = AuthService()
            service.supabase = mock_supabase_client
            service.redis = mock_redis_client
            
            return service
    
    def test_phone_validation(self, auth_service):
        """Test phone number validation"""
        # Valid Indian phone numbers
        assert auth_service._is_valid_phone("+919876543210")
        assert auth_service._is_valid_phone("9876543210")
        assert auth_service._is_valid_phone("919876543210")
        assert auth_service._is_valid_phone("+91 9876 543 210")
        
        # Invalid phone numbers
        assert not auth_service._is_valid_phone("1234567890")  # Doesn't start with 6-9
        assert not auth_service._is_valid_phone("98765432")    # Too short
        assert not auth_service._is_valid_phone("98765432101") # Too long
        assert not auth_service._is_valid_phone("+1234567890") # Wrong country code
    
    def test_email_validation(self, auth_service):
        """Test email validation"""
        # Valid emails
        assert auth_service._is_valid_email("test@example.com")
        assert auth_service._is_valid_email("vendor.123@marketplace.in")
        assert auth_service._is_valid_email("user+tag@domain.co.in")
        
        # Invalid emails
        assert not auth_service._is_valid_email("invalid-email")
        assert not auth_service._is_valid_email("@domain.com")
        assert not auth_service._is_valid_email("user@")
        assert not auth_service._is_valid_email("user@domain")
    
    def test_phone_normalization(self, auth_service):
        """Test phone number normalization"""
        assert auth_service._normalize_phone("9876543210") == "+919876543210"
        assert auth_service._normalize_phone("919876543210") == "+919876543210"
        assert auth_service._normalize_phone("+919876543210") == "+919876543210"
        assert auth_service._normalize_phone("+91 9876 543 210") == "+919876543210"
        assert auth_service._normalize_phone("98765-43210") == "+919876543210"
    
    def test_otp_generation(self, auth_service):
        """Test OTP generation"""
        otp = auth_service._generate_otp()
        
        # Check OTP properties
        assert len(otp) == 6
        assert otp.isdigit()
        assert 100000 <= int(otp) <= 999999
        
        # Generate multiple OTPs to ensure randomness
        otps = [auth_service._generate_otp() for _ in range(10)]
        assert len(set(otps)) > 1  # Should have some variation
    
    @pytest.mark.asyncio
    async def test_rate_limit_check_allowed(self, auth_service):
        """Test rate limit check when within limits"""
        # Mock Redis to return count within limit
        auth_service.redis.get.return_value = "2"  # 2 attempts out of 5 allowed
        
        allowed, remaining_time = await auth_service._check_rate_limit("test@example.com", "otp")
        
        assert allowed is True
        assert remaining_time == 0
    
    @pytest.mark.asyncio
    async def test_rate_limit_check_exceeded(self, auth_service):
        """Test rate limit check when limit exceeded"""
        # Mock Redis to return count exceeding limit
        auth_service.redis.get.side_effect = ["6", None]  # 6 attempts, no lockout yet
        auth_service.redis.setex = AsyncMock()
        
        allowed, remaining_time = await auth_service._check_rate_limit("test@example.com", "otp")
        
        assert allowed is False
        assert remaining_time == auth_service.lockout_duration
        
        # Verify lockout was set
        auth_service.redis.setex.assert_called()
    
    @pytest.mark.asyncio
    async def test_rate_limit_check_lockout_active(self, auth_service):
        """Test rate limit check when user is locked out"""
        future_time = int(datetime.now().timestamp()) + 600  # 10 minutes from now
        auth_service.redis.get.side_effect = ["6", str(future_time)]
        
        allowed, remaining_time = await auth_service._check_rate_limit("test@example.com", "otp")
        
        assert allowed is False
        assert 590 <= remaining_time <= 600  # Should be around 10 minutes
    
    @pytest.mark.asyncio
    async def test_send_otp_valid_phone(self, auth_service):
        """Test sending OTP to valid phone number"""
        # Mock dependencies
        auth_service.redis.get.return_value = "1"  # Within rate limit
        auth_service.redis.setex = AsyncMock()
        
        # Mock Supabase insert
        mock_result = MagicMock()
        mock_result.data = [{"id": "test-otp-id"}]
        auth_service.supabase.table.return_value.insert.return_value.execute.return_value = mock_result
        
        # Mock OTP notification
        with patch.object(auth_service, '_send_otp_notification', return_value=True):
            result = await auth_service.send_otp("+919876543210")
        
        assert result["success"] is True
        assert "token" in result
        assert result["expires_in"] == auth_service.otp_expiry
        assert "phone" in result["message"]
    
    @pytest.mark.asyncio
    async def test_send_otp_valid_email(self, auth_service):
        """Test sending OTP to valid email"""
        # Mock dependencies
        auth_service.redis.get.return_value = "1"  # Within rate limit
        auth_service.redis.setex = AsyncMock()
        
        # Mock Supabase insert
        mock_result = MagicMock()
        mock_result.data = [{"id": "test-otp-id"}]
        auth_service.supabase.table.return_value.insert.return_value.execute.return_value = mock_result
        
        # Mock OTP notification
        with patch.object(auth_service, '_send_otp_notification', return_value=True):
            result = await auth_service.send_otp("test@example.com")
        
        assert result["success"] is True
        assert "token" in result
        assert "email" in result["message"]
    
    @pytest.mark.asyncio
    async def test_send_otp_invalid_format(self, auth_service):
        """Test sending OTP with invalid format"""
        with pytest.raises(Exception) as exc_info:
            await auth_service.send_otp("invalid-format")
        
        assert "Invalid phone number or email format" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_send_otp_rate_limited(self, auth_service):
        """Test sending OTP when rate limited"""
        # Mock rate limit exceeded
        with patch.object(auth_service, '_check_rate_limit', return_value=(False, 900)):
            with pytest.raises(Exception) as exc_info:
                await auth_service.send_otp("+919876543210")
        
        assert "Rate limit exceeded" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_verify_otp_success(self, auth_service):
        """Test successful OTP verification"""
        # Mock Redis token lookup
        auth_service.redis.get.return_value = "test-otp-id"
        auth_service.redis.delete = AsyncMock()
        
        # Mock Supabase OTP record
        mock_otp_record = {
            "id": "test-otp-id",
            "phone_or_email": "+919876543210",
            "otp_code": "$2b$12$hashed_otp",  # This will be mocked in pwd_context.verify
            "attempts": 0,
            "verified": False,
            "expires_at": (datetime.now() + timedelta(minutes=5)).isoformat()
        }
        
        mock_result = MagicMock()
        mock_result.data = [mock_otp_record]
        auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        # Mock password verification
        auth_service.pwd_context.verify = MagicMock(return_value=True)
        
        # Mock vendor creation/retrieval
        mock_vendor = {"id": "vendor-123", "name": "Test Vendor"}
        with patch.object(auth_service, '_get_or_create_vendor', return_value=mock_vendor):
            # Mock JWT generation
            with patch.object(auth_service, '_generate_jwt_tokens', return_value=("access_token", "refresh_token")):
                # Mock session creation
                with patch.object(auth_service, '_create_vendor_session'):
                    result = await auth_service.verify_otp("test-token", "123456")
        
        assert isinstance(result, AuthResponse)
        assert result.access_token == "access_token"
        assert result.refresh_token == "refresh_token"
        assert result.vendor_id == "vendor-123"
    
    @pytest.mark.asyncio
    async def test_verify_otp_invalid_token(self, auth_service):
        """Test OTP verification with invalid token"""
        # Mock Redis to return None (token not found)
        auth_service.redis.get.return_value = None
        
        with pytest.raises(Exception) as exc_info:
            await auth_service.verify_otp("invalid-token", "123456")
        
        assert "Invalid or expired verification token" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_verify_otp_expired(self, auth_service):
        """Test OTP verification with expired OTP"""
        # Mock Redis token lookup
        auth_service.redis.get.return_value = "test-otp-id"
        
        # Mock expired OTP record
        mock_otp_record = {
            "id": "test-otp-id",
            "phone_or_email": "+919876543210",
            "otp_code": "$2b$12$hashed_otp",
            "attempts": 0,
            "verified": False,
            "expires_at": (datetime.now() - timedelta(minutes=1)).isoformat()  # Expired
        }
        
        mock_result = MagicMock()
        mock_result.data = [mock_otp_record]
        auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        with pytest.raises(Exception) as exc_info:
            await auth_service.verify_otp("test-token", "123456")
        
        assert "OTP has expired" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_verify_otp_wrong_code(self, auth_service):
        """Test OTP verification with wrong code"""
        # Mock Redis token lookup
        auth_service.redis.get.return_value = "test-otp-id"
        
        # Mock valid OTP record
        mock_otp_record = {
            "id": "test-otp-id",
            "phone_or_email": "+919876543210",
            "otp_code": "$2b$12$hashed_otp",
            "attempts": 0,
            "verified": False,
            "expires_at": (datetime.now() + timedelta(minutes=5)).isoformat()
        }
        
        mock_result = MagicMock()
        mock_result.data = [mock_otp_record]
        auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        # Mock password verification to fail
        auth_service.pwd_context.verify = MagicMock(return_value=False)
        
        # Mock update call
        auth_service.supabase.table.return_value.update.return_value.eq.return_value.execute = MagicMock()
        
        with pytest.raises(Exception) as exc_info:
            await auth_service.verify_otp("test-token", "wrong-otp")
        
        assert "Invalid OTP" in str(exc_info.value)
        assert "attempts remaining" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_verify_otp_max_attempts(self, auth_service):
        """Test OTP verification when max attempts exceeded"""
        # Mock Redis token lookup
        auth_service.redis.get.return_value = "test-otp-id"
        
        # Mock OTP record with max attempts
        mock_otp_record = {
            "id": "test-otp-id",
            "phone_or_email": "+919876543210",
            "otp_code": "$2b$12$hashed_otp",
            "attempts": 3,  # Max attempts reached
            "verified": False,
            "expires_at": (datetime.now() + timedelta(minutes=5)).isoformat()
        }
        
        mock_result = MagicMock()
        mock_result.data = [mock_otp_record]
        auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        with pytest.raises(Exception) as exc_info:
            await auth_service.verify_otp("test-token", "123456")
        
        assert "Maximum OTP attempts exceeded" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_get_or_create_vendor_existing(self, auth_service):
        """Test getting existing vendor"""
        # Mock existing vendor
        mock_vendor = {
            "id": "vendor-123",
            "name": "Existing Vendor",
            "phone_number": "+919876543210"
        }
        
        mock_result = MagicMock()
        mock_result.data = [mock_vendor]
        auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        # Mock update call
        auth_service.supabase.table.return_value.update.return_value.eq.return_value.execute = MagicMock()
        
        result = await auth_service._get_or_create_vendor("+919876543210")
        
        assert result == mock_vendor
    
    @pytest.mark.asyncio
    async def test_get_or_create_vendor_new(self, auth_service):
        """Test creating new vendor"""
        # Mock no existing vendor
        mock_empty_result = MagicMock()
        mock_empty_result.data = []
        
        # Mock successful creation
        mock_new_vendor = {
            "id": "vendor-456",
            "name": "",
            "phone_number": "+919876543210",
            "market_location": "",
            "preferred_language": "hi"
        }
        mock_create_result = MagicMock()
        mock_create_result.data = [mock_new_vendor]
        
        # Configure mock chain
        auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_empty_result
        auth_service.supabase.table.return_value.insert.return_value.execute.return_value = mock_create_result
        
        result = await auth_service._get_or_create_vendor("+919876543210")
        
        assert result == mock_new_vendor
        assert result["preferred_language"] == "hi"
    
    def test_jwt_token_generation(self, auth_service):
        """Test JWT token generation"""
        vendor_id = "vendor-123"
        
        access_token, refresh_token = auth_service._generate_jwt_tokens(vendor_id)
        
        # Tokens should be different
        assert access_token != refresh_token
        
        # Both should be non-empty strings
        assert isinstance(access_token, str)
        assert isinstance(refresh_token, str)
        assert len(access_token) > 0
        assert len(refresh_token) > 0
        
        # Decode and verify token structure (basic check)
        from jose import jwt
        from app.core.config import settings
        
        access_payload = jwt.decode(access_token, settings.JWT_SECRET, algorithms=["HS256"])
        refresh_payload = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=["HS256"])
        
        assert access_payload["sub"] == vendor_id
        assert access_payload["type"] == "access"
        assert refresh_payload["sub"] == vendor_id
        assert refresh_payload["type"] == "refresh"
    
    @pytest.mark.asyncio
    async def test_refresh_token_success(self, auth_service):
        """Test successful token refresh"""
        # Generate a valid refresh token
        vendor_id = "vendor-123"
        _, refresh_token = auth_service._generate_jwt_tokens(vendor_id)
        
        # Mock session lookup
        mock_session = {
            "id": "session-123",
            "vendor_id": vendor_id,
            "refresh_token": refresh_token,
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        mock_result = MagicMock()
        mock_result.data = [mock_session]
        auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        # Mock update call
        auth_service.supabase.table.return_value.update.return_value.eq.return_value.execute = MagicMock()
        auth_service.redis.setex = AsyncMock()
        
        result = await auth_service.refresh_token(refresh_token)
        
        assert "access_token" in result
        assert result["token_type"] == "bearer"
        assert result["expires_in"] == 3600
    
    @pytest.mark.asyncio
    async def test_refresh_token_invalid(self, auth_service):
        """Test token refresh with invalid token"""
        with pytest.raises(Exception) as exc_info:
            await auth_service.refresh_token("invalid-token")
        
        assert "Invalid refresh token" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_logout_success(self, auth_service):
        """Test successful logout"""
        access_token = "test-access-token"
        
        # Mock database delete
        auth_service.supabase.table.return_value.delete.return_value.eq.return_value.execute = MagicMock()
        auth_service.redis.delete = AsyncMock()
        
        result = await auth_service.logout(access_token)
        
        assert result["message"] == "Logged out successfully"
        
        # Verify Redis cache was cleared
        auth_service.redis.delete.assert_called_with(f"vendor_session:{access_token}")
    
    @pytest.mark.asyncio
    async def test_validate_session_valid(self, auth_service):
        """Test session validation with valid token"""
        # Generate valid access token
        vendor_id = "vendor-123"
        access_token, _ = auth_service._generate_jwt_tokens(vendor_id)
        
        # Mock session data
        mock_session = {
            "id": "session-123",
            "vendor_id": vendor_id,
            "session_token": access_token,
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat()
        }
        
        mock_result = MagicMock()
        mock_result.data = [mock_session]
        auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        # Mock update call
        auth_service.supabase.table.return_value.update.return_value.eq.return_value.execute = MagicMock()
        
        # Mock Redis cache miss
        auth_service.redis.get.return_value = None
        
        result = await auth_service.validate_session(access_token)
        
        assert result is not None
        assert result["vendor_id"] == vendor_id
    
    @pytest.mark.asyncio
    async def test_validate_session_invalid(self, auth_service):
        """Test session validation with invalid token"""
        result = await auth_service.validate_session("invalid-token")
        
        assert result is None
    
    @pytest.mark.asyncio
    async def test_validate_session_expired(self, auth_service):
        """Test session validation with expired session"""
        # Generate valid access token
        vendor_id = "vendor-123"
        access_token, _ = auth_service._generate_jwt_tokens(vendor_id)
        
        # Mock expired session
        mock_session = {
            "id": "session-123",
            "vendor_id": vendor_id,
            "session_token": access_token,
            "expires_at": (datetime.now() - timedelta(days=1)).isoformat()  # Expired
        }
        
        mock_result = MagicMock()
        mock_result.data = [mock_session]
        auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        # Mock delete call for cleanup
        auth_service.supabase.table.return_value.delete.return_value.eq.return_value.execute = MagicMock()
        auth_service.redis.get.return_value = None
        auth_service.redis.delete = AsyncMock()
        
        result = await auth_service.validate_session(access_token)
        
        assert result is None
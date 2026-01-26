"""
Integration tests for authentication endpoints
Tests the complete authentication flow including rate limiting and security
"""

import pytest
import asyncio
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timedelta
import json

from app.main import app
from app.services.auth_service import AuthService


class TestAuthEndpoints:
    """Integration tests for authentication endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def mock_auth_service(self):
        """Mock authentication service"""
        with patch('app.api.v1.endpoints.auth.AuthService') as mock_service_class:
            mock_service = MagicMock()
            mock_service_class.return_value = mock_service
            yield mock_service
    
    def test_login_valid_phone(self, client, mock_auth_service):
        """Test login with valid phone number"""
        # Mock successful OTP send
        mock_auth_service.send_otp.return_value = {
            "success": True,
            "message": "OTP sent to phone",
            "token": "test-token-123",
            "expires_in": 300
        }
        
        response = client.post("/api/v1/auth/login", json={
            "phone_or_email": "+919876543210"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert data["expires_in"] == 300
        
        # Verify service was called correctly
        mock_auth_service.send_otp.assert_called_once_with("+919876543210")
    
    def test_login_valid_email(self, client, mock_auth_service):
        """Test login with valid email"""
        # Mock successful OTP send
        mock_auth_service.send_otp.return_value = {
            "success": True,
            "message": "OTP sent to email",
            "token": "test-token-456",
            "expires_in": 300
        }
        
        response = client.post("/api/v1/auth/login", json={
            "phone_or_email": "vendor@example.com"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        
        mock_auth_service.send_otp.assert_called_once_with("vendor@example.com")
    
    def test_login_invalid_format(self, client, mock_auth_service):
        """Test login with invalid phone/email format"""
        # Mock service to raise validation error
        mock_auth_service.send_otp.side_effect = Exception("Invalid phone number or email format")
        
        response = client.post("/api/v1/auth/login", json={
            "phone_or_email": "invalid-format"
        })
        
        assert response.status_code == 400
        assert "Invalid phone number or email format" in response.json()["detail"]
    
    def test_login_rate_limited(self, client, mock_auth_service):
        """Test login when rate limited"""
        # Mock service to raise rate limit error
        mock_auth_service.send_otp.side_effect = Exception("Rate limit exceeded. Try again in 15 minutes")
        
        response = client.post("/api/v1/auth/login", json={
            "phone_or_email": "+919876543210"
        })
        
        assert response.status_code == 400
        assert "Rate limit exceeded" in response.json()["detail"]
    
    def test_login_missing_field(self, client):
        """Test login with missing phone_or_email field"""
        response = client.post("/api/v1/auth/login", json={})
        
        assert response.status_code == 422  # Validation error
    
    def test_verify_otp_success(self, client, mock_auth_service):
        """Test successful OTP verification"""
        from app.schemas.auth import AuthResponse
        
        # Mock successful verification
        mock_auth_service.verify_otp.return_value = AuthResponse(
            access_token="access_token_123",
            refresh_token="refresh_token_456",
            vendor_id="vendor-789"
        )
        
        response = client.post("/api/v1/auth/verify-otp", json={
            "token": "test-token-123",
            "otp": "123456"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"] == "access_token_123"
        assert data["refresh_token"] == "refresh_token_456"
        assert data["vendor_id"] == "vendor-789"
        
        mock_auth_service.verify_otp.assert_called_once_with("test-token-123", "123456")
    
    def test_verify_otp_invalid_token(self, client, mock_auth_service):
        """Test OTP verification with invalid token"""
        # Mock service to raise invalid token error
        mock_auth_service.verify_otp.side_effect = Exception("Invalid or expired verification token")
        
        response = client.post("/api/v1/auth/verify-otp", json={
            "token": "invalid-token",
            "otp": "123456"
        })
        
        assert response.status_code == 400
        assert "Invalid or expired verification token" in response.json()["detail"]
    
    def test_verify_otp_wrong_code(self, client, mock_auth_service):
        """Test OTP verification with wrong code"""
        # Mock service to raise wrong OTP error
        mock_auth_service.verify_otp.side_effect = Exception("Invalid OTP. 2 attempts remaining")
        
        response = client.post("/api/v1/auth/verify-otp", json={
            "token": "test-token-123",
            "otp": "wrong-otp"
        })
        
        assert response.status_code == 400
        assert "Invalid OTP" in response.json()["detail"]
        assert "attempts remaining" in response.json()["detail"]
    
    def test_verify_otp_expired(self, client, mock_auth_service):
        """Test OTP verification with expired OTP"""
        # Mock service to raise expired OTP error
        mock_auth_service.verify_otp.side_effect = Exception("OTP has expired")
        
        response = client.post("/api/v1/auth/verify-otp", json={
            "token": "test-token-123",
            "otp": "123456"
        })
        
        assert response.status_code == 400
        assert "OTP has expired" in response.json()["detail"]
    
    def test_verify_otp_missing_fields(self, client):
        """Test OTP verification with missing fields"""
        # Missing token
        response = client.post("/api/v1/auth/verify-otp", json={
            "otp": "123456"
        })
        assert response.status_code == 422
        
        # Missing OTP
        response = client.post("/api/v1/auth/verify-otp", json={
            "token": "test-token"
        })
        assert response.status_code == 422
    
    def test_refresh_token_success(self, client, mock_auth_service):
        """Test successful token refresh"""
        # Mock successful refresh
        mock_auth_service.refresh_token.return_value = {
            "access_token": "new_access_token_123",
            "token_type": "bearer",
            "expires_in": 3600
        }
        
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "valid_refresh_token"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["access_token"] == "new_access_token_123"
        assert data["token_type"] == "bearer"
        assert data["expires_in"] == 3600
        
        mock_auth_service.refresh_token.assert_called_once_with("valid_refresh_token")
    
    def test_refresh_token_invalid(self, client, mock_auth_service):
        """Test token refresh with invalid token"""
        # Mock service to raise invalid token error
        mock_auth_service.refresh_token.side_effect = Exception("Invalid refresh token")
        
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid_refresh_token"
        })
        
        assert response.status_code == 401
        assert "Invalid refresh token" in response.json()["detail"]
    
    def test_refresh_token_expired(self, client, mock_auth_service):
        """Test token refresh with expired token"""
        # Mock service to raise expired session error
        mock_auth_service.refresh_token.side_effect = Exception("Session expired")
        
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "expired_refresh_token"
        })
        
        assert response.status_code == 401
        assert "Session expired" in response.json()["detail"]
    
    def test_logout_success(self, client, mock_auth_service):
        """Test successful logout"""
        # Mock successful logout
        mock_auth_service.logout.return_value = {"message": "Logged out successfully"}
        
        # Mock session validation
        mock_auth_service.validate_session.return_value = {
            "vendor_id": "vendor-123",
            "expires_at": (datetime.now() + timedelta(hours=1)).isoformat()
        }
        
        response = client.post("/api/v1/auth/logout", headers={
            "Authorization": "Bearer valid_access_token"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Logged out successfully"
        
        mock_auth_service.logout.assert_called_once_with("valid_access_token")
    
    def test_logout_no_token(self, client):
        """Test logout without authentication token"""
        response = client.post("/api/v1/auth/logout")
        
        assert response.status_code == 403  # Forbidden due to missing token
    
    def test_logout_invalid_token(self, client, mock_auth_service):
        """Test logout with invalid token"""
        # Mock session validation to return None (invalid session)
        mock_auth_service.validate_session.return_value = None
        
        response = client.post("/api/v1/auth/logout", headers={
            "Authorization": "Bearer invalid_access_token"
        })
        
        assert response.status_code == 401
        assert "Invalid or expired token" in response.json()["detail"]
    
    def test_get_current_user_success(self, client, mock_auth_service):
        """Test getting current user information"""
        # Mock session validation
        mock_auth_service.validate_session.return_value = {
            "vendor_id": "vendor-123",
            "expires_at": (datetime.now() + timedelta(hours=1)).isoformat()
        }
        
        # Mock vendor data retrieval
        mock_vendor_data = {
            "id": "vendor-123",
            "name": "Test Vendor",
            "phone_number": "+919876543210",
            "market_location": "Test Market",
            "preferred_language": "hi",
            "points": 100,
            "status": "active"
        }
        
        mock_result = MagicMock()
        mock_result.data = [mock_vendor_data]
        mock_auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        response = client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer valid_access_token"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["vendor"]["id"] == "vendor-123"
        assert data["vendor"]["name"] == "Test Vendor"
        assert "session" in data
    
    def test_get_current_user_invalid_token(self, client, mock_auth_service):
        """Test getting current user with invalid token"""
        # Mock session validation to return None
        mock_auth_service.validate_session.return_value = None
        
        response = client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer invalid_token"
        })
        
        assert response.status_code == 401
        assert "Invalid or expired token" in response.json()["detail"]
    
    def test_get_current_user_vendor_not_found(self, client, mock_auth_service):
        """Test getting current user when vendor not found in database"""
        # Mock session validation
        mock_auth_service.validate_session.return_value = {
            "vendor_id": "nonexistent-vendor",
            "expires_at": (datetime.now() + timedelta(hours=1)).isoformat()
        }
        
        # Mock empty vendor data
        mock_result = MagicMock()
        mock_result.data = []
        mock_auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        response = client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer valid_access_token"
        })
        
        assert response.status_code == 404
        assert "Vendor not found" in response.json()["detail"]
    
    def test_validate_token_success(self, client, mock_auth_service):
        """Test token validation endpoint"""
        # Mock session validation
        mock_auth_service.validate_session.return_value = {
            "vendor_id": "vendor-123",
            "expires_at": (datetime.now() + timedelta(hours=1)).isoformat()
        }
        
        response = client.post("/api/v1/auth/validate", headers={
            "Authorization": "Bearer valid_access_token"
        })
        
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["vendor_id"] == "vendor-123"
        assert "expires_at" in data
    
    def test_validate_token_invalid(self, client, mock_auth_service):
        """Test token validation with invalid token"""
        # Mock session validation to return None
        mock_auth_service.validate_session.return_value = None
        
        response = client.post("/api/v1/auth/validate", headers={
            "Authorization": "Bearer invalid_token"
        })
        
        assert response.status_code == 401
        assert "Invalid or expired token" in response.json()["detail"]
    
    def test_authentication_flow_complete(self, client, mock_auth_service):
        """Test complete authentication flow"""
        # Step 1: Send OTP
        mock_auth_service.send_otp.return_value = {
            "success": True,
            "message": "OTP sent to phone",
            "token": "test-token-123",
            "expires_in": 300
        }
        
        login_response = client.post("/api/v1/auth/login", json={
            "phone_or_email": "+919876543210"
        })
        assert login_response.status_code == 200
        token = login_response.json()["token"]
        
        # Step 2: Verify OTP
        from app.schemas.auth import AuthResponse
        mock_auth_service.verify_otp.return_value = AuthResponse(
            access_token="access_token_123",
            refresh_token="refresh_token_456",
            vendor_id="vendor-789"
        )
        
        verify_response = client.post("/api/v1/auth/verify-otp", json={
            "token": token,
            "otp": "123456"
        })
        assert verify_response.status_code == 200
        auth_data = verify_response.json()
        access_token = auth_data["access_token"]
        refresh_token = auth_data["refresh_token"]
        
        # Step 3: Use access token to get user info
        mock_auth_service.validate_session.return_value = {
            "vendor_id": "vendor-789",
            "expires_at": (datetime.now() + timedelta(hours=1)).isoformat()
        }
        
        mock_vendor_data = {
            "id": "vendor-789",
            "name": "Test Vendor",
            "phone_number": "+919876543210"
        }
        mock_result = MagicMock()
        mock_result.data = [mock_vendor_data]
        mock_auth_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        me_response = client.get("/api/v1/auth/me", headers={
            "Authorization": f"Bearer {access_token}"
        })
        assert me_response.status_code == 200
        
        # Step 4: Refresh token
        mock_auth_service.refresh_token.return_value = {
            "access_token": "new_access_token",
            "token_type": "bearer",
            "expires_in": 3600
        }
        
        refresh_response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })
        assert refresh_response.status_code == 200
        
        # Step 5: Logout
        mock_auth_service.logout.return_value = {"message": "Logged out successfully"}
        
        logout_response = client.post("/api/v1/auth/logout", headers={
            "Authorization": f"Bearer {access_token}"
        })
        assert logout_response.status_code == 200
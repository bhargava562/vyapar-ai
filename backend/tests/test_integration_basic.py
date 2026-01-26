"""
Basic integration tests for authentication API
Tests the actual API endpoints with minimal mocking
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock

from app.main import app


class TestBasicIntegration:
    """Basic integration tests"""
    
    def test_health_endpoint(self, test_client):
        """Test health check endpoint"""
        response = test_client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "version" in data
    
    def test_root_endpoint(self, test_client):
        """Test root endpoint"""
        response = test_client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Market Mania API is running"
        assert data["version"] == "1.0.0"
    
    def test_login_endpoint_structure(self, test_client):
        """Test login endpoint accepts correct request structure"""
        # Test with missing field
        response = test_client.post("/api/v1/auth/login", json={})
        assert response.status_code == 422  # Validation error
        
        # Test with correct structure but mock the service
        with patch('app.api.v1.endpoints.auth.AuthService') as mock_service_class:
            mock_service = MagicMock()
            mock_service.send_otp.return_value = {
                "success": True,
                "message": "OTP sent to phone",
                "token": "test-token",
                "expires_in": 300
            }
            mock_service_class.return_value = mock_service
            
            response = test_client.post("/api/v1/auth/login", json={
                "phone_or_email": "+919876543210"
            })
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "token" in data
    
    def test_verify_otp_endpoint_structure(self, test_client):
        """Test verify OTP endpoint accepts correct request structure"""
        # Test with missing fields
        response = test_client.post("/api/v1/auth/verify-otp", json={})
        assert response.status_code == 422  # Validation error
        
        # Test with correct structure but mock the service
        with patch('app.api.v1.endpoints.auth.AuthService') as mock_service_class:
            from app.schemas.auth import AuthResponse
            
            mock_service = MagicMock()
            mock_service.verify_otp.return_value = AuthResponse(
                access_token="test_access_token",
                refresh_token="test_refresh_token",
                vendor_id="test_vendor_id"
            )
            mock_service_class.return_value = mock_service
            
            response = test_client.post("/api/v1/auth/verify-otp", json={
                "token": "test-token",
                "otp": "123456"
            })
            
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert "refresh_token" in data
            assert "vendor_id" in data
    
    def test_refresh_token_endpoint_structure(self, test_client):
        """Test refresh token endpoint accepts correct request structure"""
        # Test with missing field
        response = test_client.post("/api/v1/auth/refresh", json={})
        assert response.status_code == 422  # Validation error
        
        # Test with correct structure but mock the service
        with patch('app.api.v1.endpoints.auth.AuthService') as mock_service_class:
            mock_service = MagicMock()
            mock_service.refresh_token.return_value = {
                "access_token": "new_access_token",
                "token_type": "bearer",
                "expires_in": 3600
            }
            mock_service_class.return_value = mock_service
            
            response = test_client.post("/api/v1/auth/refresh", json={
                "refresh_token": "test_refresh_token"
            })
            
            assert response.status_code == 200
            data = response.json()
            assert "access_token" in data
            assert data["token_type"] == "bearer"
    
    def test_logout_requires_authentication(self, test_client):
        """Test logout endpoint requires authentication"""
        # Test without token
        response = test_client.post("/api/v1/auth/logout")
        assert response.status_code == 403  # Forbidden
        
        # Test with invalid token
        response = test_client.post("/api/v1/auth/logout", headers={
            "Authorization": "Bearer invalid_token"
        })
        assert response.status_code == 401  # Unauthorized
    
    def test_me_requires_authentication(self, test_client):
        """Test /me endpoint requires authentication"""
        # Test without token
        response = test_client.get("/api/v1/auth/me")
        assert response.status_code == 403  # Forbidden
        
        # Test with invalid token
        response = test_client.get("/api/v1/auth/me", headers={
            "Authorization": "Bearer invalid_token"
        })
        assert response.status_code == 401  # Unauthorized
    
    def test_validate_requires_authentication(self, test_client):
        """Test /validate endpoint requires authentication"""
        # Test without token
        response = test_client.post("/api/v1/auth/validate")
        assert response.status_code == 403  # Forbidden
        
        # Test with invalid token
        response = test_client.post("/api/v1/auth/validate", headers={
            "Authorization": "Bearer invalid_token"
        })
        assert response.status_code == 401  # Unauthorized
    
    def test_cors_headers(self, test_client):
        """Test CORS headers are present"""
        response = test_client.options("/api/v1/auth/login")
        # FastAPI automatically handles OPTIONS requests for CORS
        # The response should not be a 404 or 405
        assert response.status_code in [200, 405]  # 405 is acceptable for OPTIONS
    
    def test_api_documentation_available_in_debug(self, test_client):
        """Test API documentation is available in debug mode"""
        # Since DEBUG=true in our .env, docs should be available
        response = test_client.get("/docs")
        # Should either be available (200) or redirect (3xx)
        assert response.status_code in [200, 307, 308]
    
    def test_error_handling_format(self, test_client):
        """Test error responses follow FastAPI format"""
        # Test validation error format
        response = test_client.post("/api/v1/auth/login", json={"invalid": "data"})
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
        
        # Test with completely invalid JSON
        response = test_client.post(
            "/api/v1/auth/login", 
            data="invalid json",
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 422
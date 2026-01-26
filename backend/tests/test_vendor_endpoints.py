"""
Unit tests for vendor API endpoints
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from fastapi.testclient import TestClient
from datetime import datetime
from uuid import uuid4

from app.main import app
from app.schemas.vendor import VendorProfile, VendorProfileUpdate


class TestVendorEndpoints:
    """Test cases for vendor API endpoints"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def mock_auth_token(self):
        """Mock authentication token"""
        return "Bearer test-token"
    
    @pytest.fixture
    def sample_vendor_data(self):
        """Sample vendor data for testing"""
        return {
            "id": str(uuid4()),
            "name": "Test Vendor",
            "stall_id": "A123",
            "market_location": "Test Market, Delhi",
            "phone_number": "+919876543210",
            "email": "test@example.com",
            "preferred_language": "hi",
            "points": 100,
            "status": "active",
            "created_at": datetime.now().isoformat(),
            "last_active": datetime.now().isoformat()
        }
    
    @pytest.fixture
    def mock_vendor_service(self):
        """Mock VendorService"""
        with patch('app.api.v1.endpoints.vendor.VendorService') as mock:
            yield mock.return_value
    
    @pytest.fixture
    def mock_auth_service(self):
        """Mock AuthService for authentication"""
        with patch('app.api.v1.endpoints.vendor.AuthService') as mock:
            mock_instance = mock.return_value
            mock_instance.validate_session = AsyncMock(return_value={"vendor_id": "test-vendor-id"})
            yield mock_instance
    
    def test_get_profile_success(self, client, mock_auth_token, mock_vendor_service, mock_auth_service, sample_vendor_data):
        """Test successful profile retrieval"""
        # Mock service response
        mock_vendor_service.get_vendor_profile = AsyncMock(return_value=VendorProfile(**sample_vendor_data))
        mock_vendor_service.update_vendor_activity = AsyncMock(return_value=True)
        
        # Test
        response = client.get(
            "/api/v1/vendor/profile",
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_vendor_data["id"]
        assert data["name"] == sample_vendor_data["name"]
        assert data["market_location"] == sample_vendor_data["market_location"]
    
    def test_get_profile_not_found(self, client, mock_auth_token, mock_vendor_service, mock_auth_service):
        """Test profile retrieval when profile not found"""
        # Mock service response
        mock_vendor_service.get_vendor_profile = AsyncMock(return_value=None)
        
        # Test
        response = client.get(
            "/api/v1/vendor/profile",
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 404
        assert "Vendor profile not found" in response.json()["detail"]
    
    def test_get_profile_unauthorized(self, client, mock_auth_service):
        """Test profile retrieval without authentication"""
        # Mock auth service to return None (invalid session)
        mock_auth_service.validate_session = AsyncMock(return_value=None)
        
        # Test
        response = client.get("/api/v1/vendor/profile")
        
        # Assertions
        assert response.status_code == 401
    
    def test_update_profile_success(self, client, mock_auth_token, mock_vendor_service, mock_auth_service, sample_vendor_data):
        """Test successful profile update"""
        # Mock service response
        updated_data = sample_vendor_data.copy()
        updated_data["name"] = "Updated Name"
        mock_vendor_service.update_vendor_profile = AsyncMock(return_value=VendorProfile(**updated_data))
        
        # Test data
        update_data = {
            "name": "Updated Name",
            "email": "updated@example.com"
        }
        
        # Test
        response = client.put(
            "/api/v1/vendor/profile",
            headers={"Authorization": mock_auth_token},
            json=update_data
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
    
    def test_update_profile_validation_error(self, client, mock_auth_token, mock_vendor_service, mock_auth_service):
        """Test profile update with validation error"""
        # Mock service to raise ValueError
        mock_vendor_service.update_vendor_profile = AsyncMock(side_effect=ValueError("Invalid data"))
        
        # Test data
        update_data = {
            "name": "A"  # Too short
        }
        
        # Test
        response = client.put(
            "/api/v1/vendor/profile",
            headers={"Authorization": mock_auth_token},
            json=update_data
        )
        
        # Assertions
        assert response.status_code == 400
        assert "Invalid data" in response.json()["detail"]
    
    def test_create_profile_success(self, client, mock_auth_token, mock_vendor_service, mock_auth_service, sample_vendor_data):
        """Test successful profile creation"""
        # Mock get_vendor_profile to return profile without name (incomplete)
        incomplete_profile = VendorProfile(**{**sample_vendor_data, "name": ""})
        mock_vendor_service.get_vendor_profile = AsyncMock(return_value=incomplete_profile)
        mock_vendor_service.update_vendor_profile = AsyncMock(return_value=VendorProfile(**sample_vendor_data))
        
        # Test data
        create_data = {
            "name": "Test Vendor",
            "market_location": "Test Market, Delhi",
            "phone_number": "+919876543210",
            "preferred_language": "hi"
        }
        
        # Test
        response = client.post(
            "/api/v1/vendor/profile",
            headers={"Authorization": mock_auth_token},
            json=create_data
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Test Vendor"
    
    def test_create_profile_already_exists(self, client, mock_auth_token, mock_vendor_service, mock_auth_service, sample_vendor_data):
        """Test profile creation when profile already exists"""
        # Mock get_vendor_profile to return complete profile
        mock_vendor_service.get_vendor_profile = AsyncMock(return_value=VendorProfile(**sample_vendor_data))
        
        # Test data
        create_data = {
            "name": "Test Vendor",
            "market_location": "Test Market, Delhi",
            "phone_number": "+919876543210",
            "preferred_language": "hi"
        }
        
        # Test
        response = client.post(
            "/api/v1/vendor/profile",
            headers={"Authorization": mock_auth_token},
            json=create_data
        )
        
        # Assertions
        assert response.status_code == 409
        assert "Profile already exists" in response.json()["detail"]
    
    def test_delete_profile_success(self, client, mock_auth_token, mock_vendor_service, mock_auth_service):
        """Test successful profile deletion"""
        # Mock service response
        mock_vendor_service.delete_vendor_profile = AsyncMock(return_value=True)
        
        # Test
        response = client.delete(
            "/api/v1/vendor/profile",
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 200
        assert "Profile deleted successfully" in response.json()["message"]
    
    def test_delete_profile_not_found(self, client, mock_auth_token, mock_vendor_service, mock_auth_service):
        """Test profile deletion when profile not found"""
        # Mock service response
        mock_vendor_service.delete_vendor_profile = AsyncMock(return_value=False)
        
        # Test
        response = client.delete(
            "/api/v1/vendor/profile",
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 404
        assert "Vendor profile not found" in response.json()["detail"]
    
    def test_get_profile_completion(self, client, mock_auth_token, mock_vendor_service, mock_auth_service):
        """Test profile completion status retrieval"""
        # Mock service response
        completion_data = {
            "is_complete": True,
            "completion_percentage": 100,
            "missing_fields": [],
            "completed_optional": ["email", "stall_id"],
            "next_step": "profile_complete"
        }
        mock_vendor_service.check_profile_completion = AsyncMock(return_value=completion_data)
        
        # Test
        response = client.get(
            "/api/v1/vendor/profile/completion",
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["is_complete"] is True
        assert data["completion_percentage"] == 100
    
    def test_get_vendor_statistics(self, client, mock_auth_token, mock_vendor_service, mock_auth_service):
        """Test vendor statistics retrieval"""
        # Mock service response
        stats_data = {
            "vendor_id": "test-vendor-id",
            "points": 100,
            "submissions_count": 5,
            "fpc_count": 3,
            "achievements_count": 2,
            "member_since": datetime.now().isoformat(),
            "last_active": datetime.now().isoformat(),
            "status": "active"
        }
        mock_vendor_service.get_vendor_statistics = AsyncMock(return_value=stats_data)
        
        # Test
        response = client.get(
            "/api/v1/vendor/statistics",
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert data["points"] == 100
        assert data["submissions_count"] == 5
    
    def test_search_vendors(self, client, mock_auth_token, mock_vendor_service, mock_auth_service, sample_vendor_data):
        """Test vendor search"""
        # Mock service response
        search_results = [VendorProfile(**sample_vendor_data)]
        mock_vendor_service.search_vendors = AsyncMock(return_value=search_results)
        
        # Test
        response = client.get(
            "/api/v1/vendor/search?q=Test&limit=10",
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert len(data["vendors"]) == 1
        assert data["total_count"] == 1
        assert data["query"] == "Test"
    
    def test_search_vendors_invalid_query(self, client, mock_auth_token, mock_auth_service):
        """Test vendor search with invalid query (too short)"""
        # Test
        response = client.get(
            "/api/v1/vendor/search?q=A",  # Too short
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 422  # Validation error
    
    def test_get_vendors_by_market(self, client, mock_auth_token, mock_vendor_service, mock_auth_service, sample_vendor_data):
        """Test getting vendors by market location"""
        # Mock service response
        market_vendors = [VendorProfile(**sample_vendor_data)]
        mock_vendor_service.get_vendors_by_market = AsyncMock(return_value=market_vendors)
        
        # Test
        response = client.get(
            "/api/v1/vendor/market/Test%20Market,%20Delhi",
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["market_location"] == "Test Market, Delhi"
    
    def test_get_dashboard(self, client, mock_auth_token, mock_vendor_service, mock_auth_service, sample_vendor_data):
        """Test dashboard data retrieval"""
        # Mock service responses
        mock_vendor_service.get_vendor_profile = AsyncMock(return_value=VendorProfile(**sample_vendor_data))
        mock_vendor_service.get_vendor_statistics = AsyncMock(return_value={
            "vendor_id": "test-vendor-id",
            "points": 100,
            "submissions_count": 5,
            "fpc_count": 3,
            "achievements_count": 2,
            "member_since": datetime.now().isoformat(),
            "last_active": datetime.now().isoformat(),
            "status": "active"
        })
        mock_vendor_service.check_profile_completion = AsyncMock(return_value={
            "is_complete": True,
            "completion_percentage": 100,
            "missing_fields": [],
            "completed_optional": ["email", "stall_id"],
            "next_step": "profile_complete"
        })
        mock_vendor_service.update_vendor_activity = AsyncMock(return_value=True)
        
        # Test
        response = client.get(
            "/api/v1/vendor/dashboard",
            headers={"Authorization": mock_auth_token}
        )
        
        # Assertions
        assert response.status_code == 200
        data = response.json()
        assert "profile" in data
        assert "statistics" in data
        assert "completion" in data
        assert "dashboard_data" in data
        assert data["profile"]["name"] == "Test Vendor"
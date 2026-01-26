"""
Unit tests for vendor service
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime
from uuid import uuid4

from app.services.vendor_service import VendorService
from app.schemas.vendor import VendorProfileCreate, VendorProfileUpdate


class TestVendorService:
    """Test cases for VendorService"""
    
    @pytest.fixture
    def vendor_service(self):
        """Create VendorService instance with mocked dependencies"""
        with patch('app.services.vendor_service.get_supabase') as mock_supabase, \
             patch('app.services.vendor_service.get_redis') as mock_redis:
            
            service = VendorService()
            service.supabase = Mock()
            service.redis = AsyncMock()
            return service
    
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
    
    @pytest.mark.asyncio
    async def test_get_vendor_profile_success(self, vendor_service, sample_vendor_data):
        """Test successful vendor profile retrieval"""
        # Mock Supabase response
        mock_result = Mock()
        mock_result.data = [sample_vendor_data]
        vendor_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        # Test
        result = await vendor_service.get_vendor_profile(sample_vendor_data["id"])
        
        # Assertions
        assert result is not None
        assert result.id == sample_vendor_data["id"]
        assert result.name == sample_vendor_data["name"]
        assert result.market_location == sample_vendor_data["market_location"]
        
        # Verify Redis caching
        vendor_service.redis.setex.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_get_vendor_profile_not_found(self, vendor_service):
        """Test vendor profile not found"""
        # Mock Supabase response
        mock_result = Mock()
        mock_result.data = []
        vendor_service.supabase.table.return_value.select.return_value.eq.return_value.execute.return_value = mock_result
        
        # Test
        result = await vendor_service.get_vendor_profile("nonexistent-id")
        
        # Assertions
        assert result is None
    
    @pytest.mark.asyncio
    async def test_create_vendor_profile_success(self, vendor_service, sample_vendor_data):
        """Test successful vendor profile creation"""
        # Mock Supabase response
        mock_result = Mock()
        mock_result.data = [sample_vendor_data]
        vendor_service.supabase.table.return_value.insert.return_value.execute.return_value = mock_result
        
        # Create profile data
        profile_data = VendorProfileCreate(
            name="Test Vendor",
            stall_id="A123",
            market_location="Test Market, Delhi",
            phone_number="+919876543210",
            email="test@example.com",
            preferred_language="hi"
        )
        
        # Test
        result = await vendor_service.create_vendor_profile(profile_data)
        
        # Assertions
        assert result is not None
        assert result.name == profile_data.name
        assert result.market_location == profile_data.market_location
        
        # Verify Redis caching
        vendor_service.redis.setex.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_vendor_profile_invalid_language(self, vendor_service):
        """Test vendor profile creation with invalid language"""
        # Test that Pydantic validation catches invalid language
        with pytest.raises(ValueError) as exc_info:
            VendorProfileCreate(
                name="Test Vendor",
                market_location="Test Market, Delhi",
                phone_number="+919876543210",
                preferred_language="invalid_lang"
            )
        
        assert "Unsupported language" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_update_vendor_profile_success(self, vendor_service, sample_vendor_data):
        """Test successful vendor profile update"""
        # Mock get_vendor_profile
        with patch.object(vendor_service, 'get_vendor_profile') as mock_get:
            from app.schemas.vendor import VendorProfile
            mock_get.return_value = VendorProfile(**sample_vendor_data)
            
            # Mock Supabase update response
            updated_data = sample_vendor_data.copy()
            updated_data["name"] = "Updated Vendor Name"
            mock_result = Mock()
            mock_result.data = [updated_data]
            vendor_service.supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_result
            
            # Create update data
            update_data = VendorProfileUpdate(name="Updated Vendor Name")
            
            # Test
            result = await vendor_service.update_vendor_profile(sample_vendor_data["id"], update_data)
            
            # Assertions
            assert result is not None
            assert result.name == "Updated Vendor Name"
            
            # Verify Redis cache update
            vendor_service.redis.setex.assert_called()
    
    @pytest.mark.asyncio
    async def test_update_vendor_profile_not_found(self, vendor_service):
        """Test vendor profile update when profile not found"""
        # Mock get_vendor_profile to return None
        with patch.object(vendor_service, 'get_vendor_profile') as mock_get:
            mock_get.return_value = None
            
            # Create update data
            update_data = VendorProfileUpdate(name="Updated Name")
            
            # Test
            with pytest.raises(Exception) as exc_info:
                await vendor_service.update_vendor_profile("nonexistent-id", update_data)
            
            assert "Vendor profile not found" in str(exc_info.value)
    
    @pytest.mark.asyncio
    async def test_delete_vendor_profile_success(self, vendor_service, sample_vendor_data):
        """Test successful vendor profile deletion (soft delete)"""
        # Mock get_vendor_profile
        with patch.object(vendor_service, 'get_vendor_profile') as mock_get:
            from app.schemas.vendor import VendorProfile
            mock_get.return_value = VendorProfile(**sample_vendor_data)
            
            # Mock Supabase update response
            mock_result = Mock()
            mock_result.data = [{"status": "inactive"}]
            vendor_service.supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_result
            
            # Test
            result = await vendor_service.delete_vendor_profile(sample_vendor_data["id"])
            
            # Assertions
            assert result is True
            
            # Verify Redis cache deletion
            vendor_service.redis.delete.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_check_profile_completion_complete(self, vendor_service, sample_vendor_data):
        """Test profile completion check for complete profile"""
        # Mock get_vendor_profile
        with patch.object(vendor_service, 'get_vendor_profile') as mock_get:
            from app.schemas.vendor import VendorProfile
            mock_get.return_value = VendorProfile(**sample_vendor_data)
            
            # Test
            result = await vendor_service.check_profile_completion(sample_vendor_data["id"])
            
            # Assertions
            assert result["is_complete"] is True
            assert result["completion_percentage"] == 100
            assert len(result["missing_fields"]) == 0
    
    @pytest.mark.asyncio
    async def test_check_profile_completion_incomplete(self, vendor_service, sample_vendor_data):
        """Test profile completion check for incomplete profile"""
        # Create incomplete profile data
        incomplete_data = sample_vendor_data.copy()
        incomplete_data["name"] = ""  # Missing required field
        
        # Mock get_vendor_profile
        with patch.object(vendor_service, 'get_vendor_profile') as mock_get:
            from app.schemas.vendor import VendorProfile
            mock_get.return_value = VendorProfile(**incomplete_data)
            
            # Test
            result = await vendor_service.check_profile_completion(sample_vendor_data["id"])
            
            # Assertions
            assert result["is_complete"] is False
            assert result["completion_percentage"] < 100
            assert "name" in result["missing_fields"]
    
    @pytest.mark.asyncio
    async def test_get_vendors_by_market(self, vendor_service, sample_vendor_data):
        """Test getting vendors by market location"""
        # Mock Supabase response
        mock_result = Mock()
        mock_result.data = [sample_vendor_data]
        vendor_service.supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.limit.return_value.execute.return_value = mock_result
        
        # Test
        result = await vendor_service.get_vendors_by_market("Test Market, Delhi")
        
        # Assertions
        assert len(result) == 1
        assert result[0].market_location == "Test Market, Delhi"
    
    @pytest.mark.asyncio
    async def test_search_vendors(self, vendor_service, sample_vendor_data):
        """Test vendor search functionality"""
        # Mock Supabase response
        mock_result = Mock()
        mock_result.data = [sample_vendor_data]
        vendor_service.supabase.table.return_value.select.return_value.or_.return_value.eq.return_value.limit.return_value.execute.return_value = mock_result
        
        # Test
        result = await vendor_service.search_vendors("Test")
        
        # Assertions
        assert len(result) == 1
        assert result[0].name == "Test Vendor"
    
    @pytest.mark.asyncio
    async def test_update_vendor_activity(self, vendor_service, sample_vendor_data):
        """Test updating vendor activity timestamp"""
        # Mock Supabase response
        mock_result = Mock()
        mock_result.data = [{"last_active": datetime.now().isoformat()}]
        vendor_service.supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = mock_result
        
        # Test
        result = await vendor_service.update_vendor_activity(sample_vendor_data["id"])
        
        # Assertions
        assert result is True
    
    @pytest.mark.asyncio
    async def test_get_vendor_statistics(self, vendor_service, sample_vendor_data):
        """Test getting vendor statistics"""
        # Mock get_vendor_profile
        with patch.object(vendor_service, 'get_vendor_profile') as mock_get:
            from app.schemas.vendor import VendorProfile
            mock_get.return_value = VendorProfile(**sample_vendor_data)
            
            # Mock Supabase count responses
            mock_submissions = Mock()
            mock_submissions.count = 5
            mock_fpc = Mock()
            mock_fpc.count = 3
            mock_achievements = Mock()
            mock_achievements.count = 2
            
            vendor_service.supabase.table.return_value.select.return_value.eq.return_value.execute.side_effect = [
                mock_submissions, mock_fpc, mock_achievements
            ]
            
            # Test
            result = await vendor_service.get_vendor_statistics(sample_vendor_data["id"])
            
            # Assertions
            assert result["vendor_id"] == sample_vendor_data["id"]
            assert result["points"] == sample_vendor_data["points"]
            assert result["submissions_count"] == 5
            assert result["fpc_count"] == 3
            assert result["achievements_count"] == 2
    
    @pytest.mark.asyncio
    async def test_validate_profile_data_valid(self, vendor_service):
        """Test profile data validation with valid data"""
        profile_data = {
            "name": "Valid Name",
            "market_location": "Valid Location",
            "email": "valid@example.com",
            "preferred_language": "hi"
        }
        
        # Test
        errors = await vendor_service.validate_profile_data(profile_data)
        
        # Assertions
        assert len(errors) == 0
    
    @pytest.mark.asyncio
    async def test_validate_profile_data_invalid(self, vendor_service):
        """Test profile data validation with invalid data"""
        profile_data = {
            "name": "A",  # Too short
            "market_location": "",  # Empty
            "email": "invalid-email",  # Invalid format
            "preferred_language": "invalid_lang"  # Unsupported language
        }
        
        # Test
        errors = await vendor_service.validate_profile_data(profile_data)
        
        # Assertions
        assert len(errors) > 0
        assert "name" in errors
        assert "market_location" in errors
        assert "email" in errors
        assert "preferred_language" in errors
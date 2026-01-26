"""
Simple test to debug the API issues
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock

def test_simple_health_check():
    """Simple test to see what's happening"""
    
    # Mock all the dependencies
    with patch('app.core.database.init_db') as mock_init_db, \
         patch('app.core.redis_client.init_redis') as mock_init_redis, \
         patch('app.core.database.get_supabase') as mock_get_supabase, \
         patch('app.core.redis_client.get_redis') as mock_get_redis, \
         patch('app.core.database.DatabaseManager') as mock_db_manager, \
         patch('app.core.redis_client.CacheManager') as mock_cache_manager:
        
        # Mock async functions
        async def mock_async():
            return None
        
        mock_init_db.return_value = mock_async()
        mock_init_redis.return_value = mock_async()
        
        # Mock clients
        mock_supabase_client = MagicMock()
        mock_get_supabase.return_value = mock_supabase_client
        
        mock_redis_client = AsyncMock()
        mock_get_redis.return_value = mock_redis_client
        
        # Mock health check methods
        mock_db_instance = MagicMock()
        mock_db_instance.health_check.return_value = mock_async()
        mock_db_manager.return_value = mock_db_instance
        
        mock_cache_instance = MagicMock()
        mock_cache_instance.health_check.return_value = mock_async()
        mock_cache_manager.return_value = mock_cache_instance
        
        # Now import and test
        from app.main import app
        client = TestClient(app)
        
        # Test root endpoint
        response = client.get("/")
        print(f"Root response: {response.status_code}")
        if response.status_code != 200:
            print(f"Root error: {response.text}")
        
        # Test health endpoint
        response = client.get("/health")
        print(f"Health response: {response.status_code}")
        if response.status_code != 200:
            print(f"Health error: {response.text}")
        
        assert True  # Just to see the output
"""
Test configuration and fixtures
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

# Mock the database and Redis initialization
@pytest.fixture(autouse=True)
def mock_dependencies():
    """Mock database and Redis dependencies for all tests"""
    with patch('app.core.database.init_db') as mock_init_db, \
         patch('app.core.redis_client.init_redis') as mock_init_redis, \
         patch('app.core.database.get_supabase') as mock_get_supabase, \
         patch('app.core.redis_client.get_redis') as mock_get_redis:
        
        # Mock async initialization functions
        mock_init_db.return_value = asyncio.Future()
        mock_init_db.return_value.set_result(None)
        
        mock_init_redis.return_value = asyncio.Future()
        mock_init_redis.return_value.set_result(None)
        
        # Mock Supabase client
        mock_supabase_client = MagicMock()
        mock_get_supabase.return_value = mock_supabase_client
        
        # Mock Redis client
        mock_redis_client = AsyncMock()
        mock_get_redis.return_value = mock_redis_client
        
        yield {
            'supabase': mock_supabase_client,
            'redis': mock_redis_client
        }

@pytest.fixture
def test_client():
    """Create test client with mocked dependencies"""
    from app.main import app
    return TestClient(app)

# Configure asyncio for pytest
@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()
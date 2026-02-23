import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.token_service import TokenService, _device_usage, _device_tokens

client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_storage():
    """Clear storage before each test."""
    _device_usage.clear()
    _device_tokens.clear()
    yield
    _device_usage.clear()
    _device_tokens.clear()

def test_get_tokens_new_device():
    """New device should have full free quota."""
    response = client.get("/api/v1/tokens", headers={"X-Device-Id": "new-device"})
    assert response.status_code == 200
    data = response.json()
    assert data["tokensRemaining"] == 10
    assert data["freeTrialUsed"] == False

def test_get_tokens_missing_header():
    """Request without device ID should fail."""
    response = client.get("/api/v1/tokens")
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_token_service_can_generate():
    """Test token service can_generate."""
    service = TokenService()
    
    # New device should be able to generate
    assert await service.can_generate("test-1") == True
    
    # Use all free generations
    for _ in range(10):
        await service.use_generation("test-1")
    
    # Should not be able to generate anymore
    assert await service.can_generate("test-1") == False

@pytest.mark.asyncio
async def test_token_service_add_tokens():
    """Test adding purchased tokens."""
    service = TokenService()
    
    # Use all free generations
    for _ in range(10):
        await service.use_generation("test-2")
    
    assert await service.can_generate("test-2") == False
    
    # Add tokens
    await service.add_tokens("test-2", 50)
    
    assert await service.can_generate("test-2") == True
    remaining, _ = await service.get_status("test-2")
    assert remaining == 50

@pytest.mark.asyncio
async def test_token_service_paid_tokens_first():
    """Paid tokens should be consumed before free tier."""
    service = TokenService()
    
    # Add paid tokens
    await service.add_tokens("test-3", 5)
    
    # Use one
    await service.use_generation("test-3")
    
    remaining, _ = await service.get_status("test-3")
    assert remaining == 4

@pytest.mark.asyncio
async def test_get_status():
    """Test get_status returns correct values."""
    service = TokenService()
    
    remaining, used = await service.get_status("test-4")
    assert remaining == 10
    assert used == False
    
    await service.use_generation("test-4")
    
    remaining, used = await service.get_status("test-4")
    assert remaining == 9
    assert used == True

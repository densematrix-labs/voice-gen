import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.services.token_service import _device_usage, _device_tokens

client = TestClient(app)

@pytest.fixture(autouse=True)
def clear_storage():
    """Clear storage before each test."""
    _device_usage.clear()
    _device_tokens.clear()
    yield
    _device_usage.clear()
    _device_tokens.clear()

def test_generate_missing_text():
    """Request without text should fail."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"voice": "alloy"},
        headers={"X-Device-Id": "test-device"}
    )
    assert response.status_code == 422

def test_generate_invalid_voice():
    """Invalid voice should fail."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello", "voice": "invalid_voice"},
        headers={"X-Device-Id": "test-device"}
    )
    assert response.status_code == 400
    assert "Invalid voice" in response.json()["detail"]

def test_generate_text_too_long():
    """Text over 5000 chars should fail."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "a" * 5001, "voice": "alloy"},
        headers={"X-Device-Id": "test-device"}
    )
    assert response.status_code == 422

def test_generate_missing_device_id():
    """Request without device ID should fail."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello", "voice": "alloy"}
    )
    assert response.status_code == 422

def test_generate_invalid_speed():
    """Speed outside 0.5-2.0 should fail."""
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello", "voice": "alloy", "speed": 3.0},
        headers={"X-Device-Id": "test-device"}
    )
    assert response.status_code == 422

def test_generate_no_tokens_error_format():
    """402 error should have correct detail format."""
    # Use up all free tokens
    for i in range(10):
        _device_usage["exhausted-device"] = {"date": "2099-01-01", "count": i + 1}
    
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello", "voice": "alloy"},
        headers={"X-Device-Id": "exhausted-device"}
    )
    
    # Should return 402 with proper error format
    assert response.status_code == 402
    data = response.json()
    detail = data.get("detail")
    
    # Detail should be serializable (not cause [object Object])
    if isinstance(detail, dict):
        assert "error" in detail or "message" in detail
    else:
        assert isinstance(detail, str)

@patch('app.api.v1.tts.settings')
def test_generate_no_api_key(mock_settings):
    """Should fail gracefully when API key not configured."""
    mock_settings.openai_api_key = ""
    mock_settings.llm_proxy_key = ""
    mock_settings.llm_proxy_url = ""
    mock_settings.openai_base_url = "https://api.openai.com/v1"
    
    response = client.post(
        "/api/v1/tts/generate",
        json={"text": "Hello", "voice": "alloy"},
        headers={"X-Device-Id": "test-device-2"}
    )
    
    assert response.status_code == 500
    assert "not configured" in response.json()["detail"]

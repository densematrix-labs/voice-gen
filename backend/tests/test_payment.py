import pytest
from unittest.mock import patch, MagicMock, AsyncMock
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

def test_checkout_missing_product():
    """Checkout without product should fail."""
    response = client.post(
        "/api/v1/payment/checkout",
        json={},
        headers={"X-Device-Id": "test-device"}
    )
    assert response.status_code == 422

def test_checkout_missing_device_id():
    """Checkout without device ID should fail."""
    response = client.post(
        "/api/v1/payment/checkout",
        json={"product_sku": "starter"}
    )
    assert response.status_code == 422

@patch('app.api.v1.payment.settings')
def test_checkout_payment_not_configured(mock_settings):
    """Should fail when payment not configured."""
    mock_settings.creem_api_key = ""
    
    response = client.post(
        "/api/v1/payment/checkout",
        json={"product_sku": "voice_gen_starter"},
        headers={"X-Device-Id": "test-device"}
    )
    
    assert response.status_code == 500
    assert "not configured" in response.json()["detail"]

@patch('app.api.v1.payment.settings')
def test_checkout_unknown_product(mock_settings):
    """Should fail for unknown product."""
    mock_settings.creem_api_key = "test_key"
    mock_settings.creem_product_ids = '{"voice_gen_starter": "prod_123"}'
    
    response = client.post(
        "/api/v1/payment/checkout",
        json={"product_sku": "unknown_product"},
        headers={"X-Device-Id": "test-device"}
    )
    
    assert response.status_code == 400
    assert "Unknown product" in response.json()["detail"]

def test_webhook_without_signature():
    """Webhook without signature should work when no secret configured."""
    response = client.post(
        "/api/v1/payment/webhook",
        json={"type": "checkout.completed", "data": {}}
    )
    assert response.status_code == 200

def test_webhook_checkout_completed():
    """Webhook should add tokens on checkout.completed."""
    response = client.post(
        "/api/v1/payment/webhook",
        json={
            "type": "checkout.completed",
            "data": {
                "metadata": {
                    "device_id": "webhook-test-device",
                    "product_sku": "voice_gen_starter"
                }
            }
        }
    )
    
    assert response.status_code == 200
    
    # Check tokens were added
    from app.services.token_service import _device_tokens
    assert _device_tokens.get("webhook-test-device") == 100

def test_webhook_unknown_event():
    """Unknown webhook events should be handled gracefully."""
    response = client.post(
        "/api/v1/payment/webhook",
        json={"type": "some.unknown.event", "data": {}}
    )
    assert response.status_code == 200
    assert response.json() == {"received": True}

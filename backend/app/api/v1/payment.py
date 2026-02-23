import json
import httpx
from fastapi import APIRouter, HTTPException, Header, Request
from pydantic import BaseModel

from app.config import settings
from app.services.token_service import TokenService

router = APIRouter()

PRODUCT_TOKENS = {
    "voice_gen_starter": 100,
    "voice_gen_pro": 9999,  # Unlimited-ish
}

class CheckoutRequest(BaseModel):
    product_sku: str

class CheckoutResponse(BaseModel):
    checkoutUrl: str

@router.post("/checkout")
async def create_checkout(
    request: CheckoutRequest,
    x_device_id: str = Header(..., alias="X-Device-Id")
) -> CheckoutResponse:
    """Create a Creem checkout session."""
    
    if not settings.creem_api_key:
        raise HTTPException(status_code=500, detail="Payment not configured")
    
    # Get product ID from config
    try:
        product_ids = json.loads(settings.creem_product_ids)
    except json.JSONDecodeError:
        product_ids = {}
    
    product_id = product_ids.get(request.product_sku)
    if not product_id:
        raise HTTPException(status_code=400, detail=f"Unknown product: {request.product_sku}")
    
    # Create checkout via Creem API
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://api.creem.io/v1/checkouts",
                headers={
                    "Authorization": f"Bearer {settings.creem_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "product_id": product_id,
                    "success_url": f"https://voice-gen.demo.densematrix.ai/payment/success?checkout_id={{CHECKOUT_ID}}",
                    "metadata": {
                        "device_id": x_device_id,
                        "product_sku": request.product_sku,
                    }
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to create checkout")
            
            data = response.json()
            return CheckoutResponse(checkoutUrl=data["checkout_url"])
            
        except httpx.HTTPError as e:
            raise HTTPException(status_code=500, detail=f"Payment service error: {str(e)}")

@router.post("/webhook")
async def webhook(request: Request):
    """Handle Creem webhook events."""
    import hmac
    import hashlib
    
    body = await request.body()
    signature = request.headers.get("X-Creem-Signature", "")
    
    # Verify signature
    if settings.creem_webhook_secret:
        expected = hmac.new(
            settings.creem_webhook_secret.encode(),
            body,
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected):
            raise HTTPException(status_code=400, detail="Invalid signature")
    
    data = await request.json()
    event_type = data.get("type")
    
    if event_type == "checkout.completed":
        metadata = data.get("data", {}).get("metadata", {})
        device_id = metadata.get("device_id")
        product_sku = metadata.get("product_sku")
        
        if device_id and product_sku:
            tokens_to_add = PRODUCT_TOKENS.get(product_sku, 0)
            token_service = TokenService()
            await token_service.add_tokens(device_id, tokens_to_add)
    
    return {"received": True}

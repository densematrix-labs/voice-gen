from fastapi import APIRouter, Header
from pydantic import BaseModel

from app.services.token_service import TokenService

router = APIRouter()

class TokenInfo(BaseModel):
    tokensRemaining: int
    freeTrialUsed: bool

@router.get("")
async def get_tokens(
    x_device_id: str = Header(..., alias="X-Device-Id")
) -> TokenInfo:
    """Get token information for a device."""
    token_service = TokenService()
    remaining, used = await token_service.get_status(x_device_id)
    
    return TokenInfo(
        tokensRemaining=remaining,
        freeTrialUsed=used
    )

from datetime import datetime, date
from typing import Tuple, Dict
from app.config import settings

# In-memory storage (use Redis/DB in production)
_device_usage: Dict[str, Dict] = {}
_device_tokens: Dict[str, int] = {}

class TokenService:
    """Service for managing generation tokens."""
    
    async def can_generate(self, device_id: str) -> bool:
        """Check if device can generate (has tokens or free tier available)."""
        # Check paid tokens first
        if _device_tokens.get(device_id, 0) > 0:
            return True
        
        # Check free tier
        today = date.today().isoformat()
        usage = _device_usage.get(device_id, {})
        
        if usage.get("date") != today:
            # New day, reset counter
            return True
        
        return usage.get("count", 0) < settings.free_generations_per_day
    
    async def use_generation(self, device_id: str) -> None:
        """Consume one generation."""
        # Use paid tokens first
        if _device_tokens.get(device_id, 0) > 0:
            _device_tokens[device_id] -= 1
            return
        
        # Use free tier
        today = date.today().isoformat()
        if device_id not in _device_usage:
            _device_usage[device_id] = {"date": today, "count": 0}
        
        if _device_usage[device_id].get("date") != today:
            _device_usage[device_id] = {"date": today, "count": 0}
        
        _device_usage[device_id]["count"] += 1
    
    async def get_status(self, device_id: str) -> Tuple[int, bool]:
        """Get remaining tokens and whether free trial was used today."""
        today = date.today().isoformat()
        usage = _device_usage.get(device_id, {})
        
        # Paid tokens
        paid_tokens = _device_tokens.get(device_id, 0)
        if paid_tokens > 0:
            return paid_tokens, True
        
        # Free tier
        if usage.get("date") != today:
            return settings.free_generations_per_day, False
        
        used = usage.get("count", 0)
        remaining = max(0, settings.free_generations_per_day - used)
        return remaining, used > 0
    
    async def add_tokens(self, device_id: str, count: int) -> None:
        """Add tokens to a device (from purchase)."""
        current = _device_tokens.get(device_id, 0)
        _device_tokens[device_id] = current + count

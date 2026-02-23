import os
from fastapi import APIRouter, HTTPException, Header
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from openai import OpenAI
from prometheus_client import Counter

from app.config import settings
from app.services.token_service import TokenService

router = APIRouter()

tts_generations = Counter(
    "tts_generations_total",
    "TTS generations",
    ["tool", "voice"]
)

VALID_VOICES = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]

class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    voice: str = Field(default="alloy")
    speed: float = Field(default=1.0, ge=0.5, le=2.0)

@router.post("/generate")
async def generate_speech(
    request: TTSRequest,
    x_device_id: str = Header(..., alias="X-Device-Id")
):
    """Generate speech from text using OpenAI TTS."""
    
    # Validate voice
    if request.voice not in VALID_VOICES:
        raise HTTPException(status_code=400, detail=f"Invalid voice. Must be one of: {VALID_VOICES}")
    
    # Check token availability
    token_service = TokenService()
    if not await token_service.can_generate(x_device_id):
        raise HTTPException(
            status_code=402,
            detail={"error": "No generations remaining. Please purchase more tokens.", "code": "payment_required"}
        )
    
    # Initialize OpenAI client
    api_key = settings.llm_proxy_key or settings.openai_api_key
    base_url = settings.llm_proxy_url or settings.openai_base_url
    
    if not api_key:
        raise HTTPException(status_code=500, detail="TTS service not configured")
    
    client = OpenAI(api_key=api_key, base_url=base_url)
    
    try:
        # Generate speech
        response = client.audio.speech.create(
            model="tts-1",
            voice=request.voice,
            input=request.text,
            speed=request.speed,
            response_format="mp3"
        )
        
        # Consume token
        await token_service.use_generation(x_device_id)
        
        # Track metric
        tts_generations.labels(tool=settings.tool_name, voice=request.voice).inc()
        
        # Return audio stream
        return StreamingResponse(
            iter([response.content]),
            media_type="audio/mpeg",
            headers={"Content-Disposition": "attachment; filename=speech.mp3"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate speech: {str(e)}")

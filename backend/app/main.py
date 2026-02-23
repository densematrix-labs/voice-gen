import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

from app.api.v1 import tts, tokens, payment

TOOL_NAME = os.getenv("TOOL_NAME", "voice-gen")

# Prometheus metrics
http_requests = Counter(
    "http_requests_total",
    "HTTP requests",
    ["tool", "endpoint", "method", "status"]
)
http_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["tool", "endpoint"]
)
tts_generations = Counter(
    "tts_generations_total",
    "TTS generations",
    ["tool", "voice"]
)

app = FastAPI(
    title="Voice Gen API",
    description="AI Text to Speech - ElevenLabs Alternative",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request tracking middleware
@app.middleware("http")
async def track_requests(request: Request, call_next):
    import time
    start = time.time()
    response = await call_next(request)
    duration = time.time() - start
    
    endpoint = request.url.path
    http_requests.labels(
        tool=TOOL_NAME,
        endpoint=endpoint,
        method=request.method,
        status=response.status_code
    ).inc()
    http_duration.labels(tool=TOOL_NAME, endpoint=endpoint).observe(duration)
    
    return response

# Include routers
app.include_router(tts.router, prefix="/api/v1/tts", tags=["TTS"])
app.include_router(tokens.router, prefix="/api/v1/tokens", tags=["Tokens"])
app.include_router(payment.router, prefix="/api/v1/payment", tags=["Payment"])

@app.get("/")
async def root():
    return {"message": "Voice Gen API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

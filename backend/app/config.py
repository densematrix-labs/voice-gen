from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # OpenAI TTS
    openai_api_key: str = ""
    openai_base_url: str = "https://api.openai.com/v1"
    
    # LLM Proxy (optional override)
    llm_proxy_url: str = ""
    llm_proxy_key: str = ""
    
    # Free tier
    free_generations_per_day: int = 10
    max_text_length: int = 5000
    
    # Creem payment
    creem_api_key: str = ""
    creem_webhook_secret: str = ""
    creem_product_ids: str = "{}"  # JSON string
    
    # Tool info
    tool_name: str = "voice-gen"
    
    class Config:
        env_file = ".env"

settings = Settings()

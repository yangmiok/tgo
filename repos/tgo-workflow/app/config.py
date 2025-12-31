import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    PROJECT_NAME: str = "TGO Workflow Engine"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/tgo_workflow"
    
    # Redis / Celery
    REDIS_URL: str = "redis://localhost:6379/0"
    
    @property
    def CELERY_BROKER_URL(self) -> str:
        return self.REDIS_URL
    
    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        return self.REDIS_URL
    
    # Integrations
    MAIN_SYSTEM_URL: str = "http://localhost:3000"
    MAIN_SYSTEM_API_KEY: Optional[str] = None
    
    # LLM Keys
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True, extra="ignore")

settings = Settings()


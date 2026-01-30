"""
Application configuration
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # API
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "StackAudit.ai"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ]
    
    # Database
    DATABASE_URL: str = "postgresql://stackaudit:stackaudit@localhost:5432/stackaudit"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # OpenAI
    OPENAI_API_KEY: str = ""
    
    # Anthropic
    ANTHROPIC_API_KEY: str = ""
    
    # GitHub
    GITHUB_TOKEN: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

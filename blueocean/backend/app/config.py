from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # App Settings
    app_name: str = "DataForge AI Backend"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # API Settings
    api_v1_prefix: str = "/api/v1"
    
    # Database Settings
    database_url: str = "postgresql://postgres:postgres@localhost:5432/dataforge"
    database_pool_size: int = 10
    database_max_overflow: int = 20
    
    # Redis Settings
    redis_url: str = "redis://localhost:6379/0"
    
    # Celery Settings
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"
    
    # File Upload Settings
    upload_dir: str = "./uploads"
    max_upload_size: int = 500 * 1024 * 1024  # 500MB
    allowed_extensions: list = [".csv", ".xlsx", ".xls", ".json", ".parquet"]
    
    # Analysis Settings
    chunk_size: int = 10000
    large_file_threshold: int = 1024 * 1024 * 1024  # 1GB
    preview_rows: int = 100
    
    # CORS Settings
    cors_origins: list = ["http://localhost:3000", "http://localhost:8080"]
    
    # Security
    secret_key: str = "your-secret-key-change-in-production"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

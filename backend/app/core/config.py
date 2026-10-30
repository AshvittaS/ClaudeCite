from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "change-me"

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/clausecite"

    # Frontend
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # ChromaDB
    CHROMA_PERSIST_PATH: str = "./chroma_db"
    CHROMA_LEGAL_COLLECTION: str = "legal_corpus"
    CHROMA_DOCS_COLLECTION: str = "user_documents"
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # LLM
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = "gemini-2.5-flash"

    # File storage
    UPLOAD_DIR: str = "./private_uploads"
    MAX_UPLOAD_MB: int = 25

    @property
    def MAX_UPLOAD_SIZE_BYTES(self) -> int:
        return self.MAX_UPLOAD_MB * 1024 * 1024

    # JWT
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080


settings = Settings()

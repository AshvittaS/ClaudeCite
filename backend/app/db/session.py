import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from app.core.config import settings

logger = logging.getLogger(__name__)

db_url = settings.DATABASE_URL

# Test connection or fallback to SQLite for immediate out-of-the-box readiness
if "sqlite" in db_url:
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
    )
else:
    try:
        engine = create_engine(
            db_url,
            pool_pre_ping=True,
            pool_size=10,
            max_overflow=20,
        )
        # Attempt quick test
        with engine.connect() as conn:
            pass
    except Exception as e:
        logger.warning(
            f"PostgreSQL connection to {db_url} failed ({e}). "
            "Falling back to local SQLite database (sqlite:///./clausecite.db) so you can run immediately!"
        )
        engine = create_engine(
            "sqlite:///./clausecite.db",
            connect_args={"check_same_thread": False},
        )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

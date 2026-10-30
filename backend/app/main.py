"""
ClauseCite Backend Application
FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.errors import AppError
from app.db.base import Base
from app.db.session import engine
from app.api.v1 import (
    auth,
    cases,
    chats,
    documents,
    summaries,
    comparisons,
    agreements,
    search,
    workspaces,
    prompts,
    settings as settings_router,
    feedback,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("clausecite")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create database tables on startup (if postgres is reachable)
    try:
        logger.info("Initializing database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.warning(
            f"Could not automatically create database tables on startup: {e}\n"
            "Ensure PostgreSQL is running and DATABASE_URL is configured in backend/.env"
        )
    yield


app = FastAPI(
    title="ClauseCite API",
    description="Grounded AI Legal Research & Contract Analysis Platform for Indian Law",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
origins = [
    settings.FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global AppError exception handler
@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail,
    )


# Health check
@app.get("/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "app": "ClauseCite API",
        "version": "1.0.0",
        "env": settings.APP_ENV,
    }


# Include v1 Routers
api_v1_prefix = "/api/v1"
app.include_router(auth.router, prefix=f"{api_v1_prefix}/auth", tags=["auth"])
app.include_router(workspaces.router, prefix=f"{api_v1_prefix}/workspaces", tags=["workspaces"])
app.include_router(cases.router, prefix=f"{api_v1_prefix}/cases", tags=["cases"])
app.include_router(chats.router, prefix=f"{api_v1_prefix}/chats", tags=["chats"])
app.include_router(documents.router, prefix=f"{api_v1_prefix}/documents", tags=["documents"])
app.include_router(summaries.router, prefix=f"{api_v1_prefix}/summaries", tags=["summaries"])
app.include_router(comparisons.router, prefix=f"{api_v1_prefix}/comparisons", tags=["comparisons"])
app.include_router(agreements.router, prefix=f"{api_v1_prefix}/agreements", tags=["agreements"])
app.include_router(search.router, prefix=f"{api_v1_prefix}/search", tags=["search"])
app.include_router(prompts.router, prefix=f"{api_v1_prefix}/prompts", tags=["prompts"])
app.include_router(settings_router.router, prefix=f"{api_v1_prefix}/settings", tags=["settings"])
app.include_router(feedback.router, prefix=f"{api_v1_prefix}/feedback", tags=["feedback"])

"""
Private file storage — local filesystem for development.
Never exposes the original client filename as a path.
"""
from __future__ import annotations

import logging
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


def _get_upload_dir() -> Path:
    p = Path(settings.UPLOAD_DIR).resolve()
    p.mkdir(parents=True, exist_ok=True)
    return p


def save_file(storage_key: str, data: bytes) -> None:
    """Save file bytes to private storage using the storage key as path."""
    path = _get_upload_dir() / storage_key.replace("/", "_")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    logger.info(f"Saved file: {storage_key}")


def load_file(storage_key: str) -> bytes:
    path = _get_upload_dir() / storage_key.replace("/", "_")
    if not path.exists():
        raise FileNotFoundError(f"File not found: {storage_key}")
    return path.read_bytes()


def delete_file(storage_key: str) -> None:
    path = _get_upload_dir() / storage_key.replace("/", "_")
    if path.exists():
        path.unlink()
        logger.info(f"Deleted file: {storage_key}")


def file_exists(storage_key: str) -> bool:
    path = _get_upload_dir() / storage_key.replace("/", "_")
    return path.exists()

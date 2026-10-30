from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, UserSettings
from app.schemas.schemas import UserSettingsOut, UserSettingsUpdate
from app.api.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=UserSettingsOut)
def get_settings(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    if not settings:
        settings = UserSettings(
            user_id=user.id,
            default_jurisdiction="India",
            citation_style="Bluebook",
            citation_strictness="strict",
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.patch("", response_model=UserSettingsOut)
def update_settings(
    payload: UserSettingsUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    if not settings:
        settings = UserSettings(user_id=user.id)
        db.add(settings)

    if payload.default_jurisdiction is not None:
        settings.default_jurisdiction = payload.default_jurisdiction
    if payload.citation_style is not None:
        settings.citation_style = payload.citation_style
    if payload.citation_strictness is not None:
        settings.citation_strictness = payload.citation_strictness
    if payload.export_defaults is not None:
        settings.export_defaults = payload.export_defaults
    if payload.model_preferences is not None:
        settings.model_preferences = payload.model_preferences

    db.commit()
    db.refresh(settings)
    return settings

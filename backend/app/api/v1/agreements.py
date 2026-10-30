from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import GeneratedDocument, User, UserSettings
from app.schemas.schemas import DraftCreate, DraftOut, TemplateOut
from app.api.dependencies import get_current_user, get_current_workspace_id
from app.services.agreement_service import (
    get_all_templates,
    get_template_by_id,
    get_template_categories,
    generate_draft,
)

router = APIRouter()


class DraftUpdate(BaseModel):
    content: Optional[str] = None
    status: Optional[str] = None


@router.get("/templates", response_model=list[TemplateOut])
def list_templates(
    document_type: Optional[str] = Query(None),
    jurisdiction: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    templates = get_all_templates(
        db,
        document_type=document_type,
        jurisdiction=jurisdiction,
        category=category,
    )
    return templates


@router.get("/templates/categories")
def list_template_categories(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_template_categories(db)


@router.get("/templates/{template_id}", response_model=TemplateOut)
def get_template(
    template_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    tmpl = get_template_by_id(db, template_id)
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found")
    return tmpl


@router.post("/draft", response_model=DraftOut, status_code=status.HTTP_201_CREATED)
def create_draft(
    payload: DraftCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    target_ws = payload.workspace_id or workspace_id
    jurisdiction = payload.jurisdiction
    if not jurisdiction:
        user_settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
        jurisdiction = user_settings.default_jurisdiction if user_settings else "India"

    draft = generate_draft(
        db=db,
        workspace_id=target_ws,
        owner_user_id=user.id,
        template_id=payload.template_id,
        jurisdiction=jurisdiction,
        requirements=payload.requirements,
        document_type=payload.document_type,
        answers=payload.answers or {},
        case_id=payload.case_id,
    )
    return draft


@router.get("/drafts", response_model=list[DraftOut])
def list_drafts(
    case_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    query = db.query(GeneratedDocument).filter(GeneratedDocument.workspace_id == workspace_id)
    if case_id:
        query = query.filter(GeneratedDocument.case_id == case_id)
    return query.order_by(GeneratedDocument.created_at.desc()).all()


@router.get("/drafts/{draft_id}", response_model=DraftOut)
def get_draft(
    draft_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    draft = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == draft_id,
        GeneratedDocument.workspace_id == workspace_id,
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return draft


@router.patch("/drafts/{draft_id}", response_model=DraftOut)
def update_draft(
    draft_id: str,
    payload: DraftUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    draft = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == draft_id,
        GeneratedDocument.workspace_id == workspace_id,
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    if payload.content is not None:
        draft.content = payload.content
    if payload.status is not None:
        draft.status = payload.status

    db.commit()
    db.refresh(draft)
    return draft


@router.delete("/drafts/{draft_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_draft(
    draft_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    draft = db.query(GeneratedDocument).filter(
        GeneratedDocument.id == draft_id,
        GeneratedDocument.workspace_id == workspace_id,
    ).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    db.delete(draft)
    db.commit()
    return None

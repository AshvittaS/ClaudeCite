import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Case, Chat, Document, User
from app.schemas.schemas import CaseCreate, CaseUpdate, CaseOut
from app.api.dependencies import get_current_user, get_current_workspace_id

router = APIRouter()


@router.get("", response_model=list[CaseOut])
def list_cases(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
    status_filter: Optional[str] = Query(None, alias="status"),
):
    query = db.query(Case).filter(Case.workspace_id == workspace_id)
    if status_filter:
        query = query.filter(Case.status == status_filter)
    cases = query.order_by(Case.updated_at.desc()).all()

    result = []
    for c in cases:
        chat_cnt = db.query(Chat).filter(Chat.case_id == c.id).count()
        doc_cnt = db.query(Document).filter(Document.case_id == c.id).count()
        out = CaseOut(
            id=c.id,
            workspace_id=c.workspace_id,
            title=c.title,
            practice_area=c.practice_area,
            status=c.status,
            custom_instructions=c.custom_instructions,
            created_at=c.created_at,
            updated_at=c.updated_at,
            chat_count=chat_cnt,
            file_count=doc_cnt,
        )
        result.append(out)
    return result


@router.post("", response_model=CaseOut, status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    target_ws = payload.workspace_id or workspace_id
    new_case = Case(
        id=str(uuid.uuid4()),
        workspace_id=target_ws,
        title=payload.title,
        practice_area=payload.practice_area,
        status=payload.status or "active",
        custom_instructions=payload.custom_instructions,
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return CaseOut(
        id=new_case.id,
        workspace_id=new_case.workspace_id,
        title=new_case.title,
        practice_area=new_case.practice_area,
        status=new_case.status,
        custom_instructions=new_case.custom_instructions,
        created_at=new_case.created_at,
        updated_at=new_case.updated_at,
        chat_count=0,
        file_count=0,
    )


@router.get("/{case_id}", response_model=CaseOut)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    case = db.query(Case).filter(Case.id == case_id, Case.workspace_id == workspace_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    chat_cnt = db.query(Chat).filter(Chat.case_id == case.id).count()
    doc_cnt = db.query(Document).filter(Document.case_id == case.id).count()
    return CaseOut(
        id=case.id,
        workspace_id=case.workspace_id,
        title=case.title,
        practice_area=case.practice_area,
        status=case.status,
        custom_instructions=case.custom_instructions,
        created_at=case.created_at,
        updated_at=case.updated_at,
        chat_count=chat_cnt,
        file_count=doc_cnt,
    )


@router.patch("/{case_id}", response_model=CaseOut)
def update_case(
    case_id: str,
    payload: CaseUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    case = db.query(Case).filter(Case.id == case_id, Case.workspace_id == workspace_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if payload.title is not None:
        case.title = payload.title
    if payload.practice_area is not None:
        case.practice_area = payload.practice_area
    if payload.status is not None:
        case.status = payload.status
    if payload.custom_instructions is not None:
        case.custom_instructions = payload.custom_instructions

    case.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(case)

    chat_cnt = db.query(Chat).filter(Chat.case_id == case.id).count()
    doc_cnt = db.query(Document).filter(Document.case_id == case.id).count()
    return CaseOut(
        id=case.id,
        workspace_id=case.workspace_id,
        title=case.title,
        practice_area=case.practice_area,
        status=case.status,
        custom_instructions=case.custom_instructions,
        created_at=case.created_at,
        updated_at=case.updated_at,
        chat_count=chat_cnt,
        file_count=doc_cnt,
    )


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    case = db.query(Case).filter(Case.id == case_id, Case.workspace_id == workspace_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    db.delete(case)
    db.commit()
    return None

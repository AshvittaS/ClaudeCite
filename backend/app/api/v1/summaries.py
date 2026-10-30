from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Document, User, UserSettings
from app.schemas.schemas import SummaryRequest
from app.api.dependencies import get_current_user, get_current_workspace_id
from app.services.summary_service import summarize_document

router = APIRouter()


@router.post("")
def create_summary(
    payload: SummaryRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    doc = None
    if payload.document_id:
        doc = db.query(Document).filter(
            Document.id == payload.document_id,
            Document.workspace_id == workspace_id,
        ).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
    elif not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Either document_id or text must be provided")

    jurisdiction = payload.jurisdiction
    if not jurisdiction:
        user_settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
        jurisdiction = user_settings.default_jurisdiction if user_settings else "India"

    try:
        summary_result = summarize_document(
            db=db,
            document=doc,
            raw_text=payload.text,
            document_name=payload.document_name or (doc.original_filename if doc else "Contract Draft"),
            focus=payload.focus or [],
            jurisdiction=jurisdiction,
        )
        return summary_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

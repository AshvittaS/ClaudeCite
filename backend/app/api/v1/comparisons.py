from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Document, User, UserSettings
from app.schemas.schemas import ComparisonRequest
from app.api.dependencies import get_current_user, get_current_workspace_id
from app.services.comparison_service import compare_agreements

router = APIRouter()


@router.post("")
def compare_docs(
    payload: ComparisonRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    base_doc = db.query(Document).filter(
        Document.id == payload.baseline_document_id,
        Document.workspace_id == workspace_id,
    ).first()
    if not base_doc:
        raise HTTPException(status_code=404, detail="Baseline document not found")

    rev_doc = db.query(Document).filter(
        Document.id == payload.revised_document_id,
        Document.workspace_id == workspace_id,
    ).first()
    if not rev_doc:
        raise HTTPException(status_code=404, detail="Revised document not found")

    jurisdiction = payload.jurisdiction
    if not jurisdiction:
        user_settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
        jurisdiction = user_settings.default_jurisdiction if user_settings else "India"

    try:
        comparison_result = compare_agreements(
            db=db,
            baseline=base_doc,
            revised=rev_doc,
            jurisdiction=jurisdiction,
        )
        return comparison_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

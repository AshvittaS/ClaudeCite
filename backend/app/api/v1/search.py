from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Case, Chat, Document, User
from app.schemas.schemas import SearchResult
from app.api.dependencies import get_current_user, get_current_workspace_id
from app.ai.rag_adapter import get_rag_manager

router = APIRouter()


@router.get("", response_model=list[SearchResult])
def search_workspace(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    results: list[SearchResult] = []
    pattern = f"%{q}%"

    # Search cases
    cases = (
        db.query(Case)
        .filter(Case.workspace_id == workspace_id, Case.title.ilike(pattern))
        .limit(limit)
        .all()
    )
    for c in cases:
        results.append(
            SearchResult(
                type="case",
                id=c.id,
                title=c.title,
                snippet=f"Practice Area: {c.practice_area or 'General'} · Status: {c.status}",
                updated_at=c.updated_at,
            )
        )

    # Search documents
    docs = (
        db.query(Document)
        .filter(Document.workspace_id == workspace_id, Document.original_filename.ilike(pattern))
        .limit(limit)
        .all()
    )
    for d in docs:
        results.append(
            SearchResult(
                type="document",
                id=d.id,
                title=d.original_filename,
                snippet=f"Status: {d.processing_status} · Pages: {d.page_count or 'Unknown'}",
                updated_at=d.created_at,
            )
        )

    # Search chats
    chats = (
        db.query(Chat)
        .filter(Chat.workspace_id == workspace_id, Chat.title.ilike(pattern))
        .limit(limit)
        .all()
    )
    for ch in chats:
        results.append(
            SearchResult(
                type="chat",
                id=ch.id,
                title=ch.title,
                snippet=f"Chat session",
                updated_at=ch.updated_at,
            )
        )

    return results[:limit]


@router.get("/legal")
def search_legal_corpus(
    q: str = Query(..., min_length=2),
    top_k: int = Query(5, ge=1, le=20),
):
    """Direct search over indexed Indian statutes/legal corpus."""
    try:
        rag = get_rag_manager()
        legal_retriever = rag.get_legal_retriever()
        passages = legal_retriever.search(q, top_k=top_k)
        return [
            {
                "id": p.source_id,
                "title": p.title,
                "section": p.section,
                "citation": p.citation,
                "text": p.text,
                "score": p.retrieval_score,
                "effective_date": p.effective_date,
            }
            for p in passages
        ]
    except Exception as e:
        import traceback
        traceback.print_exc()
        return []

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Document, DocumentChunk, ProcessingJob, User
from app.schemas.schemas import DocumentOut, DocumentUploadResponse, JobOut
from app.api.dependencies import get_current_user, get_current_workspace_id
from app.services.document_processing_service import process_document
from app.storage.local import load_file, delete_file
from app.ai.rag_adapter import get_rag_manager
from app.core.config import settings

router = APIRouter()


@router.get("", response_model=list[DocumentOut])
def list_documents(
    case_id: Optional[str] = Query(None),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    query = db.query(Document).filter(Document.workspace_id == workspace_id)
    if case_id:
        query = query.filter(Document.case_id == case_id)
    if status_filter:
        query = query.filter(Document.processing_status == status_filter)
    docs = query.order_by(Document.created_at.desc()).all()
    return docs


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    case_id: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    content = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum size limit of {settings.MAX_UPLOAD_MB}MB",
        )

    doc_id = str(uuid.uuid4())
    storage_key = f"{doc_id}_{file.filename}"

    new_doc = Document(
        id=doc_id,
        workspace_id=workspace_id,
        owner_user_id=user.id,
        case_id=case_id if case_id and case_id != "null" else None,
        original_filename=file.filename or "uploaded_file",
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
        storage_key=storage_key,
        processing_status="pending",
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)

    # Run processing synchronously
    job = process_document(db, new_doc, content)

    return DocumentUploadResponse(
        document_id=new_doc.id,
        filename=new_doc.original_filename,
        processing_status=new_doc.processing_status,
        job_id=job.id if job else None,
    )


@router.get("/{document_id}", response_model=DocumentOut)
def get_document(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.workspace_id == workspace_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/{document_id}/download")
def download_document(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.workspace_id == workspace_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    file_bytes = load_file(doc.storage_key)
    if not file_bytes:
        raise HTTPException(status_code=404, detail="Document file not found on disk")

    media_type = doc.mime_type or "application/octet-stream"
    headers = {"Content-Disposition": f'attachment; filename="{doc.original_filename}"'}
    return Response(content=file_bytes, media_type=media_type, headers=headers)


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.workspace_id == workspace_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove storage file
    delete_file(doc.storage_key)

    # Delete ChromaDB chunks
    try:
        rag = get_rag_manager()
        rag.delete_document_chunks(settings.CHROMA_DOCS_COLLECTION, document_id)
    except Exception:
        pass

    # Delete db chunks and processing jobs
    db.query(DocumentChunk).filter(DocumentChunk.document_id == document_id).delete()
    db.query(ProcessingJob).filter(ProcessingJob.document_id == document_id).delete()
    db.delete(doc)
    db.commit()
    return None


@router.get("/{document_id}/jobs", response_model=list[JobOut])
def get_document_jobs(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    doc = db.query(Document).filter(Document.id == document_id, Document.workspace_id == workspace_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    jobs = db.query(ProcessingJob).filter(ProcessingJob.document_id == document_id).order_by(ProcessingJob.created_at.desc()).all()
    return jobs

"""
DocumentProcessingService — handles the full upload → extract → chunk → index pipeline.
Runs synchronously for now (no Celery), with file size limits enforced.
"""
from __future__ import annotations

import logging
from sqlalchemy.orm import Session

from app.db.models import Document, DocumentChunk, ProcessingJob
from app.ai.rag_adapter import get_rag_manager
from app.core.config import settings
from app.document_processing.extract import extract_text, chunk_pages
from app.storage.local import save_file, load_file, delete_file
from app.core.errors import DocumentNotReadyError

logger = logging.getLogger(__name__)


def process_document(
    db: Session,
    document: Document,
    file_bytes: bytes,
) -> ProcessingJob:
    """
    Full document processing pipeline:
    1. Save to private storage
    2. Extract text
    3. Chunk
    4. Index into ChromaDB
    5. Update DB status
    """
    # Get or create associated job
    job = db.query(ProcessingJob).filter(
        ProcessingJob.document_id == document.id,
        ProcessingJob.job_type == "indexing",
    ).first()
    if not job:
        job = ProcessingJob(
            workspace_id=document.workspace_id,
            owner_user_id=document.owner_user_id,
            document_id=document.id,
            job_type="indexing",
            status="processing",
        )
        db.add(job)

    try:
        job.status = "processing"
        job.progress = 0.1
        db.flush()

        # Step 1: Save file
        save_file(document.storage_key, file_bytes)
        job.progress = 0.2
        db.flush()

        # Step 2: Extract text
        full_text, pages, page_count = extract_text(
            file_bytes, document.original_filename, document.mime_type or ""
        )
        document.page_count = page_count
        document.extraction_metadata = {"page_count": page_count, "char_count": len(full_text)}
        job.progress = 0.5
        db.flush()

        # Step 3: Chunk
        chunks = chunk_pages(
            pages=pages,
            document_id=document.id,
            workspace_id=document.workspace_id,
            owner_id=document.owner_user_id,
            original_filename=document.original_filename,
        )
        job.progress = 0.7
        db.flush()

        # Step 4: Index into ChromaDB
        rag = get_rag_manager()
        if chunks:
            rag.add_document_chunks(
                collection_name=settings.CHROMA_DOCS_COLLECTION,
                chunk_ids=[c["id"] for c in chunks],
                texts=[c["text"] for c in chunks],
                metadatas=[c["metadata"] for c in chunks],
            )

        # Step 5: Save chunk records to DB
        import uuid
        for c in chunks:
            db_chunk = DocumentChunk(
                id=str(uuid.uuid4()),
                document_id=document.id,
                chunk_index=c["chunk_index"],
                page_number=c["page_number"],
                section_label=c["section_label"],
                chroma_record_id=c["id"],
            )
            db.add(db_chunk)

        document.processing_status = "ready"
        job.status = "completed"
        job.progress = 1.0
        db.commit()
        db.refresh(job)
        logger.info(f"Document {document.id} processed: {len(chunks)} chunks indexed.")

    except Exception as e:
        logger.error(f"Document processing failed for {document.id}: {e}", exc_info=True)
        document.processing_status = "failed"
        job.status = "failed"
        job.error_code = "PROCESSING_ERROR"
        job.error_message = str(e)[:500]
        db.commit()

    return job


def delete_document_index(db: Session, document: Document) -> None:
    """Remove document from ChromaDB and storage."""
    rag = get_rag_manager()
    rag.delete_document_chunks(settings.CHROMA_DOCS_COLLECTION, document.id)

    try:
        delete_file(document.storage_key)
    except FileNotFoundError:
        pass

    document.processing_status = "deleted"
    db.commit()
    logger.info(f"Document {document.id} deleted from index and storage.")

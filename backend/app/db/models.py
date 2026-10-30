import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, Text, Integer, ForeignKey, JSON, Float, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import enum

from app.db.base import Base


def new_uuid():
    return str(uuid.uuid4())


def now_utc():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=new_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True)
    display_name = Column(String(255), nullable=False, default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    workspaces = relationship("WorkspaceMember", back_populates="user")
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    chats = relationship("Chat", back_populates="owner")
    documents = relationship("Document", back_populates="owner")
    cases = relationship("Case", back_populates="created_by_user")
    feedbacks = relationship("Feedback", back_populates="user")


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True, default=new_uuid)
    name = Column(String(255), nullable=False)
    owner_user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    workspace_type = Column(String(50), default="personal")
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    members = relationship("WorkspaceMember", back_populates="workspace")
    cases = relationship("Case", back_populates="workspace")
    chats = relationship("Chat", back_populates="workspace")
    documents = relationship("Document", back_populates="workspace")


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    workspace_id = Column(String(36), ForeignKey("workspaces.id"), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    role = Column(String(50), default="member")
    created_at = Column(DateTime(timezone=True), default=now_utc)

    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User", back_populates="workspaces")


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    default_jurisdiction = Column(String(100), default="India")
    citation_style = Column(String(50), default="Standard")
    citation_strictness = Column(String(50), default="normal")
    export_defaults = Column(JSON, default=dict)
    model_preferences = Column(JSON, default=dict)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    user = relationship("User", back_populates="settings")


class Case(Base):
    __tablename__ = "cases"

    id = Column(String(36), primary_key=True, default=new_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    practice_area = Column(String(255), nullable=True)
    status = Column(String(50), default="active")
    custom_instructions = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    workspace = relationship("Workspace", back_populates="cases")
    created_by_user = relationship("User", back_populates="cases")
    chats = relationship("Chat", back_populates="case")
    case_documents = relationship("CaseDocument", back_populates="case")


class Chat(Base):
    __tablename__ = "chats"

    id = Column(String(36), primary_key=True, default=new_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    owner_user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=True, index=True)
    title = Column(String(500), default="New Chat")
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    workspace = relationship("Workspace", back_populates="chats")
    owner = relationship("User", back_populates="chats")
    case = relationship("Case", back_populates="chats")
    messages = relationship("Message", back_populates="chat", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, default=new_uuid)
    chat_id = Column(String(36), ForeignKey("chats.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # 'user' or 'assistant'
    content = Column(Text, nullable=False)
    sources = Column(JSON, nullable=True)   # verified sources array
    metadata_ = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=now_utc)

    chat = relationship("Chat", back_populates="messages")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=new_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    owner_user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=True, index=True)
    original_filename = Column(String(500), nullable=False)
    storage_key = Column(String(500), nullable=False, unique=True)
    mime_type = Column(String(255), nullable=True)
    size_bytes = Column(Integer, nullable=True)
    sha256 = Column(String(64), nullable=True)
    processing_status = Column(String(50), default="queued")  # queued, processing, ready, failed
    extraction_metadata = Column(JSON, nullable=True)
    page_count = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    workspace = relationship("Workspace", back_populates="documents")
    owner = relationship("User", back_populates="documents")
    case_links = relationship("CaseDocument", back_populates="document")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")
    processing_jobs = relationship("ProcessingJob", back_populates="document", cascade="all, delete-orphan")


class CaseDocument(Base):
    __tablename__ = "case_documents"

    case_id = Column(String(36), ForeignKey("cases.id"), primary_key=True)
    document_id = Column(String(36), ForeignKey("documents.id"), primary_key=True)
    added_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=now_utc)

    case = relationship("Case", back_populates="case_documents")
    document = relationship("Document", back_populates="case_links")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String(36), primary_key=True, default=new_uuid)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    page_number = Column(Integer, nullable=True)
    section_label = Column(String(500), nullable=True)
    content_hash = Column(String(64), nullable=True)
    chroma_record_id = Column(String(500), nullable=True)

    document = relationship("Document", back_populates="chunks")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(String(36), primary_key=True, default=new_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    owner_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    document_id = Column(String(36), ForeignKey("documents.id"), nullable=True)
    job_type = Column(String(100), nullable=False)  # indexing, summary, comparison, export
    status = Column(String(50), default="queued")   # queued, processing, completed, failed
    progress = Column(Float, default=0.0)
    error_code = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    result = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)

    document = relationship("Document", back_populates="processing_jobs")


class Template(Base):
    __tablename__ = "templates"

    id = Column(String(36), primary_key=True, default=new_uuid)
    name = Column(String(255), nullable=False)
    document_type = Column(String(100), nullable=False)
    jurisdiction = Column(String(100), default="India")
    version = Column(String(50), default="1.0")
    schema_ = Column("schema", JSON, nullable=True)
    clause_rules = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=now_utc)


class GeneratedDocument(Base):
    __tablename__ = "generated_documents"

    id = Column(String(36), primary_key=True, default=new_uuid)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    owner_user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=True)
    template_id = Column(String(36), ForeignKey("templates.id"), nullable=True)
    template_version = Column(String(50), nullable=True)
    input_data = Column(JSON, nullable=True)
    storage_key = Column(String(500), nullable=True)
    status = Column(String(50), default="draft")
    content = Column(Text, nullable=True)  # markdown/text of the document
    created_at = Column(DateTime(timezone=True), default=now_utc)
    updated_at = Column(DateTime(timezone=True), default=now_utc, onupdate=now_utc)


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id = Column(String(36), primary_key=True, default=new_uuid)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    prompt_body = Column(Text, nullable=False)
    jurisdiction = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=now_utc)


Prompt = PromptTemplate


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String(36), primary_key=True, default=new_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    workspace_id = Column(String(36), nullable=True)
    category = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=now_utc)

    user = relationship("User", back_populates="feedbacks")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String(36), primary_key=True, default=new_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    workspace_id = Column(String(36), nullable=True)
    action = Column(String(200), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(36), nullable=True)
    metadata_ = Column("metadata", JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), default=now_utc)

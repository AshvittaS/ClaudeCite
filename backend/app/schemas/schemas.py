from pydantic import BaseModel, EmailStr, field_validator
from typing import Any, Optional
from datetime import datetime


class PaginatedResponse(BaseModel):
    items: list[Any]
    total: int
    limit: int
    offset: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str = ""

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters.")
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: str
    display_name: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class WorkspaceCreate(BaseModel):
    name: str
    workspace_type: str = "personal"


class WorkspaceOut(BaseModel):
    id: str
    name: str
    owner_user_id: str
    workspace_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserSettingsOut(BaseModel):
    user_id: str
    default_jurisdiction: str
    citation_style: str
    citation_strictness: str
    export_defaults: Optional[dict] = {}
    model_preferences: Optional[dict] = {}

    model_config = {"from_attributes": True}


class UserSettingsUpdate(BaseModel):
    default_jurisdiction: Optional[str] = None
    citation_style: Optional[str] = None
    citation_strictness: Optional[str] = None
    export_defaults: Optional[dict] = None
    model_preferences: Optional[dict] = None


class CaseCreate(BaseModel):
    title: str
    practice_area: Optional[str] = None
    status: str = "active"
    custom_instructions: Optional[str] = None
    workspace_id: Optional[str] = None


class CaseUpdate(BaseModel):
    title: Optional[str] = None
    practice_area: Optional[str] = None
    status: Optional[str] = None
    custom_instructions: Optional[str] = None


class CaseOut(BaseModel):
    id: str
    workspace_id: str
    title: str
    practice_area: Optional[str] = None
    status: str
    custom_instructions: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    chat_count: int = 0
    file_count: int = 0

    model_config = {"from_attributes": True}


class ChatCreate(BaseModel):
    title: Optional[str] = "New Chat"
    case_id: Optional[str] = None
    workspace_id: Optional[str] = None


class ChatUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None


class ChatOut(BaseModel):
    id: str
    workspace_id: str
    owner_user_id: str
    case_id: Optional[str] = None
    title: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageSendRequest(BaseModel):
    content: str
    document_ids: list[str] = []
    jurisdiction: Optional[str] = None
    citation_style: Optional[str] = None


class CitationOut(BaseModel):
    source_id: str
    title: str
    citation: str
    section: Optional[str] = None
    excerpt: str
    effective_date: Optional[str] = None
    verification_status: str = "verified"
    source_url: Optional[str] = None


class MessageOut(BaseModel):
    id: str
    chat_id: str
    role: str
    content: str
    sources: Optional[list[CitationOut]] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class DocumentUploadResponse(BaseModel):
    document_id: str
    filename: str
    processing_status: str
    job_id: Optional[str] = None


class DocumentOut(BaseModel):
    id: str
    workspace_id: str
    original_filename: str
    mime_type: Optional[str] = None
    size_bytes: Optional[int] = None
    processing_status: str
    page_count: Optional[int] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class JobOut(BaseModel):
    id: str
    job_type: str
    status: str
    progress: float
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    result: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SummaryRequest(BaseModel):
    document_id: Optional[str] = None
    text: Optional[str] = None
    document_name: Optional[str] = None
    focus: list[str] = []
    jurisdiction: Optional[str] = None


class ComparisonRequest(BaseModel):
    baseline_document_id: str
    revised_document_id: str
    jurisdiction: Optional[str] = None


class DraftCreate(BaseModel):
    template_id: Optional[str] = None
    case_id: Optional[str] = None
    jurisdiction: str = "India"
    requirements: str
    document_type: str = "NDA"
    answers: Optional[dict] = {}
    workspace_id: Optional[str] = None


class DraftOut(BaseModel):
    id: str
    status: str
    content: Optional[str] = None
    input_data: Optional[dict] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TemplateOut(BaseModel):
    id: str
    name: str
    document_type: str
    jurisdiction: str
    version: str
    category: Optional[str] = None
    schema_: Optional[dict] = None

    model_config = {"from_attributes": True}


class PromptOut(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None
    prompt_body: str
    jurisdiction: Optional[str] = None

    model_config = {"from_attributes": True}


class FeedbackCreate(BaseModel):
    category: str
    message: str

    @field_validator("message")
    @classmethod
    def length_check(cls, v: str) -> str:
        if len(v) > 5000:
            raise ValueError("Message too long.")
        return v


class SearchResult(BaseModel):
    type: str   # 'chat', 'case', 'document'
    id: str
    title: str
    snippet: Optional[str] = None
    updated_at: Optional[datetime] = None

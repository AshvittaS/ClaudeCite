import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Chat, Message, User, UserSettings
from app.schemas.schemas import (
    ChatCreate,
    ChatUpdate,
    ChatOut,
    MessageSendRequest,
    MessageOut,
)
from app.api.dependencies import get_current_user, get_current_workspace_id
from pydantic import BaseModel
from app.services.chat_service import send_message_and_respond, ask_clausecite

router = APIRouter()


class DirectAskRequest(BaseModel):
    content: str
    jurisdiction: Optional[str] = "India"
    document_ids: list[str] = []


@router.post("/ask")
def direct_ask(payload: DirectAskRequest):
    """Direct Ask ClauseCite endpoint with live hybrid RAG + Gemini generation."""
    return ask_clausecite(
        question=payload.content,
        jurisdiction=payload.jurisdiction or "India",
        document_ids=payload.document_ids or [],
    )


@router.get("", response_model=list[ChatOut])
def list_chats(
    case_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    query = db.query(Chat).filter(Chat.workspace_id == workspace_id)
    if case_id:
        query = query.filter(Chat.case_id == case_id)
    chats = query.order_by(Chat.is_pinned.desc(), Chat.updated_at.desc()).all()
    return chats


@router.post("", response_model=ChatOut, status_code=status.HTTP_201_CREATED)
def create_chat(
    payload: ChatCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    target_ws = payload.workspace_id or workspace_id
    new_chat = Chat(
        id=str(uuid.uuid4()),
        workspace_id=target_ws,
        owner_user_id=user.id,
        case_id=payload.case_id,
        title=payload.title or "New Chat",
    )
    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)
    return new_chat


@router.get("/{chat_id}", response_model=ChatOut)
def get_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.workspace_id == workspace_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.patch("/{chat_id}", response_model=ChatOut)
def update_chat(
    chat_id: str,
    payload: ChatUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.workspace_id == workspace_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if payload.title is not None:
        chat.title = payload.title
    if payload.is_pinned is not None:
        chat.is_pinned = payload.is_pinned

    db.commit()
    db.refresh(chat)
    return chat


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(
    chat_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.workspace_id == workspace_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    db.delete(chat)
    db.commit()
    return None


@router.get("/{chat_id}/messages", response_model=list[MessageOut])
def get_chat_messages(
    chat_id: str,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.workspace_id == workspace_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    messages = (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
        .all()
    )
    return messages


@router.post("/{chat_id}/messages", response_model=MessageOut)
def send_message(
    chat_id: str,
    payload: MessageSendRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    workspace_id: str = Depends(get_current_workspace_id),
):
    chat = db.query(Chat).filter(Chat.id == chat_id, Chat.workspace_id == workspace_id).first()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Determine jurisdiction
    jurisdiction = payload.jurisdiction
    if not jurisdiction:
        user_settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
        jurisdiction = user_settings.default_jurisdiction if user_settings else "India"

    _, assistant_msg = send_message_and_respond(
        db=db,
        chat=chat,
        user_content=payload.content,
        document_ids=payload.document_ids or [],
        jurisdiction=jurisdiction,
    )
    return assistant_msg

"""
ChatService — handles the Ask ClauseCite pipeline:
1. Retrieve legal sources via hybrid RAG
2. Build grounded prompt
3. Call LLM
4. Verify citations
5. Persist messages
"""
from __future__ import annotations

import logging
from sqlalchemy.orm import Session

from app.db.models import Chat, Message, UserSettings
from app.ai.llm_client import get_llm_client
from app.ai.rag_adapter import get_rag_manager, RetrievedPassage
from app.ai.citation_verifier import passages_to_citations
from app.core.errors import NotFoundError, ForbiddenError

logger = logging.getLogger(__name__)


LEGAL_SYSTEM_PROMPT = """You are ClauseCite, an authoritative legal research AI assistant specializing in Indian jurisprudence and statutory law.

Your role:
- Answer questions about Indian statutes, consumer rights, constitutional law, contracts, commercial law, and criminal law accurately and comprehensively.
- When relevant source passages are provided below, prioritize citations and direct textual analysis from them.
- When general statutory provisions are requested (such as the Consumer Protection Act 2019, Indian Contract Act 1872, Arbitration & Conciliation Act 1996, Bharatiya Nyaya Sanhita 2023), provide the full, authoritative statutory framework under Indian law (e.g., enumerating specific sections and codified rights).
- Structure your response with clear headings, bullet points, statutory section numbers, remedies, and practical implications.
- Maintain a professional, objective legal tone. Label responses as AI-assisted legal research.
"""


def get_recent_messages(db: Session, chat_id: str, limit: int = 10) -> list[Message]:
    return (
        db.query(Message)
        .filter(Message.chat_id == chat_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .all()[::-1]
    )


def build_chat_prompt(
    question: str,
    passages: list[RetrievedPassage],
    history: list[Message],
    case_instructions: str | None,
    jurisdiction: str,
) -> str:
    context_parts = []
    has_attached_docs = False
    for i, p in enumerate(passages):
        header = f"Source {i+1}: {p.title}"
        if p.section:
            header += f" — {p.section}"
        if p.page:
            header += f" (Page {p.page})"
        if p.citation:
            header += f" [{p.citation}]"
        context_parts.append(f"{header}\n{p.text[:1200]}")
        if p.title and not p.title.startswith("Section ") and "Act" not in p.title:
            has_attached_docs = True

    context = "\n\n---\n\n".join(context_parts) if context_parts else "No specific legal sources or document passages retrieved."

    history_text = ""
    if history:
        history_lines = []
        for m in history[-6:]:
            role = "User" if m.role == "user" else "Assistant"
            history_lines.append(f"{role}: {m.content[:300]}")
        history_text = "\n".join(history_lines)

    attached_doc_instruction = (
        "IMPORTANT: The user has attached workspace document(s) shown in the Retrieved Legal Sources above. "
        "When the user asks 'tell me about this file', 'summarize this document', or inquires about clauses/terms, "
        "directly inspect and summarize the attached document text above, identifying its parties, scope, obligations, "
        "key liabilities, termination terms, and statutory compliance under Indian jurisprudence."
        if has_attached_docs
        else ""
    )

    prompt = f"""Jurisdiction: {jurisdiction}
{f'Case Instructions: {case_instructions}' if case_instructions else ''}

{"Conversation History:" + chr(10) + history_text if history_text else ""}

Retrieved Legal Sources & Attached Workspace Documents:
{context}

User Question: {question}

Instructions:
{attached_doc_instruction}
1. Provide a comprehensive, authoritative legal analysis.
2. Reference specific retrieved sources by their number (e.g., [Source 1]) where relevant.
3. If statutory provisions under Indian law are queried, detail the codified rights, section numbers, statutory remedies, and procedural steps.
"""
    return prompt


def send_message_and_respond(
    db: Session,
    chat: Chat,
    user_content: str,
    document_ids: list[str],
    jurisdiction: str,
) -> tuple[Message, Message]:
    """
    Full chat pipeline:
    1. Save user message
    2. Retrieve relevant sources
    3. Generate grounded response
    4. Verify citations
    5. Save assistant message
    Returns (user_message, assistant_message)
    """
    rag = get_rag_manager()
    llm = get_llm_client()

    # Save user message
    user_msg = Message(
        chat_id=chat.id,
        role="user",
        content=user_content,
    )
    db.add(user_msg)
    db.flush()

    # Get case custom instructions
    case_instructions = None
    if chat.case:
        case_instructions = chat.case.custom_instructions

    # Retrieve passages
    passages: list[RetrievedPassage] = []

    if document_ids:
        # Multi-file chat: restrict to authorized documents
        doc_passages = rag.search_user_document(user_content, document_ids, top_k=6)
        passages.extend(doc_passages)
    else:
        # Legal corpus search
        legal_retriever = rag.get_legal_retriever()
        filters = None
        if jurisdiction and jurisdiction.lower() not in ("india", "configured-default", ""):
            pass  # Legal corpus is India-focused; don't filter further yet
        legal_passages = legal_retriever.search(user_content, top_k=6)
        passages.extend(legal_passages)

    # Get conversation history
    history = get_recent_messages(db, chat.id, limit=8)

    # Build prompt
    prompt = build_chat_prompt(
        question=user_content,
        passages=passages,
        history=history[:-1] if history else [],  # Exclude just-added user message
        case_instructions=case_instructions,
        jurisdiction=jurisdiction,
    )

    # Call LLM
    try:
        answer_text = llm.generate_text(
            system_prompt=LEGAL_SYSTEM_PROMPT,
            user_prompt=prompt,
        )
    except Exception as e:
        logger.error(f"LLM error: {e}")
        answer_text = (
            "I encountered an error generating a response. "
            "Please check the backend configuration (GEMINI_API_KEY) and try again."
        )
        passages = []

    # Build verified citations from actual retrieved passages
    verified_citations = passages_to_citations(passages[:5])

    # Auto-generate chat title from first message
    if chat.title == "New Chat" and user_content:
        chat.title = user_content[:80]

    # Save assistant message
    assistant_msg = Message(
        chat_id=chat.id,
        role="assistant",
        content=answer_text,
        sources=verified_citations,
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(user_msg)
    db.refresh(assistant_msg)

    return user_msg, assistant_msg


def ask_clausecite(
    question: str,
    jurisdiction: str = "India",
    document_ids: list[str] | None = None,
) -> dict:
    """
    Direct Ask ClauseCite pipeline:
    1. Hybrid RAG retrieval from ChromaDB
    2. Prompt construction with grounded sources
    3. Gemini LLM generation via modern google-genai
    4. Citation extraction and verification
    """
    rag = get_rag_manager()
    llm = get_llm_client()

    passages: list[RetrievedPassage] = []
    if document_ids:
        passages = rag.search_user_document(question, document_ids, top_k=6)
    else:
        legal_retriever = rag.get_legal_retriever()
        passages = legal_retriever.search(question, top_k=6)

    prompt = build_chat_prompt(
        question=question,
        passages=passages,
        history=[],
        case_instructions=None,
        jurisdiction=jurisdiction,
    )

    try:
        answer_text = llm.generate_text(
            system_prompt=LEGAL_SYSTEM_PROMPT,
            user_prompt=prompt,
        )
    except Exception as e:
        logger.error(f"LLM call error: {e}")
        answer_text = (
            f"Unable to query Gemini model: {e}. Please ensure your GEMINI_API_KEY is correctly set in backend/.env"
        )

    verified = passages_to_citations(passages[:5])
    primary_tag = (
        passages[0].title
        if (passages and passages[0].title and not passages[0].title.startswith("Section "))
        else (passages[0].citation if (passages and passages[0].citation) else f"{jurisdiction} Statutory Law")
    )
    citations_list = [c["citation"] for c in verified if c.get("citation")]
    if not citations_list and passages:
        citations_list = [f"{p.title} (Page {p.page})" if p.page else p.title for p in passages if p.title]

    return {
        "answer": answer_text,
        "tag": primary_tag,
        "citations": citations_list or [primary_tag],
        "raw_sources": verified,
        "follow_ups": [
            "What are the statutory remedies and penalties?",
            "Explain procedural filing requirements",
            "Draft a formal legal notice based on this",
        ],
    }

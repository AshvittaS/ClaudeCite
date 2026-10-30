"""
Citation verifier — validates LLM-generated citations against actual retrieved passages.
Rejects any citation not backed by a real retrieved source record.
"""
from __future__ import annotations

import logging
from app.ai.rag_adapter import RetrievedPassage

logger = logging.getLogger(__name__)


def verify_citations(
    llm_citations: list[dict],
    retrieved_passages: list[RetrievedPassage],
) -> list[dict]:
    """
    Filter citations to only those that map to an actual retrieved passage.
    A citation is valid if its source_id matches a retrieved passage source_id,
    or if the cited text excerpt is contained in a retrieved passage.
    Returns a list of verified citation dicts.
    """
    verified = []
    passage_map = {p.source_id: p for p in retrieved_passages}
    passage_texts = [p.text.lower() for p in retrieved_passages]

    for c in llm_citations:
        source_id = c.get("source_id", "")
        excerpt = c.get("excerpt", "").lower()

        # Check by source ID
        if source_id in passage_map:
            p = passage_map[source_id]
            c["verification_status"] = "verified"
            c["excerpt"] = p.text[:600]  # Use actual retrieved text
            c["title"] = p.title
            c["citation"] = p.citation or p.title
            c["section"] = p.section
            c["effective_date"] = p.effective_date
            c["source_url"] = p.source_url
            verified.append(c)
            continue

        # Check by excerpt substring match
        if excerpt and len(excerpt) > 20:
            for i, pt in enumerate(passage_texts):
                if excerpt[:50] in pt:
                    p = retrieved_passages[i]
                    c["verification_status"] = "verified"
                    c["source_id"] = p.source_id
                    c["excerpt"] = p.text[:600]
                    c["title"] = p.title
                    c["citation"] = p.citation or p.title
                    c["section"] = p.section
                    c["effective_date"] = p.effective_date
                    c["source_url"] = p.source_url
                    verified.append(c)
                    break
            else:
                logger.warning(f"Citation '{source_id}' could not be verified — dropping.")

    return verified


def passages_to_citations(passages: list[RetrievedPassage]) -> list[dict]:
    """Convert retrieved passages directly to verified citation dicts (no LLM needed)."""
    return [
        {
            "source_id": p.source_id,
            "title": p.title,
            "citation": p.citation or p.title,
            "section": p.section,
            "excerpt": p.text[:600],
            "effective_date": p.effective_date,
            "source_url": p.source_url,
            "verification_status": "verified",
        }
        for p in passages
    ]

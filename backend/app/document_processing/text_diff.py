"""
Deterministic text diff engine for contract comparison.
Uses difflib for word-level diffs without involving the LLM.
"""
from __future__ import annotations

import difflib
import re
from typing import Literal


DiffType = Literal["equal", "insert", "delete", "replace"]


def word_diff(original: str, revised: str) -> list[dict]:
    """
    Compute word-level diff between two texts.
    Returns a list of ops: {type, text}
    """
    orig_words = original.split()
    rev_words = revised.split()

    matcher = difflib.SequenceMatcher(None, orig_words, rev_words, autojunk=False)
    ops = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            ops.append({"type": "equal", "text": " ".join(orig_words[i1:i2])})
        elif tag == "insert":
            ops.append({"type": "insert", "text": " ".join(rev_words[j1:j2])})
        elif tag == "delete":
            ops.append({"type": "delete", "text": " ".join(orig_words[i1:i2])})
        elif tag == "replace":
            ops.append({"type": "delete", "text": " ".join(orig_words[i1:i2])})
            ops.append({"type": "insert", "text": " ".join(rev_words[j1:j2])})

    return ops


def segment_clauses(text: str) -> list[dict]:
    """
    Segment a contract into clauses by numbered/lettered headings.
    Returns list of {id, heading, text} dicts.
    """
    # Match numbered sections like "1.", "1.1", "Section 1", "ARTICLE I", etc.
    pattern = re.compile(
        r'(?m)^(?:'
        r'(?:Section|SECTION|Article|ARTICLE|Clause|CLAUSE)\s+[\w.]+|'
        r'\d+(?:\.\d+)*\.?\s+'
        r')[A-Z].*$'
    )

    segments = []
    matches = list(pattern.finditer(text))

    if not matches:
        # Fallback: treat whole text as one clause
        return [{"id": "full_document", "heading": "Full Document", "text": text.strip()}]

    for i, m in enumerate(matches):
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        heading = m.group().strip()
        clause_text = text[start:end].strip()
        clause_id = re.sub(r"[^a-z0-9_]", "_", heading.lower())[:50]
        segments.append({"id": clause_id, "heading": heading, "text": clause_text})

    return segments


def compare_documents(
    original_text: str,
    revised_text: str,
) -> list[dict]:
    """
    Compare two contracts at the clause level.
    Returns a list of clause diff results with deterministic diff ops.
    """
    orig_clauses = segment_clauses(original_text)
    rev_clauses = segment_clauses(revised_text)

    # Match clauses by heading similarity
    orig_headings = [c["heading"].lower() for c in orig_clauses]
    rev_headings = [c["heading"].lower() for c in rev_clauses]

    results = []
    used_rev = set()

    for oc in orig_clauses:
        best_match = None
        best_ratio = 0.0
        for i, rc in enumerate(rev_clauses):
            if i in used_rev:
                continue
            ratio = difflib.SequenceMatcher(None, oc["heading"].lower(), rc["heading"].lower()).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = (i, rc)

        if best_match and best_ratio > 0.5:
            idx, rc = best_match
            used_rev.add(idx)
            diff_ops = word_diff(oc["text"], rc["text"])
            has_changes = any(op["type"] != "equal" for op in diff_ops)
            change_type = "modified" if has_changes else "unchanged"

            results.append({
                "clause_id": oc["id"],
                "heading": oc["heading"],
                "change_type": change_type,
                "original_text": oc["text"],
                "revised_text": rc["text"],
                "diff": diff_ops,
                "original_location": {"section": oc["heading"]},
                "revised_location": {"section": rc["heading"]},
            })
        else:
            results.append({
                "clause_id": oc["id"],
                "heading": oc["heading"],
                "change_type": "deleted",
                "original_text": oc["text"],
                "revised_text": "",
                "diff": [{"type": "delete", "text": oc["text"]}],
                "original_location": {"section": oc["heading"]},
                "revised_location": {},
            })

    # Added clauses
    for i, rc in enumerate(rev_clauses):
        if i not in used_rev:
            results.append({
                "clause_id": rc["id"],
                "heading": rc["heading"],
                "change_type": "added",
                "original_text": "",
                "revised_text": rc["text"],
                "diff": [{"type": "insert", "text": rc["text"]}],
                "original_location": {},
                "revised_location": {"section": rc["heading"]},
            })

    return results

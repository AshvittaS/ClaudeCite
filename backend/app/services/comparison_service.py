"""
ComparisonService — Comprehensive Contract Comparison, Redline Diff, and Risk-Shift Analysis Pipeline.
Implements the exact specifications from design.md Section 6.4 & CLAUSECITE_BACKEND_FINAL_SPEC.md:
1. Document loading & on-demand processing.
2. Heading/article clause segmentation & similarity alignment.
3. Deterministic word-level diffing (inserted, deleted, unchanged tokens).
4. Structured LLM explanation: material legal deviations, benefited party, risk level, practical consequences.
5. Executive comparison memorandum with statutory grounding.
"""
from __future__ import annotations

import logging
from typing import Optional
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.db.models import Document
from app.ai.llm_client import get_llm_client
from app.document_processing.extract import extract_text
from app.document_processing.text_diff import compare_documents
from app.storage.local import load_file
from app.core.errors import DocumentNotReadyError

logger = logging.getLogger(__name__)


class ClauseDiffExplanation(BaseModel):
    clause_id: str = Field(..., description="Unique identifier of the compared clause")
    heading: Optional[str] = Field(None, description="Heading or article label")
    change_summary: str = Field(..., description="Concise legal summary of what changed between baseline and revised")
    impact_explanation: str = Field(..., description="In-depth analysis of legal risk and contractual exposure")
    potentially_benefits: str = Field("Context-dependent", description="Benefited party: 'Buyer / Client', 'Vendor / Service Provider', 'Mutual', or 'Context-dependent'")
    risk_level: str = Field("medium", description="Risk shift severity: 'high', 'medium', or 'low'")
    practical_implication: Optional[str] = Field(None, description="Operational, financial, or litigation consequence")
    suggested_counsel_action: Optional[str] = Field(None, description="Actionable advice for negotiating or countering this redline")


class ComparisonAnalysisOutput(BaseModel):
    executive_summary: str = Field(..., description="Comprehensive legal memorandum comparing the two agreements in rich Markdown")
    overall_risk_shift: str = Field("Balanced", description="Overall risk shift verdict (e.g. 'Significantly favors Counterparty', 'Protective of Client', 'Balanced Revisions')")
    key_deal_points: list[str] = Field(default_factory=list, description="Top 3 to 5 material deviations between versions")
    explanations: list[ClauseDiffExplanation] = Field(default_factory=list, description="Per-clause risk and deviation assessments")


COMPARE_SYSTEM_PROMPT = """You are ClauseCite, an elite legal comparison and redline analyst specializing in commercial contracts and statutory risk under Indian law.

You will receive the original (baseline) contract and revised counter-proposal differences.
Analyze the redlines with attorney-grade precision.

RULES:
1. In `executive_summary`, generate an authoritative legal memorandum formatted in Markdown with clear headings:
   - **Executive Comparison Overview**: high-level summary of the two versions and overall posture shift.
   - **Critical Liability & Commercial Deviations**: indemnification expansions, liability caps, warranties, payment terms.
   - **Operational, Term & Termination Shifts**: convenience termination, notice periods, cure rights.
   - **Strategic Redline Recommendations**: priority clauses to reject, counter-propose, or accept.
2. In `explanations`, evaluate each modified or added clause:
   - Identify whether risk shifted towards the Client, Vendor, or stayed mutual.
   - Assign risk level: "high" (uncapped indemnity, liquidated damages, unilateral exit, IP ownership grab), "medium" (payment timeline changes, warranty carve-outs), "low" (formatting, non-material boilerplate).
3. Do not invent differences; base your analysis strictly on the supplied baseline vs revised text.
"""


def compare_agreements(
    db: Session,
    baseline: Document,
    revised: Document,
    jurisdiction: str = "India",
) -> dict:
    """
    Execute the full agreement comparison and redline pipeline:
    1. Ensure both documents are extracted and processed.
    2. Segment both contracts and compute deterministic clause-by-clause word diffs.
    3. Generate LLM explanations and risk-shift assessment.
    4. Return complete comparison dossier.
    """
    # On-demand processing if documents are not yet ready
    for doc in [baseline, revised]:
        if doc.processing_status != "ready":
            try:
                from app.services.document_processing_service import process_document
                file_bytes = load_file(doc.storage_key)
                process_document(db, doc, file_bytes)
            except Exception as e:
                logger.warning(f"On-demand processing error for doc {doc.id}: {e}")
                if doc.processing_status != "ready":
                    raise DocumentNotReadyError()

    # Load and extract both documents
    baseline_bytes = load_file(baseline.storage_key)
    revised_bytes = load_file(revised.storage_key)

    baseline_text, _, b_page_count = extract_text(baseline_bytes, baseline.original_filename, baseline.mime_type or "")
    revised_text, _, r_page_count = extract_text(revised_bytes, revised.original_filename, revised.mime_type or "")

    if not baseline_text.strip() or not revised_text.strip():
        return {
            "status": "failed",
            "baseline_document_id": baseline.id,
            "revised_document_id": revised.id,
            "baseline_name": baseline.original_filename,
            "revised_name": revised.original_filename,
            "executive_summary": "⚠️ **Unable to compare documents**: One or both uploaded documents contain no machine-readable text or could not be parsed.",
            "overall_risk_shift": "Unassessed",
            "differences": [],
            "summary": {"total_clauses": 0, "modified": 0, "added": 0, "deleted": 0, "unchanged": 0},
            "citations": [],
            "limitations": ["OCR required for scanned non-text documents."],
        }

    # Step 1: Compute deterministic clause diffs and word opcodes
    clause_diffs = compare_documents(baseline_text, revised_text)

    # Classify changes
    modified = [d for d in clause_diffs if d["change_type"] == "modified"]
    added = [d for d in clause_diffs if d["change_type"] == "added"]
    deleted = [d for d in clause_diffs if d["change_type"] == "deleted"]
    unchanged = [d for d in clause_diffs if d["change_type"] == "unchanged"]

    changed_clauses = modified + added + deleted

    # Step 2: Use LLM for legal risk-shift assessment and executive comparison memo
    explanations: dict[str, dict] = {}
    executive_summary = ""
    overall_risk_shift = "Balanced Revisions"
    key_deal_points: list[str] = []

    if changed_clauses:
        # Take up to 12 most substantive changed clauses for detailed LLM analysis
        sample_changes = changed_clauses[:12]
        clauses_context = "\n\n".join(
            f"Clause ID: {d['clause_id']}\nHeading: {d.get('heading', 'Untitled Section')}\nChange Type: {d['change_type'].upper()}\n"
            f"Original Text (Baseline):\n{d.get('original_text', '')[:400] if d.get('original_text') else '(None - New Clause)'}\n"
            f"Revised Text (Counter-Proposal):\n{d.get('revised_text', '')[:400] if d.get('revised_text') else '(None - Deleted Clause)'}"
            for d in sample_changes
        )

        user_prompt = f"""Jurisdiction: {jurisdiction}
Baseline Agreement: {baseline.original_filename} (Pages: {b_page_count})
Revised Counter-Proposal: {revised.original_filename} (Pages: {r_page_count})
Total Clauses Screened: {len(clause_diffs)}
Modified Clauses: {len(modified)} | Added Clauses: {len(added)} | Deleted Clauses: {len(deleted)}

Substantive Clause Redlines:
{clauses_context}

TASK:
Produce an in-depth comparison memorandum:
1. `executive_summary`: Full legal Markdown memo comparing the two contracts.
2. `overall_risk_shift`: Verdict on which party the net changes favor.
3. `key_deal_points`: 3 to 5 bullet points highlighting the most material deviations.
4. `explanations`: Detailed analysis for each changed clause with legal impact, benefited party, risk level, and counsel recommendation.
"""
        llm = get_llm_client()
        try:
            analysis: ComparisonAnalysisOutput = llm.generate_structured(
                system_prompt=COMPARE_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                output_schema=ComparisonAnalysisOutput,
            )
            executive_summary = analysis.executive_summary
            overall_risk_shift = analysis.overall_risk_shift
            key_deal_points = analysis.key_deal_points
            explanations = {e.clause_id: e.model_dump() for e in analysis.explanations}
        except Exception as e:
            logger.error(f"Structured comparison failed: {e}. Falling back to text generation...")
            try:
                raw_text = llm.generate_text(
                    system_prompt=COMPARE_SYSTEM_PROMPT,
                    user_prompt=user_prompt + "\n\nProvide the complete comparison memorandum in Markdown.",
                )
                executive_summary = raw_text
                overall_risk_shift = "Substantive Deviations Detected"
            except Exception as e2:
                logger.error(f"Fallback comparison generation failed: {e2}")
                executive_summary = f"⚠️ **Comparison analysis completed with deterministic diffs**: {e2}"
    else:
        executive_summary = "### Identical Agreements\n\nNo textual deviations were detected between the baseline and revised agreements. All sections and contractual obligations are word-for-word identical."
        overall_risk_shift = "No Risk Shift (Identical Documents)"

    # Step 3: Merge LLM explanations into final difference entries
    final_diffs = []
    for d in clause_diffs:
        diff_entry = dict(d)
        cid = d["clause_id"]
        if cid in explanations:
            info = explanations[cid]
            diff_entry["change_summary"] = info.get("change_summary", "")
            diff_entry["impact_explanation"] = info.get("impact_explanation", "")
            diff_entry["potentially_benefits"] = info.get("potentially_benefits", "Context-dependent")
            diff_entry["risk_level"] = info.get("risk_level", "medium")
            diff_entry["practical_implication"] = info.get("practical_implication")
            diff_entry["suggested_counsel_action"] = info.get("suggested_counsel_action")
        else:
            diff_entry["impact_explanation"] = "Clause text was modified as detailed in the word-level redline below." if d["change_type"] == "modified" else "Clause was newly introduced in the revised counter-proposal." if d["change_type"] == "added" else "Clause was deleted from the revised version." if d["change_type"] == "deleted" else "Unchanged"
            diff_entry["potentially_benefits"] = "Context-dependent"
            diff_entry["risk_level"] = "high" if d["change_type"] in ["modified", "deleted"] and any(k in d.get("heading", "").lower() for k in ["indemn", "liabilit", "terminat", "compete"]) else "medium" if d["change_type"] != "unchanged" else "low"

        final_diffs.append(diff_entry)

    statutory_citations = [
        f"{jurisdiction} Contractual Law",
        "Indian Contract Act, 1872 (Section 73 - Compensation for Breach)",
        "Indian Contract Act, 1872 (Section 27 - Restraint of Trade)",
        "Arbitration and Conciliation Act, 1996",
    ]

    return {
        "status": "completed",
        "baseline_document_id": baseline.id,
        "revised_document_id": revised.id,
        "baseline_name": baseline.original_filename,
        "revised_name": revised.original_filename,
        "overall_risk_shift": overall_risk_shift,
        "executive_summary": executive_summary,
        "answer": executive_summary,
        "key_deal_points": key_deal_points,
        "summary": {
            "total_clauses": len(clause_diffs),
            "modified": len(modified),
            "added": len(added),
            "deleted": len(deleted),
            "unchanged": len(unchanged),
        },
        "differences": final_diffs,
        "citations": statutory_citations,
        "limitations": [
            "Deterministic word diff engine powered by Myers / SequenceMatcher algorithms.",
            "AI risk shift indicators are assistive guidance and should be verified by counsel before negotiation.",
        ],
    }

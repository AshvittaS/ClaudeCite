# ClauseCite — Tamil Nadu NDA Template Library

Version: 1.0.0  
Generated: 30 October 2026  
Default jurisdiction: India — Tamil Nadu

## Package contents
- `docx/` — 10 separate editable Word NDA templates.
- `json/` — 10 matching structured JSON clause templates.
- `manifest.json` — master catalogue mapping template IDs to DOCX and JSON files.
- `schemas/nda-template.schema.json` — JSON Schema (Draft 2020-12) for template validation.
- `docs/INDIA_TAMIL_NADU_LEGAL_NOTES.md` — legal implementation and advocate-review notes.

## Included agreements
1. Unilateral NDA
2. Mutual NDA
3. Employee NDA
4. Consultant NDA
5. Vendor NDA
6. Customer NDA
7. Investor NDA
8. M&A Due Diligence NDA
9. Data Sharing NDA
10. IP / Technology NDA

## Dynamic drafting design
Each JSON file includes:
- Stable template and clause identifiers.
- Party roles and a default Purpose.
- Required and optional user-input fields.
- Modular common clauses and template-specific clauses.
- Four reusable schedules.
- Signature-block field definitions.
- Advocate-review flags and generation rules.

The placeholder syntax uses `{{field_key}}`. Resolve values with a strict allow-list and escape user input before inserting it into DOCX or other output formats. Do not evaluate arbitrary expressions or code from user-provided fields.

## Suggested ClauseCite workflow
1. User selects an NDA type and enters party details, Purpose, disclosure scope, term and dispute preferences.
2. Backend loads the matching JSON template and validates inputs against the schema.
3. Clause selection logic enables required clauses and user-selected optional clauses.
4. RAG retrieves current Indian central and Tamil Nadu legal materials relevant to the facts; retrieval must not silently rewrite the agreed commercial terms.
5. Draft is rendered to DOCX with clause IDs and version metadata.
6. High-risk flags route the document for Indian advocate review.
7. Store the rendered version, user inputs, template version, legal-source versions and review outcome in the audit trail.

## Legal and product limitations
- These are structured drafting templates, not legal opinions or execution-ready instruments.
- Every template requires review by an Indian advocate before use. Clauses marked `advocate_review_required: true` are high-attention review points.
- No stamp-duty rates are hardcoded. Confirm instrument classification and current Tamil Nadu duty at execution using current official materials or adjudication where appropriate.
- NDA wording does not replace a data-processing agreement, IP assignment, employment agreement, services agreement, investment agreement or definitive M&A agreement.
- Do not automatically activate optional non-compete, no-solicit, no-hire, standstill, exclusivity, penalty, indemnity or liability-cap clauses.
- A confidentiality agreement does not itself grant an injunction, establish a privacy-law basis, transfer IP ownership or guarantee enforceability.

## Validation
Use a JSON Schema Draft 2020-12 validator against each file in `json/` with `schemas/nda-template.schema.json`. The manifest paths are relative to this package root.

## File naming
`TN-NDA-###_<slug>.docx` and `TN-NDA-###_<slug>.json`

## Version control
Increment the library version when clause text, fields, schedules, review flags or legal-source mappings materially change. Preserve prior versions for audit and generated-document reproducibility.

# ClauseCite structured financial templates

Generated from `ClauseCite_Financial_Agreement_Template_Library.docx`.

## Contents
- `manifest.json`: index of all 12 templates.
- `fin_*.json`: one JSON file per template.

## Data model
Each template includes metadata, extracted placeholder inputs, ordered document structure, statutory verification prompts, and generation safeguards. `required` is deliberately `null` pending a reviewed field schema; the source does not reliably distinguish mandatory from optional fields in every context.

## Important implementation notes
1. Preserve `document_structure` order when rendering.
2. The extracted source includes tables as table nodes and clause/schedule headings as section nodes.
3. `inputs[].source_placeholder` preserves the original token. Normalize keys only for API use.
4. Do not render `statutory_verification` as operative contract language.
5. Resolve square-bracket instructions and all placeholders before finalization.
6. Require governing law/forum selection and jurisdiction-specific legal retrieval before producing a final draft.
7. Validate these JSON files against a formal JSON Schema and review DOCX extraction fidelity before production.

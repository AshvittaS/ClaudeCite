# ClauseCite Power of Attorney Generator Template Library

**Version:** 1.0.0  
**Default jurisdiction:** India — Tamil Nadu  
**Purpose:** Modular drafting and automation starting points for advocate-reviewed POA/authorisation documents.

## Contents
- `docx/` — 10 editable Word forms.
- `json/` — matching structured JSON clause templates and generation rules.
- `schemas/poa-template-input.schema.json` — reusable JSON Schema (Draft 2020-12).
- `manifest.json` — template index and metadata.
- `reference/legal_review_checklist.md` — legal/operational review checklist.

## Important
IMPORTANT LEGAL REVIEW NOTICE: This is a drafting and automation template, not legal advice and not a guarantee of validity, enforceability, acceptance, or registration. Indian law, Tamil Nadu stamp duty, registration practice, the nature of the transaction, the principal's capacity, and the receiving institution's rules may affect execution. Before signing or use, obtain review by an Indian advocate and confirm current requirements with the relevant Sub-Registrar, department, bank, tax authority, hospital, insurer, transport authority, or other recipient. Do not rely on a POA to transfer title to immovable property; a sale/conveyance instrument and registration may be required.

## Use in an automated generation pipeline
1. Select a `template_id` from `manifest.json`.
2. Collect the principal, agent, jurisdiction, authority, duration, conditions, schedules and execution inputs defined in the shared schema.
3. Validate structure against `schemas/poa-template-input.schema.json`, then apply template-specific validation rules.
4. For sensitive powers (immovable property sale, mortgage, borrowing, financial transfers, incapacity/continuity, healthcare/end-of-life, disposition of remains, revocation of a registered instrument), pause generation for an Indian advocate review.
5. Verify current Tamil Nadu stamp duty/adjudication, registration/authentication, witness, identity, translation and recipient-specific requirements using official sources and the relevant authority.
6. Generate a draft with unresolved items clearly marked. Do not present it as valid or execution-ready until reviewed.

## Design conventions
- Template JSON includes a common clause library, template-specific powers/limits/schedules, required fields, execution checks and generation rules.
- High-risk powers must be affirmatively selected. Avoid implied authority.
- Use least-privilege grants, transaction caps, expiry rules, records/accounting, conflict disclosures and express exclusions.
- Do not store full identity-document numbers unless necessary. Prefer masked references and appropriate access controls.
- The schema validates data shape, not legal sufficiency, principal capacity, stamping, registration or third-party acceptance.

## India-specific distinctions
- A general or special POA is an agency instrument; it is not itself a conveyance of immovable property.
- “Durable” financial POAs and springing authority concepts commonly associated with US law should not be assumed to operate identically in India. Continuity/incapacity clauses require tailored legal review and institution acceptance.
- An Indian tax representation instrument is not an IRS Form 2848; statutory eligibility and Income Tax Department portal/forms govern.
- A healthcare information authorisation is not a US HIPAA release. Indian consent, privacy, medical ethics, capacity and advance-directive rules must be assessed independently.
- A nomination concerning disposition of remains should be treated as a statement of wishes/appointment subject to local law, public-health and police requirements, facility rules, and potential family disputes—not as an assumed US-style statutory right.

## Versioning
Increment the version when fields, clause logic, legal review notes or schema constraints change. Record a change log and date. Obtain periodic review by Indian counsel, particularly after statutory, court, rule, stamp schedule or portal changes.

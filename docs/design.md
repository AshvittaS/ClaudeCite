# ClauseCite Legal AI Suite --- Backend Integration Design

**Document type:** Backend architecture and implementation
specification\
**Audience:** Antigravity coding agent / developers\
**Frontend:** Existing React + Vite UI\
**Backend:** Python + FastAPI\
**Relational database:** PostgreSQL\
**Vector retrieval:** Existing ChromaDB hybrid RAG\
**Embedding model:** `all-MiniLM-L6-v2`\
**LLM:** Hosted LLM API, provider selected through configuration\
**Status:** Implementation blueprint; adapt to the existing repository
before changing working code.

------------------------------------------------------------------------

## 1. Purpose and implementation rules

Implement the backend that powers the existing ClauseCite Legal AI Suite
UI. The UI is already designed; do not redesign it or replace its visual
components. Connect its screens, controls, modals, file selectors, case
lists, and chat interactions to real APIs.

Required modules:

1.  Ask ClauseCite --- legal chat with grounded citations.
2.  Workspace Files --- upload, search, select, preview, remove, and
    chat across documents.
3.  Agreement Summary --- clause extraction, risk review, suggested
    revisions, and source grounding.
4.  Compare Agreements --- deterministic text diff, clause matching,
    redlines, and risk-shift analysis.
5.  Create Agreement --- guided questionnaire, versioned templates,
    clause assembly, preview, and export.
6.  Cases --- matter dossier, linked chats/files, and custom
    instructions.
7.  Global search, recent chats, prompt library, attachment picker,
    export memorandum, feedback, and settings.
8.  Authentication, authorization, job status, audit logging, and safe
    file lifecycle.

### Non-negotiable engineering rules

-   Inspect the current repository first. Identify the existing FastAPI
    entrypoint, SQLAlchemy models, ChromaDB initialization, embedding
    manager, hybrid retriever, prompt code, and file storage. Reuse
    these where possible.
-   Do not duplicate or rebuild the current `all-MiniLM-L6-v2` embedding
    pipeline. Wrap it behind an adapter.
-   PostgreSQL is the source of truth for application records,
    ownership, relationships, statuses, and settings.
-   ChromaDB is a retrieval index, not the authority for authorization.
    Enforce permissions in the backend before retrieval or file access.
-   The legal corpus and private user-uploaded documents must have
    distinct namespaces/collections or reliably enforced metadata
    scopes.
-   All LLM output is untrusted. Validate structured output and verify
    citations against retrieved source records.
-   Never invent statutes, quotations, case law, effective dates, or
    Bluebook citations. If verification is unavailable, label the result
    as unverified or omit it.
-   Do not claim that a contract is legally valid or that an AI risk
    score is a definitive legal conclusion.
-   Never expose provider API keys, internal prompts, private file
    paths, or another user's records to the browser.
-   Use database migrations; do not use `create_all()` as a production
    schema migration strategy.
-   Do not leave stub functions in a feature marked complete. Tests must
    cover each implemented endpoint and its permission checks.

------------------------------------------------------------------------

## 2. Target architecture

``` text
Existing React + Vite UI
        |
        | HTTPS JSON / multipart uploads / optional SSE
        v
FastAPI API layer (/api/v1)
  - authentication and current-user dependency
  - request/response schemas
  - validation, rate limits, authorization
        |
        v
Application services
  - ChatService
  - CaseService
  - WorkspaceService
  - DocumentProcessingService
  - SummaryService
  - ComparisonService
  - AgreementGenerationService
  - SearchService
  - ExportService
        |
        +-------------------+--------------------+------------------+
        |                   |                    |                  |
        v                   v                    v                  v
   PostgreSQL          ChromaDB + RAG       Private file store   Hosted LLM
   app records         existing embeddings  original/exported    provider adapter
                                             documents
        |
        v
Background worker + job queue (recommended for OCR, indexing,
large summaries/comparisons, exports; optional for first prototype)
```

Use a **modular monolith** initially: one FastAPI application with clear
service boundaries. Do not introduce microservices unless operational
scale later requires them.

### Recommended technologies

-   FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic
-   PostgreSQL with UUID primary keys and JSONB where appropriate
-   Existing ChromaDB client and current hybrid retrieval implementation
-   Existing Sentence Transformers model `all-MiniLM-L6-v2`
-   Provider-specific hosted LLM SDK wrapped behind `LLMClient`
-   PyMuPDF for text-based PDF extraction; `python-docx` for DOCX
-   `openpyxl` for XLSX extraction; text decoding for TXT
-   Tesseract or another approved OCR engine for scanned documents, if
    required
-   Private local storage for development; private object storage in
    production
-   Optional Celery/RQ plus Redis for asynchronous jobs
-   pytest, FastAPI TestClient/httpx, test PostgreSQL database

------------------------------------------------------------------------

## 3. Suggested backend layout

Adapt names to the existing repository rather than moving files
unnecessarily.

``` text
backend/
  app/
    main.py
    core/
      config.py
      security.py
      logging.py
      errors.py
    db/
      session.py
      base.py
      models/
        user.py
        workspace.py
        membership.py
        case.py
        chat.py
        message.py
        document.py
        document_case_link.py
        processing_job.py
        template.py
        generated_document.py
        feedback.py
        audit_event.py
        user_settings.py
    schemas/
      common.py
      cases.py
      chats.py
      documents.py
      summary.py
      comparison.py
      agreements.py
      prompts.py
      settings.py
      search.py
    api/
      dependencies.py
      v1/
        router.py
        auth.py
        workspaces.py
        cases.py
        chats.py
        documents.py
        summary.py
        comparison.py
        agreement_generation.py
        templates.py
        prompts.py
        search.py
        exports.py
        settings.py
        feedback.py
        jobs.py
    repositories/
      cases.py
      chats.py
      documents.py
      templates.py
    services/
      case_service.py
      chat_service.py
      workspace_service.py
      document_processing_service.py
      summary_service.py
      comparison_service.py
      agreement_service.py
      search_service.py
      export_service.py
      prompt_service.py
    ai/
      llm_client.py
      rag_adapter.py
      prompts.py
      output_schemas.py
      citation_verifier.py
    document_processing/
      extract.py
      ocr.py
      chunk.py
      clause_segmenter.py
      text_diff.py
      render_docx.py
      render_pdf.py
    storage/
      base.py
      local.py
      object_storage.py
    workers/
      tasks.py
  templates/
    nda/
    rental/
    employment/
  tests/
    api/
    services/
    security/
    fixtures/
  alembic/
  requirements.txt
  .env.example
```

------------------------------------------------------------------------

## 4. Data model

Use UUID primary keys. Add `created_at` and `updated_at` where relevant.
Add indexes for owner, workspace, case, creation date, and status
fields. Use Alembic migrations and foreign keys.

### Core entities

  -------------------------------------------------------------------------
  Table                   Important fields          Purpose
  ----------------------- ------------------------- -----------------------
  `users`                 `id`, `email`,            User identity
                          `password_hash` or        
                          external identity ID,     
                          `display_name`,           
                          `created_at`              

  `workspaces`            `id`, `name`,             Private or organization
                          `owner_user_id`,          workspace
                          `workspace_type`,         
                          `created_at`              

  `workspace_members`     `workspace_id`,           Workspace membership
                          `user_id`, `role`         and access control

  `user_settings`         `user_id`,                Preferences
                          `default_jurisdiction`,   
                          `citation_style`,         
                          `citation_strictness`,    
                          `export_defaults`,        
                          `model_preferences` JSONB 

  `cases`                 `id`, `workspace_id`,     Matter dossier
                          `created_by`, `title`,    
                          `practice_area`,          
                          `status`,                 
                          `custom_instructions`,    
                          `created_at`,             
                          `updated_at`              

  `chats`                 `id`, `workspace_id`,     Conversation thread
                          `owner_user_id`,          
                          `case_id` nullable,       
                          `title`, `is_pinned`,     
                          `created_at`,             
                          `updated_at`              

  `messages`              `id`, `chat_id`, `role`,  Chat history and
                          `content`, `sources`      verified source
                          JSONB, `metadata` JSONB,  references
                          `created_at`              

  `documents`             `id`, `workspace_id`,     Uploaded document
                          `owner_user_id`,          metadata
                          `original_filename`,      
                          `storage_key`,            
                          `mime_type`,              
                          `size_bytes`, `sha256`,   
                          `processing_status`,      
                          `extraction_metadata`     
                          JSONB, `created_at`       

  `case_documents`        `case_id`, `document_id`, Many-to-many
                          `added_by`, `created_at`  case/document
                                                    association

  `document_chunks`       `id`, `document_id`,      Mapping from source
                          `chunk_index`,            document to indexed
                          `page_number`,            chunks; full text may
                          `section_label`,          remain in ChromaDB
                          `content_hash`,           
                          `chroma_record_id`        

  `processing_jobs`       `id`, `workspace_id`,     Track long-running
                          `owner_user_id`,          processing
                          `job_type`, `status`,     
                          `progress`, `error_code`, 
                          `error_message`, `result` 
                          JSONB, timestamps         

  `templates`             `id`, `name`,             Versioned agreement
                          `document_type`,          templates
                          `jurisdiction`,           
                          `version`, `schema`       
                          JSONB, `clause_rules`     
                          JSONB, `is_active`        

  `generated_documents`   `id`, `workspace_id`,     Generated drafts and
                          `owner_user_id`,          exports
                          `case_id`, `template_id`, 
                          `template_version`,       
                          `input_data` JSONB,       
                          `storage_key`, `status`,  
                          timestamps                

  `prompt_templates`      `id`, `name`, `category`, Prompt library
                          `description`,            
                          `prompt_body`,            
                          `jurisdiction`,           
                          `is_active`               

  `feedback`              `id`, `user_id`,          Product feedback
                          `workspace_id`,           
                          `category`, `message`,    
                          `created_at`              

  `audit_events`          `id`, `user_id`,          Security and action
                          `workspace_id`, `action`, audit trail
                          `resource_type`,          
                          `resource_id`, `metadata` 
                          JSONB, `created_at`       
  -------------------------------------------------------------------------

### Data-model rules

-   A chat may belong to a case or be workspace-level with
    `case_id = NULL`.
-   Documents can be in the workspace and linked to multiple cases
    through `case_documents`.
-   Each document has one owner/workspace and one canonical stored
    original. Case links do not duplicate the file.
-   Store generated documents as separate versioned records; do not
    overwrite the original uploaded document.
-   `messages.sources` stores source IDs and metadata, not merely
    free-form citations supplied by the LLM.
-   Use `workspace_members` to authorize shared workspaces. Do not
    assume every user can access every record in a workspace.
-   Avoid storing full sensitive document text redundantly in PostgreSQL
    unless required by the existing design.
-   Add soft deletion or explicit deletion workflows where retention
    requirements apply.

------------------------------------------------------------------------

## 5. API conventions and contracts

Prefix routes with `/api/v1`. Use Pydantic request/response schemas,
UUID identifiers, ISO-8601 timestamps, pagination, consistent errors,
and a current-user dependency.

### Standard response/error behavior

-   `200 OK`: successful read or synchronous operation
-   `201 Created`: record created
-   `202 Accepted`: asynchronous job accepted
-   `400 Bad Request`: invalid workflow input
-   `401 Unauthorized`: missing/invalid authentication
-   `403 Forbidden` or `404 Not Found`: inaccessible resource; avoid
    leaking whether private records exist
-   `413 Payload Too Large`: upload exceeds configured size
-   `415 Unsupported Media Type`: unsupported/invalid file
-   `422 Unprocessable Entity`: schema validation failure
-   `429 Too Many Requests`: rate limit
-   `502/503`: provider or dependency unavailable

Example error:

``` json
{
  "detail": {
    "code": "DOCUMENT_NOT_READY",
    "message": "The document has not finished processing."
  }
}
```

For list APIs, support `limit`, `cursor` or `offset`, and `q` search
where appropriate. Define a consistent pagination format before frontend
integration.

### Endpoint inventory

#### Workspaces and settings

  ----------------------------------------------------------------------------------
  Method                  Endpoint                    Purpose
  ----------------------- --------------------------- ------------------------------
  `GET`                   `/api/v1/workspaces`        List workspaces current user
                                                      can access

  `POST`                  `/api/v1/workspaces`        Create workspace

  `GET`                   `/api/v1/workspaces/{id}`   Workspace details

  `PATCH`                 `/api/v1/workspaces/{id}`   Update workspace settings

  `GET`                   `/api/v1/settings`          Read user preferences

  `PATCH`                 `/api/v1/settings`          Update
                                                      jurisdiction/citation/export
                                                      preferences
  ----------------------------------------------------------------------------------

#### Cases

  ---------------------------------------------------------------------------------------------------
  Method                  Endpoint                                            Purpose
  ----------------------- --------------------------------------------------- -----------------------
  `POST`                  `/api/v1/cases`                                     Create case

  `GET`                   `/api/v1/cases`                                     List accessible cases
                                                                              and counts

  `GET`                   `/api/v1/cases/{case_id}`                           Case overview

  `PATCH`                 `/api/v1/cases/{case_id}`                           Update title, practice
                                                                              area, status, custom
                                                                              instructions

  `DELETE`                `/api/v1/cases/{case_id}`                           Archive/delete with
                                                                              explicit relationship
                                                                              policy

  `GET`                   `/api/v1/cases/{case_id}/chats`                     Case chat list

  `GET`                   `/api/v1/cases/{case_id}/documents`                 Case files

  `POST`                  `/api/v1/cases/{case_id}/documents`                 Link existing document

  `DELETE`                `/api/v1/cases/{case_id}/documents/{document_id}`   Unlink document without
                                                                              deleting canonical file
  ---------------------------------------------------------------------------------------------------

Example create-case request:

``` json
{
  "title": "Residential Lease Dispute",
  "practice_area": "Real Estate",
  "status": "active",
  "custom_instructions": "Prioritize the configured jurisdiction's tenant protection rules."
}
```

#### Chats

  ------------------------------------------------------------------------------------
  Method                  Endpoint                             Purpose
  ----------------------- ------------------------------------ -----------------------
  `POST`                  `/api/v1/chats`                      Create chat; optional
                                                               `case_id`

  `GET`                   `/api/v1/chats`                      Recent chats,
                                                               searchable and
                                                               paginated

  `GET`                   `/api/v1/chats/{chat_id}`            Chat metadata

  `PATCH`                 `/api/v1/chats/{chat_id}`            Rename/pin

  `DELETE`                `/api/v1/chats/{chat_id}`            Delete chat

  `GET`                   `/api/v1/chats/{chat_id}/messages`   Message history

  `POST`                  `/api/v1/chats/{chat_id}/messages`   Send message and
                                                               receive grounded answer

  `POST`                  `/api/v1/chats/{chat_id}/export`     Create chat
                                                               transcript/memorandum
                                                               export
  ------------------------------------------------------------------------------------

Message request:

``` json
{
  "content": "Explain the termination clause and cite the controlling statutory provisions.",
  "document_ids": [],
  "jurisdiction": "configured-default",
  "citation_style": "Bluebook"
}
```

The backend should resolve `configured-default` from settings; it must
not treat it as a real jurisdiction. Use actual values from the
jurisdiction registry.

#### Workspace documents

  ----------------------------------------------------------------------------------------------------
  Method                  Endpoint                                             Purpose
  ----------------------- ---------------------------------------------------- -----------------------
  `POST`                  `/api/v1/documents`                                  Upload
                                                                               PDF/DOCX/XLSX/TXT

  `GET`                   `/api/v1/documents`                                  List workspace files,
                                                                               search/filter/page

  `GET`                   `/api/v1/documents/{document_id}`                    Metadata and processing
                                                                               status

  `GET`                   `/api/v1/documents/{document_id}/content`            Authorized
                                                                               preview/download

  `DELETE`                `/api/v1/documents/{document_id}`                    Delete canonical file
                                                                               and schedule index
                                                                               cleanup

  `POST`                  `/api/v1/documents/{document_id}/retry-processing`   Retry a failed
                                                                               processing job

  `GET`                   `/api/v1/jobs/{job_id}`                              Poll processing status
  ----------------------------------------------------------------------------------------------------

Upload using `multipart/form-data`, with optional `case_id`. Return
`202 Accepted` for background processing:

``` json
{
  "document_id": "uuid",
  "filename": "agreement.pdf",
  "processing_status": "queued",
  "job_id": "uuid"
}
```

#### Agreement summary

  ------------------------------------------------------------------------------------------------
  Method                  Endpoint                                         Purpose
  ----------------------- ------------------------------------------------ -----------------------
  `POST`                  `/api/v1/agreements/summaries`                   Start summary/audit

  `GET`                   `/api/v1/agreements/summaries/{job_id}`          Get summary job/result

  `GET`                   `/api/v1/agreements/summaries/{job_id}/export`   Export summary
  ------------------------------------------------------------------------------------------------

Request:

``` json
{
  "document_id": "uuid",
  "focus": ["indemnity", "termination", "liability", "governing_law"],
  "jurisdiction": "configured-default"
}
```

#### Agreement comparison

  --------------------------------------------------------------------------------------------------
  Method                  Endpoint                                           Purpose
  ----------------------- -------------------------------------------------- -----------------------
  `POST`                  `/api/v1/agreements/comparisons`                   Start comparison

  `GET`                   `/api/v1/agreements/comparisons/{job_id}`          Retrieve structured
                                                                             result

  `GET`                   `/api/v1/agreements/comparisons/{job_id}/export`   Export redline/report
  --------------------------------------------------------------------------------------------------

Request:

``` json
{
  "baseline_document_id": "uuid",
  "revised_document_id": "uuid",
  "jurisdiction": "configured-default"
}
```

#### Agreement creation

  -----------------------------------------------------------------------------------------------------
  Method                  Endpoint                                            Purpose
  ----------------------- --------------------------------------------------- -------------------------
  `GET`                   `/api/v1/agreement-templates`                       List templates filtered
                                                                              by jurisdiction/type

  `GET`                   `/api/v1/agreement-templates/{template_id}`         Template details and
                                                                              questionnaire schema

  `POST`                  `/api/v1/agreements/drafts`                         Create draft from
                                                                              prompt/template/answers

  `GET`                   `/api/v1/agreements/drafts/{draft_id}`              Read draft and current
                                                                              version

  `PATCH`                 `/api/v1/agreements/drafts/{draft_id}`              Update answers or draft
                                                                              metadata

  `POST`                  `/api/v1/agreements/drafts/{draft_id}/regenerate`   Regenerate selected
                                                                              sections

  `POST`                  `/api/v1/agreements/drafts/{draft_id}/export`       Create DOCX/PDF/TXT/MD
                                                                              export
  -----------------------------------------------------------------------------------------------------

Example request:

``` json
{
  "template_id": "mutual-nda",
  "case_id": null,
  "jurisdiction": "Delaware",
  "requirements": "Mutual confidentiality agreement for early-stage business discussions.",
  "answers": {
    "confidentiality_survival": "5_years",
    "liability_cap": "mutual_cap",
    "term_months": 12
  }
}
```

Template IDs and questionnaire options must come from the backend
template registry, not arbitrary frontend strings.

#### Prompts, search, export, feedback

  -------------------------------------------------------------------------------
  Method                  Endpoint                        Purpose
  ----------------------- ------------------------------- -----------------------
  `GET`                   `/api/v1/prompts`               Prompt library with
                                                          category/search filters

  `POST`                  `/api/v1/prompts/custom`        Save a user's custom
                                                          prompt if supported

  `GET`                   `/api/v1/search?q=...`          Search accessible
                                                          chats, cases and
                                                          documents

  `POST`                  `/api/v1/exports/memoranda`     Create memorandum
                                                          export

  `GET`                   `/api/v1/exports/{export_id}`   Export status/download
                                                          metadata

  `POST`                  `/api/v1/feedback`              Submit product feedback
  -------------------------------------------------------------------------------

------------------------------------------------------------------------

## 6. Feature pipeline specifications

### 6.1 Ask ClauseCite --- chat and legal citation engine

**Input:** chat ID, user question, optional case, optional attached
document IDs, jurisdiction and citation style.

**Pipeline:**

1.  Authenticate the user and authorize chat, case and attached
    documents.
2.  Load recent conversation history and case-specific custom
    instructions.
3.  Classify the request: statutory research, contract interpretation,
    document Q&A, general explanation, or mixed.
4.  Resolve the jurisdiction from explicit user input or saved settings.
    Ask for clarification if the answer depends on an unknown
    jurisdiction.
5.  Search the legal corpus with existing hybrid retrieval: vector
    retrieval using `all-MiniLM-L6-v2`, keyword retrieval, rank fusion
    and optional reranking.
6.  If document IDs are attached, retrieve only authorized chunks from
    those files. Keep private document retrieval scoped to those IDs.
7.  Deduplicate, rank and assemble evidence with source identifiers,
    Act/case names, section, page, effective date and URL where stored.
8.  Call the hosted LLM with the question and evidence. Instruct it to
    distinguish source text from interpretation and identify
    insufficient evidence.
9.  Validate structured response and citations. Resolve every source ID
    against the actual retrieval results. Do not accept a citation
    merely because the model generated a plausible-looking string.
10. Persist user and assistant messages, verified source metadata, model
    name, latency and token usage where available.
11. Return answer blocks, citations, and job/stream state to the UI.

**Citation drawer API:** add `GET /api/v1/legal-sources/{source_id}` to
fetch an authorized, verified source record. The response can contain
official citation, source title, section, excerpt, effective date,
source URL, and verification status. Only show an effective date or
judicial precedent if that data exists in a trusted source record.

**Copy Full Statute:** UI copies the verified excerpt returned by the
API; it should not use generated model text as the canonical statute.

**Chat request response shape:**

``` json
{
  "message_id": "uuid",
  "role": "assistant",
  "content": "Answer text",
  "citations": [
    {
      "source_id": "source-record-id",
      "title": "Source title",
      "citation": "Verified citation string",
      "section": "Verified section",
      "excerpt": "Exact retrieved source excerpt",
      "effective_date": null,
      "verification_status": "verified"
    }
  ],
  "warnings": []
}
```

### 6.2 Workspace Files --- repository and multi-file chat

**Upload pipeline:**

1.  Check workspace membership and upload permission.
2.  Validate extension, content signature, MIME type and maximum size.
3.  Generate a random storage key; never use the client filename as a
    path.
4.  Save original to private storage and compute a SHA-256 checksum.
5.  Create document metadata and a processing job in PostgreSQL.
6.  Extract text by type: PDF with PyMuPDF, DOCX with `python-docx`,
    XLSX with `openpyxl`, TXT with controlled decoding. Use OCR for
    scanned PDFs only if configured.
7.  Preserve page/sheet, headings and source offsets where possible.
8.  Chunk content and index into the private-document retrieval
    namespace with `workspace_id`, `document_id`, `owner_id`, `case_id`
    where applicable, and source location metadata.
9.  Verify index completion and update document/job status.
10. Return `ready` or `failed`, including safe error information.

**Multi-file chat pipeline:**

1.  UI sends selected `document_ids` with the message.
2.  Backend checks each document belongs to the authorized workspace and
    is ready.
3.  Search only those selected documents, not every workspace document
    by default.
4.  Retrieve and rank passages from each selected file; preserve source
    attribution per file.
5.  Generate a cross-document answer and validate each claim's source
    references.
6.  Return citations grouped by file and relevant page/section.
7.  Save message and source metadata.

**Analyze content:** start a full cross-document audit job using the
selected documents. Analyze clause categories independently, compare
conflicting terms, deduplicate findings, and return severity plus
evidence. Severity must be described as an AI triage indicator, not a
legal determination.

**Repository operations:** support name search, filters, pagination,
refresh, selected-file context, secure download, and remove. Removing a
file should coordinate PostgreSQL status, storage deletion and Chroma
index cleanup. Use a retryable deletion job to handle partial failures.

### 6.3 Agreement Summary --- clause auditor and risk review

**Input:** authorized document ID, focus categories, jurisdiction,
optional user instructions.

**Pipeline:**

1.  Verify document ownership and `ready` status.
2.  Load extracted text and source-location map; re-extract only if
    missing or stale.
3.  Segment into clauses using headings, numbering and text heuristics.
4.  Detect relevant clause categories: parties, term, payment,
    termination, indemnity, liability cap, confidentiality, IP,
    non-compete, governing law, dispute resolution, renewal, notices and
    other configurable categories.
5.  For each clause, provide relevant text and neighboring context to
    the LLM in bounded batches.
6.  Require structured output: clause category, original excerpt,
    plain-language meaning, issue, severity, rationale, suggested
    revision, legal source references and source offsets/pages.
7.  Verify every quoted original excerpt against extracted text. Verify
    legal sources against retrieval results and trusted metadata.
8.  Compute an overall risk score only using a documented, versioned
    rubric. Save score, rubric version, findings and limitations.
9.  Return findings ordered by severity and location; UI can expand each
    clause to see evidence and proposed changes.
10. Store job result and allow export.

**Important:** do not invent a score such as `74/100` without running
the configured scoring rubric. Display "not assessed" if scoring fails
or inputs are insufficient.

Suggested output:

``` json
{
  "job_id": "uuid",
  "status": "completed",
  "document_id": "uuid",
  "risk_score": 74,
  "risk_label": "high",
  "rubric_version": "contract-risk-v1",
  "findings": [
    {
      "clause_type": "indemnification",
      "severity": "high",
      "original_text": "Exact text from the document",
      "explanation": "Evidence-grounded explanation",
      "suggested_revision": "Proposed wording for review",
      "source_locations": [{"page": 5, "section": "12. Indemnity"}],
      "legal_sources": [],
      "confidence": "medium"
    }
  ],
  "limitations": ["AI-assisted review; attorney verification required."]
}
```

The numeric values above illustrate the shape only. Real scores and
findings must be generated from the actual file and scoring rules.

### 6.4 Compare Agreements --- diff, redline and risk shift

**Pipeline:**

1.  Authorize access to both files and confirm both are ready.
2.  Extract text while preserving page, heading and clause boundaries.
3.  Normalize whitespace and numbering conservatively; never discard
    substantive wording.
4.  Match clauses using stable clause identifiers/headings first, then
    semantic similarity for moved or rewritten clauses.
5.  Run deterministic word-level or line-level diffs for matched
    clauses.
6.  Classify each clause as added, deleted, modified, moved or
    unchanged.
7.  Ask the LLM to explain material differences using only the matched
    original/revised text.
8.  Determine which party may benefit or be burdened only when the text
    supports the inference; include uncertainty.
9.  Compute summary metrics from actual diff records: total changed
    clauses, additions, deletions, and risk-score variance if both
    versions were assessed with the same rubric.
10. Return structured differences with source locations and both
    original/revised excerpts.
11. Render redline colors in the frontend from the structured diff; do
    not ask the LLM to create HTML or CSS.
12. Store comparison job/result and support export.

Example finding:

``` json
{
  "clause_id": "termination",
  "change_type": "modified",
  "original_text": "Either party may terminate on 30 days' notice.",
  "revised_text": "Either party may terminate on 90 days' notice.",
  "diff": [
    {"type": "equal", "text": "Either party may terminate on "},
    {"type": "delete", "text": "30"},
    {"type": "insert", "text": "90"},
    {"type": "equal", "text": " days' notice."}
  ],
  "impact_explanation": "The notice period increased.",
  "potentially_benefits": "Must be assessed in context of each party's obligations.",
  "original_location": {"page": 4},
  "revised_location": {"page": 5}
}
```

Use deterministic diff output as the source of truth. LLM explanations
are a separate, reviewable layer.

### 6.5 Create Agreement --- guided generator

**Pipeline:**

1.  Fetch active templates filtered by agreement type and jurisdiction.
2.  Return template metadata and a JSON Schema/questionnaire definition
    to the UI.
3.  Validate the submitted fields server-side against the selected
    template version.
4.  Check jurisdiction and required inputs; ask follow-up questions for
    missing material terms rather than inventing them.
5.  Load approved clause library and conditional clause rules.
6.  Retrieve relevant legal provisions when the drafting task requires
    them.
7.  Generate or adapt clauses in structured JSON, not as unvalidated
    free-form HTML.
8.  Validate clause IDs, required sections, parties, dates, defined
    terms, cross-references and contradictory answers.
9.  Run a second review pass for missing fields and internal
    inconsistency.
10. Render a draft using versioned DOCX templates; optionally convert to
    PDF using an installed conversion service.
11. Save draft metadata, input answers, template version and generated
    artifact.
12. Return draft preview data and export IDs. Preserve versions when
    users edit/regenerate.

Questionnaire examples include jurisdiction, parties, contract duration,
termination notice, liability cap, confidentiality survival and payment
terms. Options must be configured per template and jurisdiction; do not
hardcode one jurisdiction's boilerplate as universal law.

Generated documents are drafts requiring appropriate legal review. Never
claim that the output is ready for signature or compliant with all laws
without verification.

------------------------------------------------------------------------

## 7. Supporting features

### Cases and matter dossier

-   Store practice area, status, custom instructions, timestamps, linked
    chats and linked documents.
-   Return `chat_count` and `file_count` in the case list using
    efficient aggregate queries.
-   Custom instructions must be treated as user-provided context, not
    trusted system instructions. They cannot override access controls or
    citation verification.
-   When opening a case, return overview metadata and paginated
    chats/files separately.
-   Case deletion should default to archive or require a clear deletion
    policy. Do not silently delete canonical files shared with other
    cases.

### Global search

Search accessible chat titles, message content, case names and document
metadata. Use PostgreSQL full-text search initially; optionally add a
dedicated search engine later. Every result must be permission-filtered
before it is returned. Do not return private document text as a search
snippet unless the caller is authorized.

### Prompt library

Store curated prompts in `prompt_templates`, with categories,
jurisdiction applicability and versioning. Return prompt text to the UI
for selection. Treat user-created prompts as untrusted data and keep
system-level safety and citation rules separate.

### Export legal memorandum

1.  Load authorized chat, summary or comparison content.
2.  Build a structured memorandum model with title, date, matter, issue,
    analysis, sources, limitations and disclaimer.
3.  Validate that citation references exist in stored verified source
    records.
4.  Render Markdown/TXT directly; DOCX with `python-docx`; PDF using a
    maintained renderer.
5.  Store output privately and return a time-limited authorized download
    route.
6.  Label attorney-client privilege or work-product status only when the
    user/context actually establishes that status. Do not automatically
    claim a document is privileged merely because it was generated by
    the product.

### Account and jurisdiction settings

Persist user defaults for jurisdiction, court/source repositories,
Bluebook/ALWD formatting, citation strictness, model preference where
supported, and export format. Apply defaults only when the request does
not specify a different setting. A citation style affects formatting,
not source validity.

### Feedback

Accept a category and bounded text length, associate with the
authenticated user and workspace, apply rate limiting, and return a
confirmation. Do not expose internal feedback records to other users.

------------------------------------------------------------------------

## 8. ChromaDB and hybrid RAG integration

Create one adapter module (`app/ai/rag_adapter.py`) that wraps the
existing retrieval code.

``` python
from dataclasses import dataclass
from typing import Protocol


@dataclass
class RetrievedPassage:
    text: str
    source_id: str
    title: str
    section: str | None = None
    page: int | None = None
    effective_date: str | None = None
    source_url: str | None = None
    retrieval_score: float | None = None


class HybridRetriever(Protocol):
    def search(
        self,
        query: str,
        *,
        top_k: int,
        filters: dict | None = None,
    ) -> list[RetrievedPassage]:
        ...
```

The actual adapter must match the existing retriever's signature and
result format; do not assume the protocol is already implemented.

### Retrieval behavior

-   Reuse `all-MiniLM-L6-v2` and the existing Chroma collection/index.
-   Combine semantic and keyword results using the current method or
    Reciprocal Rank Fusion.
-   Optionally rerank the merged candidate set if a reranker is already
    available and affordable.
-   Apply jurisdiction, effective-date, source type and corpus-version
    filters.
-   Preserve exact source IDs, section IDs, URLs and page/paragraph
    locations.
-   Do not silently index the same chunk repeatedly on retries; use
    stable IDs and idempotent upserts.
-   Maintain separate retrieval scopes for the legal corpus and private
    documents.
-   When a user asks about a particular uploaded document, restrict
    retrieval to that authorized document set.
-   If retrieval yields insufficient evidence, tell the LLM to say so
    rather than generate unsupported citations.

### Suggested metadata for legislation JSON datasets

Adapt to the actual schema of existing Act JSON files:

``` json
{
  "source_id": "stable-source-section-id",
  "title": "Act title from source",
  "section_id": "source-section-id",
  "section_title": "Section heading from source",
  "jurisdiction": "India",
  "effective_from": null,
  "effective_to": null,
  "source_url": null,
  "text": "Exact text from source"
}
```

Populate dates and URLs only when available and verified. Use a stable
identifier derived from the source dataset and section, not a random ID
generated on each indexing run.

------------------------------------------------------------------------

## 9. Hosted LLM abstraction

Use one provider-neutral interface so switching vendors does not require
rewriting every service.

``` python
from typing import Protocol, TypeVar

T = TypeVar("T")


class LLMClient(Protocol):
    async def generate_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
    ) -> str:
        ...

    async def generate_structured(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        output_schema: type[T],
        model: str | None = None,
    ) -> T:
        ...
```

Implement the interface using the selected provider's supported SDK/API.
Include:

-   Request timeout and bounded retry with exponential backoff for
    transient failures.
-   Provider rate-limit and unavailable-service handling.
-   Model and token usage logging where returned by the provider.
-   Structured-output validation using Pydantic.
-   Maximum input/output token limits and document chunking.
-   Redaction/minimization of sensitive information where appropriate.
-   No API keys in frontend environment variables.
-   No claim that a provider guarantees confidentiality or zero
    retention unless verified from the provider's actual terms and
    configuration.

Do not log full user contracts or sensitive prompts by default. Use
structured logs with IDs, timings, status and safe error codes.

------------------------------------------------------------------------

## 10. Document extraction, chunking and storage

### File processing stages

``` text
Upload
  -> validate format, signature, size
  -> save privately and calculate checksum
  -> create document + processing_job records
  -> extract text / OCR
  -> preserve pages, sheets, headings and offsets
  -> split into retrieval chunks
  -> index using existing embedding/RAG pipeline
  -> verify index
  -> mark document ready
```

### Extraction rules

-   PDF: extract page-by-page with PyMuPDF. Detect likely scanned PDFs
    and route to OCR only if enabled.
-   DOCX: preserve headings and paragraph ordering; extract tables when
    needed.
-   XLSX: preserve sheet name, row and cell context.
-   TXT: decode safely and reject invalid/unsupported encodings where
    necessary.
-   Store extraction status and safe failure reason.
-   Enforce limits on file size, page count, archive expansion,
    processing time and OCR time.
-   Treat document contents as untrusted prompt input. Ignore
    instructions embedded in a document that attempt to override system
    policies or expose other files.
-   Use generated storage keys and private access. Never construct
    filesystem paths directly from uploaded names.

### Deletion consistency

Document deletion spans PostgreSQL, file storage and ChromaDB. Mark the
document as `deleting`, enqueue cleanup, remove index records and stored
artifacts, then mark `deleted`. Retry failures and maintain audit
records. Do not report full deletion if some stores remain uncleared.

------------------------------------------------------------------------

## 11. Background jobs and streaming

Use synchronous API calls for fast operations and jobs for large
operations.

### Job states

`queued -> processing -> completed`

Failure path: `queued/processing -> failed`

Optionally include `cancelled` and `retrying`.

Every job should include an owner/workspace scope, operation type,
progress, safe error code, timestamps and result reference. The UI
should poll `GET /api/v1/jobs/{job_id}` initially. Add SSE for chat
streaming only after persistence, cancellation and disconnect behavior
are reliable.

For a small prototype, synchronous document processing is acceptable
only with strict file and time limits. For a deployed service, use a
worker queue for OCR, indexing, long summaries, comparisons and exports.

------------------------------------------------------------------------

## 12. Authentication, privacy and security

Implement authentication using the existing identity system if present.
Otherwise use a secure, established session/JWT design and password
hashing appropriate to the authentication flow.

Required controls:

-   Authenticate every private endpoint.
-   Check workspace membership/role and resource ownership in every
    repository/service path.
-   Never trust `user_id`, `owner_id`, or role values supplied by the
    browser.
-   Validate document IDs before Chroma retrieval and download.
-   Use private storage; issue short-lived signed URLs only where
    suitable.
-   Restrict CORS to the actual frontend origin.
-   Add upload limits, rate limits, request timeouts and safe error
    messages.
-   Protect secrets using environment variables in development and a
    secret manager in production.
-   Keep audit events for uploads, downloads, deletion, export, and
    access-sensitive actions.
-   Avoid logging sensitive legal text or access tokens.
-   Use HTTPS in production, database backups, retention policies and
    dependency updates.
-   Add tenant/workspace isolation tests and IDOR tests.
-   Ensure model-generated legal text is clearly marked as AI-assisted
    and source citations are validated.

------------------------------------------------------------------------

## 13. Environment configuration

Provide `.env.example` with placeholders, never real credentials:

``` dotenv
APP_ENV=development
DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/legal_app
FRONTEND_ORIGIN=http://localhost:5173

CHROMA_HOST=localhost
CHROMA_PORT=8001
CHROMA_COLLECTION=existing_collection_name
EMBEDDING_MODEL=all-MiniLM-L6-v2

LLM_PROVIDER=provider_name
LLM_API_KEY=replace_me
LLM_MODEL=configured_model_name

UPLOAD_DIR=./private_uploads
MAX_UPLOAD_MB=25
```

If ChromaDB is embedded in-process, use the existing persistent client
setup rather than these host/port settings. Add worker and
object-storage configuration only when those services are introduced.

------------------------------------------------------------------------

## 14. Testing and acceptance criteria

### Unit tests

-   Input validation and template schema validation
-   Text extraction and source location preservation
-   Clause matching and diff logic
-   Risk rubric calculation
-   Citation/source ID verification
-   File type and size validation
-   RAG adapter mapping of actual Chroma results

### API integration tests

-   Create/list/update cases
-   Create chat, persist messages and retrieve history
-   Upload file and observe job completion/failure
-   Summarize an authorized document
-   Compare two authorized documents
-   Generate a template-based draft and export
-   Search only records the caller can access
-   Settings persist and affect default behavior
-   Export links are authorized and expire when designed to do so

### Security tests

-   User A cannot access User B's chat, case, document, job, export or
    generated draft.
-   A user cannot attach an unauthorized document UUID to a chat.
-   A workspace member without write access cannot modify or delete
    records.
-   Chroma filters cannot be bypassed by changing request parameters.
-   Uploaded files cannot traverse paths or execute as server content.
-   Model output cannot create fabricated citations accepted as verified
    sources.

### Feature acceptance checklist

-   Sidebar case/chat counts reflect database state.
-   Chat titles are generated or renamed and persist across reloads.
-   Workspace file selection is respected by multi-file chat.
-   Every displayed citation resolves to a stored, verified source
    record.
-   Summary findings map back to actual clauses/pages.
-   Comparison additions/deletions come from deterministic text diffs.
-   Agreement generation uses a versioned template and validated
    answers.
-   DOCX/PDF/TXT/MD exports can be downloaded only by authorized users.
-   Errors are actionable without exposing internal stack traces or
    secrets.

------------------------------------------------------------------------

## 15. Recommended implementation order

### Phase 1 --- Inspect and connect existing infrastructure

1.  Map the current repository and existing RAG/embedding code.
2.  Configure PostgreSQL and Alembic.
3.  Add authentication/current-user dependency and workspace
    authorization.
4.  Implement health/readiness checks and consistent errors.

### Phase 2 --- Core application records

5.  Implement workspace/settings and cases.
6.  Implement chats, messages, history, rename and pin.
7.  Add global search over cases/chats/document metadata.
8.  Connect Ask ClauseCite to the existing RAG adapter and hosted LLM.

### Phase 3 --- Document pipeline

9.  Implement private storage and file metadata.
10. Add extraction, chunking, indexing, status jobs and cleanup.
11. Implement workspace search/filter/list/download/delete.
12. Implement authorized multi-file chat.

### Phase 4 --- Legal document workflows

13. Implement summary with structured findings and source verification.
14. Implement comparison with deterministic diffs and risk shift
    explanation.
15. Implement template registry, questionnaire schemas and agreement
    drafting.
16. Implement DOCX/PDF/TXT/MD exports.

### Phase 5 --- Supporting functionality and hardening

17. Implement prompt library, settings, feedback and memorandum exports.
18. Add comprehensive tests, access controls, audit events and rate
    limits.
19. Validate error cases, large files, provider outages and job retries.
20. Deploy with HTTPS, backups, monitoring and private storage.

------------------------------------------------------------------------

## 16. Instructions for the Antigravity coding agent

Follow these instructions when implementing this document:

1.  **Inspect before editing.** List the repository tree and identify
    existing backend entrypoints, models, configuration, RAG classes,
    embedding manager, Chroma collection names, ingestion scripts and
    tests.
2.  **Report the reuse plan.** Map existing files/classes to the
    architecture above. Do not replace working RAG code without evidence
    that replacement is necessary.
3.  **Implement incrementally.** Complete one phase at a time and keep
    the application runnable after each phase.
4.  **Create migrations and tests with each feature.** Do not postpone
    all testing to the end.
5.  **Match the existing frontend.** Inspect current API calls,
    TypeScript types, routes, form payloads and loading/error states.
    Adapt backend contracts to the UI where reasonable instead of
    changing the visual design.
6.  **Use actual provider and schema details.** Do not invent LLM SDK
    methods, Chroma metadata keys, template IDs, or source fields.
    Inspect current code and installed package versions.
7.  **No fake success paths.** Do not return hardcoded citations,
    simulated risk results, fake file counts, placeholder download
    links, or success responses from unimplemented services.
8.  **Do not mark a feature complete while core work remains stubbed.**
    If a provider credential or data source is unavailable, implement
    the interface, return a clear configuration error, and document the
    blocker.
9.  **Validate security.** Include tests for resource ownership and
    cross-workspace access before enabling endpoints.
10. **Summarize each phase.** Report files changed, migrations added,
    tests run, environment variables required, API endpoints delivered
    and known limitations.

### Definition of done

The backend is complete when the existing UI can perform the defined
workflows against real PostgreSQL records, private files, the existing
ChromaDB hybrid retriever and the configured hosted LLM, with verified
citations, consistent job states, exports, and tested access control.

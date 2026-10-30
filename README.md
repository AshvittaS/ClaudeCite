# ClauseCite — Reorganized Project

This archive groups the existing frontend and legal RAG dataset/retrieval project into one root.

## Root layout

```text
ClauseCite/
├── frontend/                 # Existing React + TypeScript + Vite UI
├── backend/                  # Create here for FastAPI application
├── datasets/
│   └── legal-rag/
│       ├── data/
│       │   ├── raw/
│       │   │   ├── india/    # Indian Acts, statutes, amendment/crosswalk JSON
│       │   │   └── cuad/     # CUAD contract dataset
│       │   ├── processed/    # Generated/normalized corpus data
│       │   └── eval/         # Retrieval/answer evaluation assets
│       ├── rag/              # Existing retrieval, embedding, answer and Chroma code
│       ├── scripts/          # Ingestion, validation, evaluation scripts
│       ├── tests/
│       ├── PIPELINE.md
│       └── README.md
├── docs/
│   └── REORGANIZATION.md
└── README.md
```

## Important boundaries

- `frontend/` contains the existing UI. Its source files were retained in their original relative positions so existing relative imports are not broken.
- `datasets/legal-rag/data/raw/india/` is the source-of-truth area for statutory JSON files.
- `datasets/legal-rag/data/raw/cuad/` contains the contract dataset; it is separate from Indian statutes.
- `datasets/legal-rag/rag/` contains the existing RAG implementation. Integrate it through a backend adapter; do not rebuild or silently replace the existing Chroma collection.
- `backend/` is intentionally a placeholder for the FastAPI service. Add it when integrating API endpoints and PostgreSQL models.
- PostgreSQL should store users, workspaces, cases, chats, messages, uploaded-document metadata, analysis jobs and settings. It should not replace ChromaDB as the vector index.
- User-uploaded contracts should be stored separately from the public legal corpus, with private file storage and their own document/chunk metadata.
- Do not commit API keys, uploaded private contracts, generated Chroma persistence data, or environment files containing secrets.

## Frontend current structure

The frontend currently has:
- `src/App.tsx`, `src/main.tsx`, `src/index.css`
- `src/components/` for landing-page components, modals, common components, and dashboard workspaces
- `src/components/dashboard/` for chat, document review, comparison, generation, cases, vault/files and settings
- `src/data/testUserData.ts` for mock/demo data

The frontend is deliberately not split into new feature directories in this archive because moving component files without updating every TypeScript import can break the current build. A safe next step is to extract API calls into `src/services/` and replace `testUserData.ts` with backend data, then move feature components gradually with import updates.

## Recommended next steps

1. Verify frontend build with `cd frontend && npm install && npm run build`.
2. Inspect `datasets/legal-rag/rag/config.py` and `rag/build_chroma.py` to identify the existing Chroma persistence path and collection name.
3. Keep `all-MiniLM-L6-v2` as the embedding model if it matches the collection used to build the existing vectors.
4. Implement `backend/app/ai/rag_adapter.py` to call the existing retrieval functions.
5. Add FastAPI endpoints and PostgreSQL persistence in `backend/`; frontend calls should go through `VITE_API_BASE_URL`.
6. Run corpus validation and retrieval tests before re-indexing. Re-index only deliberately, after backing up the existing collection.

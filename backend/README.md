# FastAPI backend placeholder

Create the FastAPI service here. Recommended initial structure:

```text
backend/
└── app/
    ├── main.py
    ├── core/                 # config, security, logging
    ├── db/                   # SQLAlchemy session, Alembic
    ├── models/               # PostgreSQL entities
    ├── schemas/              # Pydantic request/response schemas
    ├── api/v1/               # chats, documents, cases, summary, compare, agreements
    ├── repositories/         # database access
    ├── services/             # business workflows
    ├── ai/
    │   ├── rag_adapter.py    # adapter to datasets/legal-rag/rag
    │   ├── llm_client.py
    │   └── citation_verifier.py
    ├── document_processing/  # extraction, chunking, diff, risk analysis
    └── storage/              # private uploaded files and exports
```

Do not duplicate the existing RAG implementation. Keep secrets in backend environment variables, never in Vite `VITE_*` variables.

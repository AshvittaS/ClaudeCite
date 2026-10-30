"""
Hybrid RAG adapter — wraps ChromaDB vector search + BM25 keyword search.
Uses all-MiniLM-L6-v2 for embeddings.
Maintains two separate collections:
  - legal_corpus: indexed Indian statutes from sections.jsonl
  - user_documents: private workspace-uploaded documents
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Optional
from pathlib import Path

import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi

from app.core.config import settings

logger = logging.getLogger(__name__)


@dataclass
class RetrievedPassage:
    text: str
    source_id: str
    title: str
    section: Optional[str] = None
    page: Optional[int] = None
    effective_date: Optional[str] = None
    source_url: Optional[str] = None
    retrieval_score: float = 0.0
    jurisdiction: Optional[str] = None
    citation: Optional[str] = None
    law_name: Optional[str] = None


class HybridRetriever:
    """
    Hybrid retriever combining ChromaDB semantic search with BM25 keyword search.
    Merges results using Reciprocal Rank Fusion.
    """

    def __init__(
        self,
        chroma_client: chromadb.ClientAPI,
        collection_name: str,
        embedding_model: SentenceTransformer,
        bm25_corpus: list[dict] | None = None,
    ):
        self._client = chroma_client
        self._collection_name = collection_name
        self._embedder = embedding_model
        self._collection = chroma_client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        # BM25 index built from provided corpus
        self._bm25: BM25Okapi | None = None
        self._bm25_docs: list[dict] = []
        if bm25_corpus:
            self._build_bm25(bm25_corpus)

    def _build_bm25(self, corpus: list[dict]):
        self._bm25_docs = corpus
        tokenized = [doc["text"].lower().split() for doc in corpus]
        self._bm25 = BM25Okapi(tokenized)
        logger.info(f"BM25 built for {len(corpus)} documents in '{self._collection_name}'")

    def _reciprocal_rank_fusion(
        self, vector_hits: list[str], keyword_hits: list[str], k: int = 60
    ) -> list[str]:
        """Merge two ranked lists using RRF."""
        scores: dict[str, float] = {}
        for rank, doc_id in enumerate(vector_hits):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
        for rank, doc_id in enumerate(keyword_hits):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
        return sorted(scores.keys(), key=lambda x: scores[x], reverse=True)

    def search(
        self,
        query: str,
        *,
        top_k: int = 8,
        filters: dict | None = None,
        collection_name: str | None = None,
    ) -> list[RetrievedPassage]:
        """
        Hybrid search: vector + BM25 + RRF fusion.
        Optional filters: dict with metadata field conditions (e.g., {"jurisdiction": "IN"})
        """
        target_collection = collection_name or self._collection_name
        if target_collection != self._collection_name:
            collection = self._client.get_or_create_collection(target_collection)
        else:
            collection = self._collection

        if collection.count() == 0:
            logger.warning(f"Collection '{target_collection}' is empty.")
            return []

        # --- Vector search ---
        query_embedding = self._embedder.encode([query])[0].tolist()
        chroma_filters = None
        if filters:
            conditions = [{"$eq": {k: v}} if isinstance(v, str) else {} for k, v in filters.items()]
            chroma_filters = {"$and": [{"field": k, "$eq": v} for k, v in filters.items()]} if len(filters) > 1 else None
            # Build proper where clause for chromadb
            if len(filters) == 1:
                k, v = next(iter(filters.items()))
                chroma_filters = {k: {"$eq": v}}
            elif len(filters) > 1:
                chroma_filters = {"$and": [{k: {"$eq": v}} for k, v in filters.items()]}

        try:
            vector_results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k * 2, max(collection.count(), 1)),
                where=chroma_filters,
                include=["documents", "metadatas", "distances"],
            )
        except Exception as e:
            logger.error(f"ChromaDB query error: {e}")
            return []

        vector_ids = vector_results["ids"][0] if vector_results["ids"] else []
        vector_docs = vector_results["documents"][0] if vector_results["documents"] else []
        vector_metas = vector_results["metadatas"][0] if vector_results["metadatas"] else []
        vector_distances = vector_results["distances"][0] if vector_results["distances"] else []

        # Map IDs to metadata
        id_to_data: dict[str, dict] = {}
        for vid, vdoc, vmeta, vdist in zip(vector_ids, vector_docs, vector_metas, vector_distances):
            id_to_data[vid] = {
                "text": vdoc,
                "metadata": vmeta or {},
                "score": 1.0 - vdist,  # cosine similarity
            }

        # --- BM25 keyword search (only for legal corpus) ---
        bm25_ids: list[str] = []
        if self._bm25 and target_collection == self._collection_name:
            tokens = query.lower().split()
            bm25_scores = self._bm25.get_scores(tokens)
            top_indices = sorted(range(len(bm25_scores)), key=lambda i: bm25_scores[i], reverse=True)[:top_k * 2]
            for idx in top_indices:
                doc = self._bm25_docs[idx]
                bm25_ids.append(doc.get("id", str(idx)))
                if doc.get("id") not in id_to_data:
                    id_to_data[doc["id"]] = {
                        "text": doc.get("text", ""),
                        "metadata": {k: v for k, v in doc.items() if k != "text"},
                        "score": float(bm25_scores[idx]),
                    }

        # --- RRF fusion ---
        fused_ids = self._reciprocal_rank_fusion(vector_ids, bm25_ids)[:top_k]

        # Build result passages
        passages: list[RetrievedPassage] = []
        for doc_id in fused_ids:
            data = id_to_data.get(doc_id)
            if not data:
                continue
            meta = data["metadata"]
            passages.append(RetrievedPassage(
                text=data["text"],
                source_id=doc_id,
                title=meta.get("title", meta.get("law_name", "Unknown Source")),
                section=meta.get("section") or meta.get("section_title"),
                page=meta.get("page_number"),
                effective_date=meta.get("effective_date"),
                source_url=meta.get("source_url"),
                retrieval_score=data["score"],
                jurisdiction=meta.get("jurisdiction"),
                citation=meta.get("citation"),
                law_name=meta.get("law_name"),
            ))

        return passages


class RAGManager:
    """
    Central manager for all ChromaDB collections and retrieval.
    Singleton that holds both legal corpus and user document retrievers.
    """

    def __init__(self):
        persist_path = Path(settings.CHROMA_PERSIST_PATH).resolve()
        persist_path.mkdir(parents=True, exist_ok=True)

        self._chroma = chromadb.PersistentClient(
            path=str(persist_path),
        )
        logger.info(f"ChromaDB initialized at {persist_path}")

        logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL}")
        self._embedder = SentenceTransformer(settings.EMBEDDING_MODEL)
        logger.info("Embedding model loaded.")

        # Legal corpus retriever (BM25 is loaded separately via index_legal_corpus)
        self._legal_retriever: HybridRetriever | None = None
        self._docs_retriever: HybridRetriever | None = None

    def get_legal_retriever(self) -> HybridRetriever:
        if self._legal_retriever is None:
            self._legal_retriever = HybridRetriever(
                chroma_client=self._chroma,
                collection_name=settings.CHROMA_LEGAL_COLLECTION,
                embedding_model=self._embedder,
            )
        return self._legal_retriever

    def get_docs_retriever(self) -> HybridRetriever:
        if self._docs_retriever is None:
            self._docs_retriever = HybridRetriever(
                chroma_client=self._chroma,
                collection_name=settings.CHROMA_DOCS_COLLECTION,
                embedding_model=self._embedder,
            )
        return self._docs_retriever

    def get_chroma_client(self) -> chromadb.ClientAPI:
        return self._chroma

    def get_embedder(self) -> SentenceTransformer:
        return self._embedder

    def add_document_chunks(
        self,
        collection_name: str,
        chunk_ids: list[str],
        texts: list[str],
        metadatas: list[dict],
    ):
        """Upsert document chunks into ChromaDB with stable IDs."""
        collection = self._chroma.get_or_create_collection(collection_name)
        embeddings = self._embedder.encode(texts).tolist()
        collection.upsert(
            ids=chunk_ids,
            documents=texts,
            embeddings=embeddings,
            metadatas=metadatas,
        )

    def delete_document_chunks(self, collection_name: str, document_id: str):
        """Remove all chunks for a document from ChromaDB."""
        collection = self._chroma.get_or_create_collection(collection_name)
        collection.delete(where={"document_id": {"$eq": document_id}})

    def search_user_document(
        self,
        query: str,
        document_ids: list[str],
        top_k: int = 6,
    ) -> list[RetrievedPassage]:
        """Search within specific authorized document IDs, with fallback to direct retrieval."""
        collection = self._chroma.get_or_create_collection(settings.CHROMA_DOCS_COLLECTION)
        if collection.count() == 0:
            return []

        # Filter out client-side temporary IDs if any
        valid_ids = [
            d for d in document_ids
            if d and not str(d).startswith("temp-") and not str(d).startswith("doc-17")
        ]
        effective_ids = valid_ids if valid_ids else [d for d in document_ids if d]

        where_filter = None
        if effective_ids:
            where_filter = (
                {"document_id": {"$in": effective_ids}}
                if len(effective_ids) > 1
                else {"document_id": {"$eq": effective_ids[0]}}
            )

        query_embedding = self._embedder.encode([query])[0].tolist()

        ids, docs, metas, distances = [], [], [], []

        try:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, collection.count()),
                where=where_filter,
                include=["documents", "metadatas", "distances"],
            )
            if results and results.get("ids") and results["ids"][0]:
                ids = results["ids"][0]
                docs = results["documents"][0]
                metas = results["metadatas"][0]
                distances = results["distances"][0]
        except Exception as e:
            logger.warning(f"User doc vector search error: {e}")

        # Fallback 1: If vector similarity returned 0 hits for this query, fetch document chunks directly
        if not docs:
            try:
                get_kwargs = {"limit": top_k}
                if where_filter:
                    get_kwargs["where"] = where_filter
                direct_res = collection.get(**get_kwargs)
                if direct_res and direct_res.get("documents"):
                    ids = direct_res.get("ids", [])
                    docs = direct_res.get("documents", [])
                    metas = direct_res.get("metadatas", [])
                    distances = [0.1] * len(docs)
            except Exception as e:
                logger.warning(f"User doc direct get fallback error: {e}")

        # Fallback 2: If still no docs but collection has items, grab the latest chunks from collection
        if not docs and collection.count() > 0:
            try:
                direct_res = collection.get(limit=top_k)
                if direct_res and direct_res.get("documents"):
                    ids = direct_res.get("ids", [])
                    docs = direct_res.get("documents", [])
                    metas = direct_res.get("metadatas", [])
                    distances = [0.2] * len(docs)
            except Exception as e:
                logger.warning(f"User doc collection get fallback error: {e}")

        passages = []
        for pid, pdoc, pmeta, pdist in zip(ids, docs, metas, distances):
            meta = pmeta or {}
            passages.append(RetrievedPassage(
                text=pdoc,
                source_id=pid,
                title=meta.get("original_filename", "Uploaded Document"),
                section=meta.get("section_label"),
                page=meta.get("page_number"),
                retrieval_score=1.0 - (pdist if isinstance(pdist, (int, float)) else 0.0),
                law_name=meta.get("original_filename"),
            ))

        return passages


# Singleton instance
_rag_manager: RAGManager | None = None


def get_rag_manager() -> RAGManager:
    global _rag_manager
    if _rag_manager is None:
        _rag_manager = RAGManager()
    return _rag_manager

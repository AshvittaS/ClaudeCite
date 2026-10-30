"""
Script to index the Indian statutes and legal sections into ChromaDB.
Reads from datasets/legal-rag/data/processed/sections.jsonl
"""
import sys
import json
import argparse
import logging
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.core.config import settings
from app.ai.rag_adapter import get_rag_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("indexer")


def index_sections(jsonl_path: Path, limit: int | None = None, batch_size: int = 64):
    if not jsonl_path.exists():
        logger.error(f"Dataset file not found: {jsonl_path}")
        return

    logger.info(f"Opening dataset: {jsonl_path}")
    rag = get_rag_manager()
    embedder = rag.get_embedder()
    client = rag.get_chroma_client()
    collection = client.get_or_create_collection(settings.CHROMA_LEGAL_COLLECTION)

    initial_count = collection.count()
    logger.info(f"Initial collection count: {initial_count}")

    batch_ids = []
    batch_texts = []
    batch_metas = []
    total_indexed = 0

    with open(jsonl_path, "r", encoding="utf-8") as f:
        for line_num, line in enumerate(f):
            if limit and total_indexed >= limit:
                break

            line = line.strip()
            if not line:
                continue

            try:
                record = json.loads(line)
            except Exception:
                continue

            doc_id = record.get("id") or f"sec-{line_num}"
            raw_text = record.get("text", "").strip()
            if not raw_text:
                continue

            # Clean and truncate text if excessive
            text = raw_text[:4000]

            title = record.get("title", "")
            citation = record.get("citation", "")
            law_name = record.get("law_name", "")
            section = str(record.get("section", ""))
            jurisdiction = record.get("jurisdiction", "IN")
            doc_type = record.get("doc_type", "statute")
            status = record.get("status", "in_force")

            metadata = {
                "title": title[:200] if title else "",
                "citation": citation[:200] if citation else "",
                "law_name": law_name[:200] if law_name else "",
                "section": section[:50] if section else "",
                "jurisdiction": jurisdiction,
                "doc_type": doc_type,
                "status": status,
            }

            batch_ids.append(doc_id)
            batch_texts.append(text)
            batch_metas.append(metadata)

            if len(batch_ids) >= batch_size:
                embeddings = embedder.encode(batch_texts).tolist()
                collection.upsert(
                    ids=batch_ids,
                    documents=batch_texts,
                    embeddings=embeddings,
                    metadatas=batch_metas,
                )
                total_indexed += len(batch_ids)
                logger.info(f"Indexed {total_indexed} sections...")
                batch_ids = []
                batch_texts = []
                batch_metas = []

        if batch_ids:
            embeddings = embedder.encode(batch_texts).tolist()
            collection.upsert(
                ids=batch_ids,
                documents=batch_texts,
                embeddings=embeddings,
                metadatas=batch_metas,
            )
            total_indexed += len(batch_ids)
            logger.info(f"Indexed final batch. Total indexed in this run: {total_indexed}")

    final_count = collection.count()
    logger.info(f"Collection '{settings.CHROMA_LEGAL_COLLECTION}' now has {final_count} items.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Index Indian Legal Corpus into ChromaDB")
    parser.add_argument("--limit", type=int, default=1500, help="Number of sections to index (default: 1500)")
    parser.add_argument("--batch-size", type=int, default=64, help="Embedding batch size (default: 64)")
    args = parser.parse_args()

    repo_root = backend_dir.parent
    dataset_file = repo_root / "datasets" / "legal-rag" / "data" / "processed" / "sections.jsonl"

    index_sections(dataset_file, limit=args.limit, batch_size=args.batch_size)

"""
Modern LLM client using the official Google GenAI SDK (google-genai).
Provides text generation, retry with backoff, and Pydantic structured output validation.
"""
from __future__ import annotations

import json
import time
import logging
from typing import Any, TypeVar, Type
from pydantic import BaseModel

from google import genai
from google.genai import types

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMClient:
    """Client for Google Gemini using the modern google-genai SDK."""

    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "YOUR_GEMINI_API_KEY":
            raise RuntimeError(
                "GEMINI_API_KEY is not set. Please add your key to backend/.env"
            )
        self._client = genai.Client(api_key=api_key)
        self.model_name = settings.LLM_MODEL or "gemini-2.0-flash"

    def _call_with_retry(
        self,
        prompt: str,
        system_instruction: str | None = None,
        max_retries: int = 3,
    ) -> str:
        """Call Gemini with exponential backoff retry."""
        for attempt in range(max_retries):
            try:
                config = types.GenerateContentConfig(
                    temperature=0.2,
                    max_output_tokens=8192,
                    system_instruction=system_instruction,
                )
                response = self._client.models.generate_content(
                    model=self.model_name,
                    contents=prompt,
                    config=config,
                )
                return response.text or ""
            except Exception as e:
                if attempt == max_retries - 1:
                    logger.error(f"LLM call failed after {max_retries} attempts: {e}")
                    raise
                wait = 2 ** attempt
                logger.warning(f"LLM attempt {attempt + 1} failed: {e}. Retrying in {wait}s...")
                time.sleep(wait)
        raise RuntimeError("LLM call failed")

    def generate_text(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        model: str | None = None,
    ) -> str:
        return self._call_with_retry(
            prompt=user_prompt,
            system_instruction=system_prompt,
        )

    def generate_structured(
        self,
        *,
        system_prompt: str,
        user_prompt: str,
        output_schema: Type[T],
        model: str | None = None,
    ) -> T:
        """Generate structured JSON output validated against a Pydantic schema."""
        schema_json = json.dumps(output_schema.model_json_schema(), indent=2)
        full_system = f"{system_prompt}\n\nYou MUST return valid JSON matching this schema:\n{schema_json}"

        for attempt in range(3):
            try:
                config = types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=8192,
                    system_instruction=full_system,
                    response_mime_type="application/json",
                )
                response = self._client.models.generate_content(
                    model=model or self.model_name,
                    contents=user_prompt,
                    config=config,
                )
                raw = (response.text or "").strip()
                if raw.startswith("```"):
                    raw = raw.split("```")[1]
                    if raw.startswith("json"):
                        raw = raw[4:]
                raw = raw.strip().rstrip("```").strip()
                return output_schema.model_validate_json(raw)
            except Exception as e:
                if attempt == 2:
                    raise
                time.sleep(2 ** attempt)

        raise RuntimeError("Failed to generate structured response")


# Singleton instance — initialized lazily
_llm_client: LLMClient | None = None


def get_llm_client() -> LLMClient:
    global _llm_client
    if _llm_client is None:
        _llm_client = LLMClient()
    return _llm_client

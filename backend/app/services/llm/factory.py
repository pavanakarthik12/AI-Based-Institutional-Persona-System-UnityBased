from app.config import Settings
from app.services.llm.base import LLMProvider
from app.services.llm.gemini_provider import GeminiLLMProvider
from app.services.llm.groq_provider import GroqLLMProvider


def create_llm_provider(name: str, settings: Settings) -> LLMProvider:
    normalized = name.lower()
    if normalized == "groq":
        return GroqLLMProvider(settings)
    if normalized == "gemini":
        return GeminiLLMProvider(settings)
    raise ValueError(f"Unsupported LLM provider: {name}")

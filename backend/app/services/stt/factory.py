from app.config import Settings
from app.services.stt.base import STTProvider
from app.services.stt.groq_whisper_provider import GroqWhisperProvider


def create_stt_provider(name: str, settings: Settings) -> STTProvider:
    normalized = name.lower()
    if normalized == "groq_whisper":
        return GroqWhisperProvider(settings)
    raise ValueError(f"Unsupported STT provider: {name}")

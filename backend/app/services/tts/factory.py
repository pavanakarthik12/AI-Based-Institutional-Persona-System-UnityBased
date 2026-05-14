from app.config import Settings
from app.services.tts.base import TTSProvider
from app.services.tts.edge_tts_provider import EdgeTTSProvider
from app.services.tts.elevenlabs_provider import ElevenLabsTTSProvider


def create_tts_provider(name: str, settings: Settings) -> TTSProvider:
    normalized = name.lower()
    if normalized == "elevenlabs":
        return ElevenLabsTTSProvider(settings)
    if normalized == "edge_tts":
        return EdgeTTSProvider()
    raise ValueError(f"Unsupported TTS provider: {name}")

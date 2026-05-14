from app.core.errors import ProviderConfigurationError, ProviderRuntimeError
from app.services.persona_service import Persona
from app.services.tts.base import TTSProvider, TTSResult


class EdgeTTSProvider(TTSProvider):
    name = "edge_tts"

    def __init__(self, voice: str = "en-IN-NeerjaNeural"):
        self._voice = voice

    async def synthesize(self, text: str, persona: Persona) -> TTSResult:
        try:
            import edge_tts
        except ImportError as exc:
            raise ProviderConfigurationError("edge-tts package is required for Edge TTS fallback") from exc

        try:
            communicate = edge_tts.Communicate(text, voice=self._voice)
            chunks: list[bytes] = []
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    chunks.append(chunk["data"])
        except Exception as exc:
            raise ProviderRuntimeError(f"Edge TTS request failed: {exc}") from exc

        return TTSResult(
            audio=b"".join(chunks),
            provider=self.name,
            voice_id=self._voice,
            content_type="audio/mpeg",
        )

import httpx

from app.config import Settings
from app.core.errors import ProviderConfigurationError, ProviderRuntimeError
from app.services.stt.base import STTProvider, STTResult


class GroqWhisperProvider(STTProvider):
    name = "groq_whisper"

    def __init__(self, settings: Settings):
        self._api_key = settings.groq_api_key
        self._model = settings.groq_stt_model
        self._timeout = settings.request_timeout_seconds

    async def transcribe(self, audio: bytes, filename: str, content_type: str, language: str = "auto") -> STTResult:
        if not self._api_key:
            raise ProviderConfigurationError("GROQ_API_KEY is required for Groq Whisper STT")

        data = {"model": self._model, "response_format": "json"}
        if language and language != "auto":
            data["language"] = language

        files = {"file": (filename or "audio.webm", audio, content_type or "application/octet-stream")}
        headers = {"Authorization": f"Bearer {self._api_key}"}

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/audio/transcriptions",
                    data=data,
                    files=files,
                    headers=headers,
                )
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderRuntimeError(f"Groq Whisper request failed: {exc}") from exc

        payload = response.json()
        return STTResult(
            transcript=(payload.get("text") or "").strip(),
            language=payload.get("language") or language or "auto",
            provider=self.name,
        )

import httpx

from app.config import Settings
from app.core.errors import ProviderConfigurationError, ProviderRuntimeError
from app.services.persona_service import Persona
from app.services.tts.base import TTSProvider, TTSResult


class ElevenLabsTTSProvider(TTSProvider):
    name = "elevenlabs"

    def __init__(self, settings: Settings):
        self._api_key = settings.elevenlabs_api_key
        self._model_id = settings.elevenlabs_model_id
        self._output_format = settings.elevenlabs_output_format
        self._timeout = settings.request_timeout_seconds

    async def synthesize(self, text: str, persona: Persona) -> TTSResult:
        if not self._api_key:
            raise ProviderConfigurationError("ELEVENLABS_API_KEY is required for ElevenLabs TTS")
        if not persona.voice_id:
            raise ProviderConfigurationError(f"Persona '{persona.id}' does not define an ElevenLabs voice_id")

        endpoint = (
            f"https://api.elevenlabs.io/v1/text-to-speech/{persona.voice_id}"
            f"?output_format={self._output_format}"
        )
        payload = {
            "text": text,
            "model_id": self._model_id,
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
        }
        headers = {"xi-api-key": self._api_key, "Accept": "audio/mpeg"}

        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(endpoint, json=payload, headers=headers)
                response.raise_for_status()
        except httpx.HTTPError as exc:
            raise ProviderRuntimeError(f"ElevenLabs TTS request failed: {exc}") from exc

        return TTSResult(
            audio=response.content,
            provider=self.name,
            voice_id=persona.voice_id,
            content_type="audio/mpeg",
        )

from abc import ABC, abstractmethod
from collections.abc import AsyncIterator
from dataclasses import dataclass

from app.services.persona_service import Persona


@dataclass(slots=True)
class TTSResult:
    audio: bytes
    provider: str
    voice_id: str | None = None
    content_type: str = "audio/mpeg"
    fallback_used: bool = False


class TTSProvider(ABC):
    name: str

    @abstractmethod
    async def synthesize(self, text: str, persona: Persona) -> TTSResult:
        raise NotImplementedError

    async def stream(self, text: str, persona: Persona) -> AsyncIterator[bytes]:
        result = await self.synthesize(text, persona)
        yield result.audio

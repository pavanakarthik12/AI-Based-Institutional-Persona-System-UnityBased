from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(slots=True)
class STTResult:
    transcript: str
    language: str
    provider: str


class STTProvider(ABC):
    name: str

    @abstractmethod
    async def transcribe(self, audio: bytes, filename: str, content_type: str, language: str = "auto") -> STTResult:
        raise NotImplementedError

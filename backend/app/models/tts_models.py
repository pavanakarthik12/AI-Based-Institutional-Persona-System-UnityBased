from pydantic import BaseModel, Field


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1)
    persona: str | None = None


class TTSResponse(BaseModel):
    audio_url: str | None = None
    audio_base64: str | None = None
    provider: str
    voice_id: str | None = None
    content_type: str = "audio/mpeg"

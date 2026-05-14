from pydantic import BaseModel, Field

from app.models.common import Emotion, Gesture


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    persona: str | None = None
    language: str = "auto"


class ChatResponse(BaseModel):
    response: str
    persona: str
    provider: str
    emotion: Emotion
    gesture: Gesture

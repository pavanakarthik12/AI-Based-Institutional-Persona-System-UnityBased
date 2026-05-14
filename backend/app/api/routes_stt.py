from fastapi import APIRouter, Depends, File, Form, UploadFile

from app.api.deps import get_app_settings
from app.config import Settings
from app.core.errors import to_http_exception
from app.models.stt_models import STTResponse
from app.services.stt import create_stt_provider

router = APIRouter(tags=["speech-to-text"])


@router.post("/stt", response_model=STTResponse)
async def stt(
    audio_file: UploadFile = File(...),
    language: str = Form("auto"),
    settings: Settings = Depends(get_app_settings),
) -> STTResponse:
    try:
        audio = await audio_file.read()
        provider = create_stt_provider(settings.stt_provider, settings)
        result = await provider.transcribe(
            audio=audio,
            filename=audio_file.filename or "audio.webm",
            content_type=audio_file.content_type or "application/octet-stream",
            language=language,
        )
        return STTResponse(transcript=result.transcript, language=result.language, provider=result.provider)
    except Exception as exc:
        raise to_http_exception(exc) from exc

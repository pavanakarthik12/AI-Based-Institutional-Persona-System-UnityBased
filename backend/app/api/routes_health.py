from fastapi import APIRouter, Depends

from app.api.deps import get_app_settings, get_persona_service
from app.config import Settings
from app.services.persona_service import PersonaService

router = APIRouter(tags=["health"])


@router.get("/health")
async def health(
    settings: Settings = Depends(get_app_settings),
    persona_service: PersonaService = Depends(get_persona_service),
) -> dict:
    return {
        "status": "ok",
        "app": settings.app_name,
        "environment": settings.environment,
        "providers": {
            "llm": settings.llm_provider,
            "llm_fallback": settings.llm_fallback_provider,
            "stt": settings.stt_provider,
            "tts": settings.tts_provider,
            "tts_fallback": settings.tts_fallback_provider,
        },
        "personas": [persona.id for persona in persona_service.list_personas()],
    }

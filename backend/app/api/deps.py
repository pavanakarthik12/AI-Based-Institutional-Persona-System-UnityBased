from functools import lru_cache

from app.config import Settings, get_settings
from app.core.pipeline import AvatarPipeline
from app.services.persona_service import PersonaService


@lru_cache
def get_persona_service() -> PersonaService:
    return PersonaService(get_settings())


def get_pipeline() -> AvatarPipeline:
    return AvatarPipeline(get_settings(), get_persona_service())


def get_app_settings() -> Settings:
    return get_settings()

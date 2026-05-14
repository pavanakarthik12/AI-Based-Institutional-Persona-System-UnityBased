from fastapi import APIRouter, Depends

from app.api.deps import get_pipeline
from app.core.errors import to_http_exception
from app.core.pipeline import AvatarPipeline
from app.models.avatar_models import AvatarRespondRequest, AvatarRespondResponse

router = APIRouter(prefix="/avatar", tags=["avatar"])


@router.post("/respond", response_model=AvatarRespondResponse)
async def respond(
    request: AvatarRespondRequest,
    pipeline: AvatarPipeline = Depends(get_pipeline),
) -> AvatarRespondResponse:
    try:
        result = await pipeline.respond(
            message=request.message,
            persona_id=request.persona,
            language=request.language,
            include_audio=request.include_audio,
        )
        return AvatarRespondResponse.model_validate(result)
    except Exception as exc:
        raise to_http_exception(exc) from exc

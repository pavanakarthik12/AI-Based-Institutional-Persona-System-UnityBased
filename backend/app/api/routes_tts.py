from fastapi import APIRouter, Depends

from app.api.deps import get_pipeline
from app.core.errors import to_http_exception
from app.core.pipeline import AvatarPipeline
from app.models.tts_models import TTSRequest, TTSResponse

router = APIRouter(tags=["text-to-speech"])


@router.post("/tts", response_model=TTSResponse)
async def tts(request: TTSRequest, pipeline: AvatarPipeline = Depends(get_pipeline)) -> TTSResponse:
    try:
        return await pipeline.tts(request.text, request.persona)
    except Exception as exc:
        raise to_http_exception(exc) from exc

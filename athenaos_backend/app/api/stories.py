from fastapi import APIRouter, HTTPException
from ..models.story_models import StoryRequest, StoryResponse
from ..services.story_engine import generate_story

router = APIRouter()

@router.post("/generate", response_model=StoryResponse)
async def generate_story_endpoint(request: StoryRequest):
    try:
        story_data = await generate_story(request)
        return StoryResponse(
            status="success",
            request_id=request.request_id,
            data=story_data
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

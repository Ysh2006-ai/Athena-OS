from fastapi import APIRouter, HTTPException
from ..models.emotion_models import AnalyzeRequest, EmotionalTimelineResponse
from ..services.emotion_engine import process_match_emotion

router = APIRouter()

@router.post("/analyze", response_model=EmotionalTimelineResponse)
async def analyze_emotion_endpoint(request: AnalyzeRequest):
    try:
        timeline_response = await process_match_emotion(request.match_info, request.events)
        return timeline_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

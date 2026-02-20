from fastapi import APIRouter
from pydantic import BaseModel
from ..services.prediction_engine import predict_next_turn
from ..models.emotion_models import EmotionPoint
from typing import List

router = APIRouter()

class PredictionRequest(BaseModel):
    request_id: str
    current_timeline: List[EmotionPoint]

@router.post("/emotional-turn")
async def predict_turn(request: PredictionRequest):
    prediction = predict_next_turn(request.current_timeline)
    return {
        "status": "success",
        "request_id": request.request_id,
        "data": prediction
    }

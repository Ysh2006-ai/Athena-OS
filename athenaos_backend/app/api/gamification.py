from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import uuid
from ..utils.divergence import calculate_divergence

router = APIRouter()

class GamificationRequest(BaseModel):
    request_id: str
    timeline_summary: Optional[dict] = None

class Question(BaseModel):
    id: str
    text: str
    options: List[str]
    points: int = 50

class GamificationResponse(BaseModel):
    questions: List[dict]
    reward_points: int

class DivergenceResponse(BaseModel):
    divergence_score: float
    bias_label: str
    reasons: List[str]
    recent_triggers: List[dict]
    historical_accuracy: int

@router.post("/fan", response_model=dict)
async def get_fan_game(request: GamificationRequest):
    return {
        "data": {
            "questions": [
                {
                    "id": str(uuid.uuid4()),
                    "text": "Will the emotional intensity peak in this over?",
                    "options": ["Yes, huge spike!", "No, steady"],
                    "points": 50
                }
            ],
            "reward_points": 120
        }
    }

@router.get("/divergence", response_model=dict)
async def get_divergence_analysis():
    # Mocking live scores for demo
    ai_score = 0.42
    fan_score = 0.78
    
    analysis = calculate_divergence(ai_score, fan_score)
    
    return {"data": analysis}

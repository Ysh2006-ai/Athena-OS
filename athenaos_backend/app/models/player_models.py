from typing import List, Literal, Optional
from pydantic import BaseModel
from .emotion_models import EmotionPoint, MatchEvent

class PlayerEmotionProfile(BaseModel):
    player_name: str
    average_emotion_impact: float
    resilience_score: float  # Ability to bounce back from negative events
    pressure_performance: Literal["High", "Medium", "Low"]
    clutch_moment_count: int
    fan_favorite_score: float

class PlayerProfileRequest(BaseModel):
    request_id: str
    player_names: List[str]
    emotional_timeline: List[EmotionPoint]
    events: List[MatchEvent]

class PlayerProfileResponse(BaseModel):
    status: str
    request_id: str
    data: List[PlayerEmotionProfile]

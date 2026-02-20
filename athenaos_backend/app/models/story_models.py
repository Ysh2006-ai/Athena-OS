from typing import List, Literal, Optional
from pydantic import BaseModel
from .emotion_models import EmotionPoint, KeyMoments

class StoryRequest(BaseModel):
    request_id: str
    story_type: Literal["match_recap", "hero_journey", "comeback_arc", "upset_alert"]
    tone: Literal["emotional", "hype", "neutral", "hinglish", "poetic"]
    players_involved: List[str]
    timeline: List[EmotionPoint]
    key_moments: KeyMoments
    final_result: str
    current_timestamp: Optional[str] = None
    context_snapshot: Optional[str] = None

class StoryResponse(BaseModel):
    status: str
    request_id: str
    data: dict  # Contains 'story_text', 'highlight_players', 'title', 'moment_label', 'emotion_level', 'confidence', 'insights'

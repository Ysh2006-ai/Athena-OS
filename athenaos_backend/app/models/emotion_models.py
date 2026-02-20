from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, Field

# --- Core Match Models ---
class MatchContext(BaseModel):
    runs_needed: Optional[int] = None
    balls_remaining: Optional[int] = None
    wickets_left: Optional[int] = None
    innings: Optional[int] = None
    current_score: Optional[str] = None

class MatchEvent(BaseModel):
    timestamp: str 
    event_type: Literal["WICKET", "FOUR", "SIX", "DOT", "DROP_CATCH", "SINGLE", "WIDE", "NO_BALL", "BOUNDARY"]
    player: str
    bowler: Optional[str] = None
    commentary: str
    match_context: MatchContext

class MatchInfo(BaseModel):
    sport: str = "cricket"
    category: str = "women"
    teams: List[str]
    venue: str
    match_type: Literal["T20", "ODI", "Test"]

class AnalyzeRequest(BaseModel):
    request_id: str
    match_info: MatchInfo
    events: List[MatchEvent]

# --- Emotion Output Models ---
class EmotionPoint(BaseModel):
    timestamp: str
    emotion_score: float = Field(..., ge=-1.0, le=1.0)
    emotion_label: Literal["Euphoria", "High Positive", "Positive", "Neutral", "Tense", "Pressure", "High Pressure", "Heartbreak"]
    context_weight: float
    sentiment_raw: float

class KeyMoments(BaseModel):
    turning_point: Optional[EmotionPoint] = None
    collapse_moment: Optional[EmotionPoint] = None
    comeback_zone: Optional[EmotionPoint] = None
    highest_pressure: Optional[EmotionPoint] = None

class EmotionalTimelineResponse(BaseModel):
    timeline: List[EmotionPoint]
    key_moments: KeyMoments
    summary_stats: Dict[str, Any]

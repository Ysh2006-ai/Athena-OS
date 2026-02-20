from typing import List
from ..models.emotion_models import MatchInfo, MatchEvent, EmotionPoint, KeyMoments, EmotionalTimelineResponse
from ..utils.sentiment import analyze_sentiment
from ..utils.weighting import calculate_context_weight
from ..utils.normalizer import normalize_score

async def process_match_emotion(match_info: MatchInfo, events: List[MatchEvent]) -> EmotionalTimelineResponse:
    timeline: List[EmotionPoint] = []
    
    current_cumulative_emotion = 0.0
    
    highest_peak = -float('inf')
    lowest_dip = float('inf')
    peak_point = None
    dip_point = None
    
    for event in events:
        # 1. Sentiment
        sentiment = analyze_sentiment(event.commentary)
        
        # 2. Weighting
        weight = calculate_context_weight(event.match_context, event.event_type)
        
        # 3. Raw Score
        raw_score = sentiment * weight
        
        # 4. Normalize (Individual Event Impact)
        event_impact = normalize_score(raw_score, min_val=-2.0, max_val=2.0)
        
        # 5. Labeling
        label = "Neutral"
        if event_impact > 0.5: label = "Positive"
        if event_impact > 0.8: label = "Euphoria"
        if event_impact < -0.5: label = "Pressure"
        if event_impact < -0.8: label = "Heartbreak"
        if event.event_type == "WICKET" and sentiment < 0: label = "Heartbreak" # Wicket for batting team
        
        point = EmotionPoint(
            timestamp=event.timestamp,
            emotion_score=event_impact,
            emotion_label=label,
            context_weight=weight,
            sentiment_raw=sentiment
        )
        timeline.append(point)
        
        # Track Key Moments
        if event_impact > highest_peak:
            highest_peak = event_impact
            peak_point = point
            
        if event_impact < lowest_dip:
            lowest_dip = event_impact
            dip_point = point

    # Detect Turning Points (simplified: highest peak and lowest dip)
    key_moments = KeyMoments(
        turning_point=peak_point,
        collapse_moment=dip_point if dip_point and dip_point.emotion_score < -0.4 else None,
        comeback_zone=None # To be implemented with slope analysis
    )

    return EmotionalTimelineResponse(
        timeline=timeline,
        key_moments=key_moments,
        summary_stats={
            "peak_emotion": highest_peak,
            "lowest_emotion": lowest_dip,
            "event_count": len(events)
        }
    )

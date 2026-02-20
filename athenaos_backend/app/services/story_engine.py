from ..models.story_models import StoryRequest, StoryResponse

async def generate_story(request: StoryRequest) -> dict:
    """
    Generates a narrative based on the emotional timeline and key moments.
    Uses templates for MVP, structured for LLM replacement.
    """
    
    # 1. Determine Narrative Focus (Full Recap vs Specific Moment)
    arc = request.story_type
    tone = request.tone
    timestamp = request.current_timestamp
    
    # 2. Logic for Specific Moment (Emotion Replay Mode)
    if timestamp:
        # Find closest point
        point = next((p for p in request.timeline if p.timestamp == timestamp), None)
        emotion_score = point.emotion_score if point else 0.0
        
        # Derived Metrics
        moment_label = f"Over {timestamp}"
        emotion_level = "Neutral"
        if emotion_score > 0.6: emotion_level = "High Euphoria"
        elif emotion_score > 0.3: emotion_level = "Positive Momentum"
        elif emotion_score < -0.6: emotion_level = "Heartbreak"
        elif emotion_score < -0.3: emotion_level = "High Pressure"
        
        confidence = 0.86 # Mocked confidence from "model"
        
        # Narrative Generation (Mocking LLM output based on Prompt Template)
        story_text = ""
        context_str = request.context_snapshot or "Unknown context"
        
        if tone == "emotional":
            story_text = f"This moment defined the psychological battle. As the index hit {emotion_score:.2f}, the pressure in the stadium was palpable. {context_str} wasn't just a statistic; it was a test of character."
        elif tone == "analytical":
            story_text = f"At {timestamp}, the emotional index shifted to {emotion_score:.2f}. The primary driver was {context_str}, which altered the win probability and increased collapse risk by 15%."
        else:
            story_text = f"The game turned here at {timestamp}. With the score reading {context_str}, the energy changed completely."

        insights = [
            f"Emotional Index: {emotion_score:.2f}",
            "Crowd sentiment synchronized with player pressure",
            "Critical threshold crossed for collapse risk"
        ]

        return {
            "story_text": story_text,
            "highlight_players": request.players_involved,
            "title": f"Live Analysis: {moment_label}",
            "moment_label": moment_label,
            "emotion_level": emotion_level,
            "confidence": confidence,
            "insights": insights
        }

    # 3. Fallback to Full Recap (Existing Logic)
    peak = request.key_moments.turning_point
    peak_time = peak.timestamp if peak else "middle overs"
    
    story_text = f"In a match that defied expectations, the energy shifted decisively around {peak_time}. Final result: {request.final_result}."
    
    return {
        "story_text": story_text,
        "highlight_players": request.players_involved,
        "title": f"Match Recap: {arc.replace('_', ' ').title()}",
        "moment_label": "Full Match",
        "emotion_level": "Variable",
        "confidence": 0.95,
        "insights": ["Full match analysis complete", "Key turning points identified"]
    }

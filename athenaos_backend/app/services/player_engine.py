from typing import List, Dict
from ..models.player_models import PlayerEmotionProfile, PlayerProfileResponse
from ..models.emotion_models import MatchEvent, EmotionPoint

async def generate_player_profiles(player_names: List[str], events: List[object], timeline: List[EmotionPoint]) -> List[PlayerEmotionProfile]:
    # events: List[MatchEvent] - passed as object to avoid circular imports or strict typing issues during dev
    
    profiles = []
    
    for player in player_names:
        # Filter events for this player
        player_events = [e for i, e in enumerate(events) if e.player == player]
        
        if not player_events:
            # Default Profile for players with no data yet
            profiles.append(PlayerEmotionProfile(
                player_name=player,
                average_emotion_impact=0.0,
                resilience_score=0.5,
                pressure_performance="Medium",
                clutch_moment_count=0,
                fan_favorite_score=0.5
            ))
            continue
            
        # Calculate Impact
        # Correlate timestamps from events to timeline points
        impact_scores = []
        for e in player_events:
            # Find closest timeline point
            t_point = next((p for p in timeline if p.timestamp == e.timestamp), None)
            if t_point:
                impact_scores.append(abs(t_point.emotion_score))
            else:
                # Fallback: Estimate from Event Type
                etype = e.event_type
                if etype == "SIX": impact_scores.append(0.6)
                elif etype == "FOUR": impact_scores.append(0.4)
                elif etype == "WICKET": impact_scores.append(0.7)
                elif etype == "DOT": impact_scores.append(0.1)
                else: impact_scores.append(0.0)
                
        avg_impact = sum(impact_scores) / len(impact_scores) if impact_scores else 0.0
        
        # Resilience Calculation (Dynamic)
        # Higher impact events contribute to higher resilience
        resilience = 0.5 + (avg_impact * 0.4) 
        if resilience > 0.95: resilience = 0.99
        
        # Clutch Moment Count
        clutch_events = [e for e in player_events if e.event_type in ["FOUR", "SIX", "WICKET"]]
        clutch_count = len(clutch_events)

        # Fan Favorite Score (Dynamic)
        fan_score = 0.5 + (len(player_events) * 0.1) + (avg_impact * 0.2)
        if fan_score > 0.95: fan_score = 0.99

        # Pressure Performance
        pressure_perf = "Medium"
        if avg_impact > 0.6:
            pressure_perf = "High"
        elif avg_impact < 0.2:
            pressure_perf = "Low"
            
        profiles.append(PlayerEmotionProfile(
            player_name=player,
            average_emotion_impact=float(f"{avg_impact:.2f}"),
            resilience_score=float(f"{resilience:.2f}"),
            pressure_performance=pressure_perf,
            clutch_moment_count=clutch_count,
            fan_favorite_score=float(f"{fan_score:.2f}")
        ))
        
    return profiles

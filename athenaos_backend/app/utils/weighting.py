from ..models.emotion_models import MatchContext

def calculate_context_weight(context: MatchContext, event_type: str) -> float:
    """
    Calculates importance weight based on match context.
    Base weight is 1.0. High pressure = Higher weight.
    """
    weight = 1.0
    
    # Death Overs (T20: last 4 overs)
    if context.balls_remaining is not None and context.balls_remaining <= 24:
        weight += 0.5
        if context.balls_remaining <= 6:
            weight += 0.5  # Last over is highly emotional
            
    # Chase Pressure (Innings 2)
    if context.innings == 2:
        weight += 0.2
        if context.runs_needed is not None and context.balls_remaining is not None:
             if context.balls_remaining > 0:
                rrr = context.runs_needed / (context.balls_remaining / 6)
                if rrr > 10:
                    weight += 0.4
                elif rrr > 8:
                    weight += 0.2
    
    # Wickets Pressure
    if context.wickets_left is not None:
        if context.wickets_left <= 3:
            weight += 0.3
        if context.wickets_left <= 1:
            weight += 0.5

    # Event Significance
    if event_type == "WICKET":
        weight *= 1.5
    elif event_type in ["SIX", "FOUR"]:
        weight *= 1.2
    elif event_type == "DROP_CATCH":
        weight *= 1.3
        
    return weight

from typing import List, Dict
import random

def calculate_divergence(ai_score: float, fan_score: float) -> Dict:
    """
    Analyzes the difference between AI (Data) and Fan (Sentiment) scores.
    Includes randomization for demo purposes to show different states.
    """
    # Simulate dynamic fan variance for demo
    variance = random.uniform(-0.1, 0.1)
    fan_score += variance
    
    divergence = fan_score - ai_score
    magnitude = abs(divergence)
    
    bias_label = "Neutral"
    reasons = []
    
    # Dynamic Triggers based on Bias
    triggers = []
    
    if divergence > 0.2:
        bias_label = "Optimism Bias Detected"
        reasons = [
            "Fans reacting to last boundary",
            "AI weighting recent dot balls higher",
            "Required run rate still above threshold"
        ]
        triggers = [
            {"event": "Boundary", "impact": "Fan Optimism ↑"},
            {"event": "Dot Ball", "impact": "AI Concern ↑"},
            {"event": "Single", "impact": "Neutral"}
        ]
    elif divergence < -0.2:
        bias_label = "Pessimism Bias Detected"
        reasons = [
            "Crowd overreacting to wicket",
            "AI projects comeback based on depth",
            "Win probability stays stable"
        ]
        triggers = [
            {"event": "Wicket", "impact": "Fan Panic ↑"},
            {"event": "New Batter", "impact": "AI Neutral"},
            {"event": "Dot Ball", "impact": "Fan Tension ↑"}
        ]
    else:
        bias_label = "High Alignment"
        reasons = ["Both models tracking closely", "Steady match flow"]
        triggers = [
            {"event": "Single", "impact": "Neutral"},
            {"event": "Single", "impact": "Neutral"},
            {"event": "Dot Ball", "impact": "Neutral"}
        ]

    return {
        "divergence_score": round(divergence, 2),
        "bias_label": bias_label,
        "reasons": reasons,
        "recent_triggers": triggers,
        "historical_accuracy": 71 if magnitude > 0.3 else 89
    }

"""
AthenaOS Emotion Engine
Cricket-aware sentiment analysis, E(t) formula, pressure index,
momentum, collapse risk, batter cards, key moments, emotional phases.
"""

import math
import re
from typing import List, Dict, Any, Optional
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# ─── Cricket-Specific Lexicon ───────────────────────────────────────────────
CRICKET_POSITIVE = {
    "six": 3.5, "sixes": 3.5, "four": 2.5, "fours": 2.5,
    "boundary": 2.0, "boundaries": 2.0, "smashed": 3.0, "hammered": 3.0,
    "blasted": 3.0, "magnificent": 3.5, "brilliant": 3.5, "stunning": 3.5,
    "incredible": 3.5, "exceptional": 3.0, "outstanding": 3.0, "superb": 3.0,
    "glorious": 3.0, "spectacular": 3.5, "masterclass": 3.5, "century": 4.0,
    "fifty": 3.0, "milestone": 2.5, "record": 2.5, "champion": 3.0,
    "legend": 3.5, "hero": 3.0, "clutch": 3.0, "comeback": 3.5,
    "recovery": 2.5, "resilience": 3.0, "unstoppable": 3.5, "dominant": 2.5,
    "perfect": 3.0, "flawless": 3.0, "explosive": 3.0, "powerful": 2.5,
    "clinical": 2.5, "composed": 2.0, "controlled": 2.0, "confident": 2.0,
    "aggressive": 2.0, "attacking": 2.0, "pulled": 1.5, "driven": 1.5,
    "swept": 1.5, "hooked": 1.5, "lofted": 2.0, "cleared": 2.0,
    "dispatched": 2.0, "tonked": 2.5, "creamed": 2.5, "belted": 2.5,
    "win": 3.0, "won": 3.0, "victory": 3.5, "triumph": 3.5,
}

CRICKET_NEGATIVE = {
    "wicket": -3.0, "out": -2.5, "caught": -2.5, "bowled": -3.0,
    "lbw": -2.5, "stumped": -2.5, "runout": -2.5, "dismissed": -2.5,
    "collapse": -4.0, "collapsed": -4.0, "heartbreak": -3.5, "disaster": -3.5,
    "catastrophe": -4.0, "nightmare": -3.5, "terrible": -3.0, "awful": -3.0,
    "horrible": -3.0, "shocking": -2.5, "disappointing": -2.5, "struggling": -2.5,
    "pressure": -1.5, "crisis": -3.0, "trouble": -2.0, "danger": -2.0,
    "desperate": -2.5, "panic": -3.0, "nervous": -2.0, "anxious": -2.0,
    "dot": -0.5, "maiden": -1.0, "tight": -1.0, "squeeze": -1.5,
    "dropped": -2.0, "missed": -1.5, "fumbled": -1.5, "error": -2.0,
    "mistake": -2.0, "blunder": -2.5, "gone": -2.5, "heartbreaking": -3.5,
    "lost": -3.0, "defeat": -3.5, "loss": -3.0, "eliminated": -3.5,
}

DRAMATIC_PHRASES = [
    "last ball", "final ball", "last over", "super over", "do or die",
    "must win", "nerve", "nail-biting", "thriller", "dramatic",
    "unbelievable", "incredible scenes", "what a match", "legendary",
    "history", "record-breaking", "never seen before", "extraordinary",
    "against all odds", "from the jaws", "stunning comeback",
]

# ─── VADER Setup ────────────────────────────────────────────────────────────
_analyzer = SentimentIntensityAnalyzer()
_analyzer.lexicon.update(CRICKET_POSITIVE)
_analyzer.lexicon.update(CRICKET_NEGATIVE)


def _sentiment_score(text: str) -> float:
    """Returns compound sentiment score [-1, 1]."""
    scores = _analyzer.polarity_scores(text)
    compound = scores["compound"]
    # Boost for exclamations and caps
    excl_count = text.count("!")
    caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
    boost = min(excl_count * 0.05 + caps_ratio * 0.2, 0.3)
    return min(1.0, compound + boost)


def _has_drama(text: str) -> bool:
    text_lower = text.lower()
    return any(phrase in text_lower for phrase in DRAMATIC_PHRASES)


# ─── Pressure Index ──────────────────────────────────────────────────────────
def _pressure_index(
    runs_needed: int,
    balls_remaining: int,
    wickets_fallen: int,
    total_balls: int,
    ball_number: int,
) -> float:
    """
    Pressure Index (0 to 1):
    35% RRR pressure + 25% wickets (exponential) + 20% phase + 20% close match
    """
    # RRR pressure
    if balls_remaining > 0:
        rrr = (runs_needed / balls_remaining) * 6
        rrr_pressure = min(rrr / 15.0, 1.0)
    else:
        rrr_pressure = 1.0 if runs_needed > 0 else 0.0

    # Wickets pressure (exponential — losing 8 is WAY worse than 4)
    wicket_pressure = min((math.exp(wickets_fallen / 4.0) - 1) / (math.exp(10 / 4.0) - 1), 1.0)

    # Phase pressure (exponential increase in later overs)
    phase_ratio = ball_number / max(total_balls, 1)
    phase_pressure = phase_ratio ** 1.5

    # Close match factor (peaks when chase is ~50% complete)
    if runs_needed > 0 and balls_remaining > 0:
        chase_completion = 1.0 - (runs_needed / max(runs_needed + (ball_number * 1.0), 1))
        close_match = 1.0 - abs(chase_completion - 0.5) * 2
    else:
        close_match = 0.0

    pressure = (
        0.35 * rrr_pressure +
        0.25 * wicket_pressure +
        0.20 * phase_pressure +
        0.20 * close_match
    )
    return round(min(max(pressure, 0.0), 1.0), 4)


# ─── E(t) Formula ────────────────────────────────────────────────────────────
def _emotion_score(
    sentiment: float,
    pressure: float,
    momentum: float,
    ball_data: Dict,
    prev_ema: float,
    alpha: float = 0.3,
) -> float:
    """
    E(t) = 100 × (0.25·S + 0.40·P + 0.15·M + 0.20·S×P) × multipliers
    Then EMA smoothed with α=0.3
    S = normalized sentiment [0,1], P = pressure [0,1], M = momentum [0,1]
    """
    S = (sentiment + 1) / 2  # normalize [-1,1] → [0,1]
    P = pressure
    M = (momentum + 1) / 2   # normalize [-1,1] → [0,1]

    base = 100 * (0.25 * S + 0.40 * P + 0.15 * M + 0.20 * S * P)

    # Event multipliers
    multiplier = 1.0
    if ball_data.get("is_wicket"):
        multiplier *= 1.4
    if ball_data.get("is_six") and pressure > 0.6:
        multiplier *= 1.5
    elif ball_data.get("is_six"):
        multiplier *= 1.2
    if ball_data.get("is_four") and pressure > 0.7:
        multiplier *= 1.3
    elif ball_data.get("is_four"):
        multiplier *= 1.1
    if ball_data.get("is_drop"):
        multiplier *= 1.3
    if _has_drama(ball_data.get("text", "")):
        multiplier *= 1.15

    raw = min(base * multiplier, 100.0)

    # EMA smoothing
    ema = alpha * raw + (1 - alpha) * prev_ema
    return round(ema, 2)


# ─── Momentum ────────────────────────────────────────────────────────────────
def _compute_momentum(ball_history: List[Dict]) -> float:
    """
    Momentum [-1, +1] based on last 12 balls, weighted (recent = more weight).
    Positive = batting team momentum, Negative = bowling team momentum.
    """
    recent = ball_history[-12:]
    if not recent:
        return 0.0

    weights = list(range(1, len(recent) + 1))
    total_weight = sum(weights)
    weighted_sum = 0.0

    for i, ball in enumerate(recent):
        runs = ball.get("runs", 0)
        is_wicket = ball.get("is_wicket", False)
        # Batting score: runs - wicket penalty
        ball_score = runs / 6.0 - (1.0 if is_wicket else 0.0)
        weighted_sum += ball_score * weights[i]

    momentum = weighted_sum / total_weight
    return round(max(-1.0, min(1.0, momentum)), 4)


def _detect_momentum_shift(prev_momentum: float, curr_momentum: float) -> bool:
    """Shift detected when sign changes with magnitude > 0.4."""
    if prev_momentum == 0.0:
        return False
    sign_changed = (prev_momentum > 0) != (curr_momentum > 0)
    magnitude = abs(curr_momentum - prev_momentum)
    return sign_changed and magnitude > 0.4


# ─── Collapse Risk ────────────────────────────────────────────────────────────
def _collapse_risk(ball_history: List[Dict], pressure: float, rrr: float) -> Dict:
    """
    Collapse risk % with reasoning bullets.
    """
    risk = 10.0
    reasons = []

    # Recent wickets in last 3 overs (18 balls)
    recent_18 = ball_history[-18:]
    recent_wickets = sum(1 for b in recent_18 if b.get("is_wicket"))
    if recent_wickets >= 3:
        risk += 35
        reasons.append(f"{recent_wickets} wickets in last 3 overs")
    elif recent_wickets >= 2:
        risk += 20
        reasons.append(f"{recent_wickets} wickets in last 3 overs")

    # Dot ball percentage in last 18 balls
    recent_dots = sum(1 for b in recent_18 if b.get("is_dot"))
    dot_pct = recent_dots / max(len(recent_18), 1)
    if dot_pct > 0.5:
        risk += 15
        reasons.append(f"{int(dot_pct*100)}% dot balls recently")

    # Escalating pressure trend
    if pressure > 0.7:
        risk += 15
        reasons.append("Extreme pressure on batting side")
    elif pressure > 0.5:
        risk += 8
        reasons.append("High pressure building")

    # RRR
    if rrr > 12:
        risk += 15
        reasons.append(f"Required run rate {rrr:.1f} — near impossible")
    elif rrr > 9:
        risk += 8
        reasons.append(f"Required run rate {rrr:.1f} — very challenging")

    risk = min(risk, 95.0)

    if risk >= 70:
        level = "critical"
    elif risk >= 50:
        level = "high"
    elif risk >= 30:
        level = "medium"
    else:
        level = "low"

    if not reasons:
        reasons.append("Match situation relatively stable")

    return {
        "percentage": round(risk, 1),
        "level": level,
        "reasons": reasons[:4],
    }


# ─── Batter Cards ────────────────────────────────────────────────────────────
def _build_batter_cards(ball_history: List[Dict], emotion_history: List[float]) -> List[Dict]:
    """Build emotion cards for current batters."""
    batter_stats: Dict[str, Dict] = {}

    for i, ball in enumerate(ball_history):
        batter = ball.get("batter", "Unknown")
        if batter not in batter_stats:
            batter_stats[batter] = {
                "runs": 0, "balls": 0, "fours": 0, "sixes": 0, "dots": 0,
                "emotions": [], "high_pressure_balls": 0, "high_pressure_runs": 0,
            }
        s = batter_stats[batter]
        s["runs"] += ball.get("runs", 0)
        s["balls"] += 1
        s["fours"] += int(ball.get("is_four", False))
        s["sixes"] += int(ball.get("is_six", False))
        s["dots"] += int(ball.get("is_dot", False))
        if i < len(emotion_history):
            s["emotions"].append(emotion_history[i])

    # Find current batters (last 2 unique batters in recent balls)
    recent_batters = []
    for ball in reversed(ball_history):
        b = ball.get("batter", "")
        if b and b not in recent_batters:
            recent_batters.append(b)
        if len(recent_batters) >= 2:
            break

    cards = []
    for batter in recent_batters:
        if batter not in batter_stats:
            continue
        s = batter_stats[batter]
        balls = max(s["balls"], 1)
        sr = round(s["runs"] / balls * 100, 1)
        avg_emotion = round(sum(s["emotions"]) / max(len(s["emotions"]), 1), 1)
        peak_emotion = round(max(s["emotions"]) if s["emotions"] else 0, 1)

        # Resilience = SR under high pressure / overall SR
        # Simplified: use emotion variance as proxy
        if len(s["emotions"]) > 2:
            import statistics
            emotion_std = statistics.stdev(s["emotions"])
            resilience = max(0, min(100, 100 - emotion_std * 2))
        else:
            resilience = 50.0

        # Clutch rating
        if sr > 150 and s["sixes"] >= 2:
            clutch = "Elite Clutch"
        elif sr > 120:
            clutch = "Solid"
        elif sr > 90:
            clutch = "Fair"
        else:
            clutch = "Cold"

        # Emotional profile
        if avg_emotion > 70:
            profile = "On Fire"
        elif avg_emotion > 50:
            profile = "Intense"
        elif avg_emotion > 35:
            profile = "Steady"
        else:
            profile = "Ice Cold"

        cards.append({
            "name": batter,
            "runs": s["runs"],
            "balls": balls,
            "strike_rate": sr,
            "fours": s["fours"],
            "sixes": s["sixes"],
            "dots": s["dots"],
            "avg_emotion": avg_emotion,
            "peak_emotion": peak_emotion,
            "resilience": round(resilience, 1),
            "clutch_rating": clutch,
            "emotional_profile": profile,
        })

    return cards


# ─── Key Moments ─────────────────────────────────────────────────────────────
def _identify_key_moments(ball_data_list: List[Dict], emotion_scores: List[float]) -> List[Dict]:
    """Top 10 moments by E(t) score."""
    moments = []
    for i, (ball, score) in enumerate(zip(ball_data_list, emotion_scores)):
        event_type = "normal"
        if ball.get("is_wicket"):
            event_type = "wicket"
        elif ball.get("is_six"):
            event_type = "six"
        elif ball.get("is_four"):
            event_type = "boundary"
        elif ball.get("is_drop"):
            event_type = "drop"
        elif score > 70:
            event_type = "high_emotion"

        if event_type != "normal" or score > 65:
            moments.append({
                "ball_number": i + 1,
                "over": ball.get("over", 0),
                "ball_in_over": ball.get("ball", 0),
                "description": ball.get("text", ""),
                "emotion_score": score,
                "event_type": event_type,
                "batter": ball.get("batter", ""),
                "bowler": ball.get("bowler", ""),
            })

    # Sort by emotion score, take top 10
    moments.sort(key=lambda x: x["emotion_score"], reverse=True)
    return moments[:10]


# ─── Emotional Phases ────────────────────────────────────────────────────────
def _identify_phases(emotion_scores: List[float], ball_data_list: List[Dict]) -> List[Dict]:
    """Divide match into 4 emotional phases."""
    n = len(emotion_scores)
    if n == 0:
        return []

    quarter = max(n // 4, 1)
    phases_raw = [
        ("Calm Opening", 0, quarter),
        ("Building Tension", quarter, quarter * 2),
        ("High Intensity", quarter * 2, quarter * 3),
        ("Peak Emotion", quarter * 3, n),
    ]

    phases = []
    for name, start, end in phases_raw:
        chunk = emotion_scores[start:end]
        if not chunk:
            continue
        avg_et = round(sum(chunk) / len(chunk), 1)
        peak_et = round(max(chunk), 1)

        # Find key event in this phase
        key_event = ""
        for ball in ball_data_list[start:end]:
            if ball.get("is_wicket") or ball.get("is_six"):
                key_event = ball.get("text", "")[:80]
                break

        over_start = ball_data_list[start].get("over", 0) if start < len(ball_data_list) else 0
        over_end = ball_data_list[min(end - 1, len(ball_data_list) - 1)].get("over", 0)

        phases.append({
            "name": name,
            "over_start": over_start,
            "over_end": over_end,
            "avg_et": avg_et,
            "peak_et": peak_et,
            "key_event": key_event or "Steady play",
        })

    return phases


# ─── Over-by-Over Heatmap ────────────────────────────────────────────────────
def _over_heatmap(ball_data_list: List[Dict], emotion_scores: List[float], emotion_scores_bowling: List[float]) -> List[Dict]:
    """Aggregate emotion data per over (both perspectives)."""
    over_data: Dict[int, Dict] = {}

    for i, (ball, score, score_bowl) in enumerate(zip(ball_data_list, emotion_scores, emotion_scores_bowling)):
        over = ball.get("over", 1)
        if over not in over_data:
            over_data[over] = {"emotions": [], "emotions_bowl": [], "runs": 0, "wickets": 0}
        over_data[over]["emotions"].append(score)
        over_data[over]["emotions_bowl"].append(score_bowl)
        over_data[over]["runs"] += ball.get("runs", 0)
        over_data[over]["wickets"] += int(ball.get("is_wicket", False))

    heatmap = []
    for over_num in sorted(over_data.keys()):
        d = over_data[over_num]
        
        # Batting Stats
        emotions = d["emotions"]
        avg_emotion = round(sum(emotions) / len(emotions), 1)
        peak_emotion = round(max(emotions), 1)
        
        # Bowling Stats
        emotions_bowl = d["emotions_bowl"]
        avg_emotion_bowl = round(sum(emotions_bowl) / len(emotions_bowl), 1)
        peak_emotion_bowl = round(max(emotions_bowl), 1)

        def get_intensity(avg):
            if avg >= 70: return "extreme"
            elif avg >= 50: return "high"
            elif avg >= 30: return "medium"
            else: return "low"

        heatmap.append({
            "over": over_num,
            "avg_emotion": avg_emotion,
            "peak_emotion": peak_emotion,
            "avg_emotion_bowling": avg_emotion_bowl,
            "peak_emotion_bowling": peak_emotion_bowl,
            "runs": d["runs"],
            "wickets": d["wickets"],
            "intensity": get_intensity(avg_emotion),
            "intensity_bowling": get_intensity(avg_emotion_bowl),
        })

    return heatmap


# ─── Phase Label ─────────────────────────────────────────────────────────────
def _phase_label(score: float) -> str:
    if score >= 75:
        return "PEAK EMOTION"
    elif score >= 55:
        return "HIGH INTENSITY"
    elif score >= 35:
        return "BUILDING"
    else:
        return "CALM"


# ─── Main Analysis Function ───────────────────────────────────────────────────
def analyze_match(commentary: List[Dict], match_info: Dict) -> Dict:
    """
    Full match emotion analysis.
    Returns structured data for all dashboard components.
    """
    total_balls = match_info.get("total_balls", len(commentary))
    target = match_info.get("target", 0)

    ball_emotions: List[float] = []
    ball_emotions_bowling: List[float] = []
    ball_pressures: List[float] = []
    ball_momentums: List[float] = []
    ball_history: List[Dict] = []

    prev_ema = 20.0
    prev_ema_bowling = 20.0
    prev_momentum = 0.0
    wickets_fallen = 0
    runs_scored = 0
    momentum_shifts = []

    for i, ball in enumerate(commentary):
        # Track state
        if ball.get("is_wicket"):
            wickets_fallen += 1
        runs_scored += ball.get("runs", 0)

        # Compute runs needed and balls remaining
        runs_needed = max(target - runs_scored, 0)
        balls_remaining = max(total_balls - (i + 1), 0)
        rrr = (runs_needed / balls_remaining * 6) if balls_remaining > 0 else 0

        # Sentiment
        sentiment = _sentiment_score(ball.get("text", ""))

        # Pressure
        pressure = _pressure_index(
            runs_needed=runs_needed,
            balls_remaining=balls_remaining,
            wickets_fallen=wickets_fallen,
            total_balls=total_balls,
            ball_number=i + 1,
        )

        # Momentum
        ball_history.append(ball)
        momentum = _compute_momentum(ball_history)

        # Momentum shift detection
        if i > 0 and _detect_momentum_shift(prev_momentum, momentum):
            momentum_shifts.append({
                "ball_number": i + 1,
                "over": ball.get("over", 0),
                "from": round(prev_momentum, 2),
                "to": round(momentum, 2),
                "description": ball.get("text", "")[:80],
            })

        # E(t) - Batting
        emotion = _emotion_score(sentiment, pressure, momentum, ball, prev_ema)
        
        # E(t) - Bowling (Invert sentiment and momentum, keep pressure)
        # Note: Pressure component might need adjustment, but for now assuming "Game Pressure" applies to both
        emotion_bowling = _emotion_score(-sentiment, pressure, -momentum, ball, prev_ema_bowling)

        ball_emotions.append(emotion)
        ball_emotions_bowling.append(emotion_bowling)
        ball_pressures.append(pressure)
        ball_momentums.append(momentum)

        prev_ema = emotion
        prev_ema_bowling = emotion_bowling
        prev_momentum = momentum

    # Aggregate outputs
    avg_emotion = round(sum(ball_emotions) / max(len(ball_emotions), 1), 1)
    peak_emotion = round(max(ball_emotions) if ball_emotions else 0, 1)
    
    avg_emotion_bowling = round(sum(ball_emotions_bowling) / max(len(ball_emotions_bowling), 1), 1)
    peak_emotion_bowling = round(max(ball_emotions_bowling) if ball_emotions_bowling else 0, 1)

    avg_pressure = round(sum(ball_pressures) / max(len(ball_pressures), 1), 3)
    current_emotion = ball_emotions[-1] if ball_emotions else 0
    current_emotion_bowling = ball_emotions_bowling[-1] if ball_emotions_bowling else 0
    current_pressure = ball_pressures[-1] if ball_pressures else 0
    current_momentum = ball_momentums[-1] if ball_momentums else 0

    # Collapse risk (using last state)
    last_ball = commentary[-1] if commentary else {}
    runs_needed_final = max(target - runs_scored, 0)
    balls_remaining_final = max(total_balls - len(commentary), 0)
    rrr_final = (runs_needed_final / balls_remaining_final * 6) if balls_remaining_final > 0 else 0
    collapse = _collapse_risk(ball_history, current_pressure, rrr_final)

    # Batter cards
    batter_cards = _build_batter_cards(ball_history, ball_emotions)

    # Key moments (using batting emtion for now, or could combine max of both)
    key_moments = _identify_key_moments(commentary, ball_emotions)

    # Emotional phases
    phases = _identify_phases(ball_emotions, commentary)
    phases_bowling = _identify_phases(ball_emotions_bowling, commentary)

    # Over heatmap
    heatmap = _over_heatmap(commentary, ball_emotions, ball_emotions_bowling)

    # Current phase label
    current_phase = _phase_label(current_emotion)

    return {
        "match_info": match_info,
        "summary": {
            "avg_emotion": avg_emotion,
            "peak_emotion": peak_emotion,
            "avg_emotion_bowling": avg_emotion_bowling,
            "peak_emotion_bowling": peak_emotion_bowling,
            "avg_pressure": avg_pressure,
            "momentum_shifts": len(momentum_shifts),
            "total_balls": len(commentary),
            "wickets_fallen": wickets_fallen,
            "runs_scored": runs_scored,
        },
        "ball_by_ball": [
            {
                "ball_number": i + 1,
                "over": commentary[i].get("over", 0),
                "text": commentary[i].get("text", ""),
                "runs": commentary[i].get("runs", 0),
                "is_wicket": commentary[i].get("is_wicket", False),
                "is_four": commentary[i].get("is_four", False),
                "is_six": commentary[i].get("is_six", False),
                "batter": commentary[i].get("batter", ""),
                "bowler": commentary[i].get("bowler", ""),
                "emotion_score": ball_emotions[i],
                "emotion_score_bowling": ball_emotions_bowling[i],
                "pressure": ball_pressures[i],
                "momentum": ball_momentums[i],
                "phase": _phase_label(ball_emotions[i]),
            }
            for i in range(len(commentary))
        ],
        "current_state": {
            "emotion_score": round(current_emotion, 1),
            "emotion_score_bowling": round(current_emotion_bowling, 1),
            "pressure": round(current_pressure, 3),
            "momentum": round(current_momentum, 3),
            "phase": current_phase,
            "collapse_risk": collapse,
            "batter_cards": batter_cards,
        },
        "key_moments": key_moments,
        "emotional_phases": phases,
        "emotional_phases_bowling": phases_bowling,
        "heatmap": heatmap,
        "momentum_shifts": momentum_shifts, # Could also produce momentum_shifts_bowling
    }

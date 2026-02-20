"""
AthenaOS RAG Pipeline
In-memory knowledge base + sentence-transformers embeddings + Gemini 1.5 Flash
for chatbot and story generation.
"""

import os
import json
import numpy as np
from typing import List, Dict, Optional
try:
    from google import genai
    from google.genai import types as genai_types
    _GENAI_NEW = True
except ImportError:
    import google.generativeai as genai  # type: ignore
    _GENAI_NEW = False
from sentence_transformers import SentenceTransformer

# ─── Knowledge Base ───────────────────────────────────────────────────────────
KNOWLEDGE_BASE = [
    {
        "id": "et_formula",
        "title": "E(t) Emotion Formula",
        "content": """
The E(t) formula is AthenaOS's core emotional quantification engine.
E(t) = 100 × (0.25·S + 0.40·P + 0.15·M + 0.20·S×P) × event_multipliers
Where:
- S = Sentiment score [0,1] derived from VADER with cricket-specific lexicon
- P = Pressure Index [0,1] — weighted combination of RRR, wickets, phase, close-match factor
- M = Momentum [0,1] — last 12 balls weighted average
- S×P = Interaction term — captures how sentiment amplifies under pressure
Event multipliers: wicket=1.4x, six under pressure (P>0.6)=1.5x, four under pressure (P>0.7)=1.3x, dropped catch=1.3x, dramatic phrase=1.15x
Final output is EMA-smoothed with α=0.3 to prevent spike artifacts.
Score ranges: 0-35 = CALM, 35-55 = BUILDING, 55-75 = HIGH INTENSITY, 75-100 = PEAK EMOTION
""",
    },
    {
        "id": "pressure_index",
        "title": "Pressure Index Methodology",
        "content": """
The Pressure Index (0 to 1) quantifies the psychological burden on the batting team.
Components:
- 35% RRR Pressure: Required Run Rate / 15, capped at 1.0. A RRR of 15 = maximum pressure.
- 25% Wickets Pressure: Exponential function — losing 8 wickets is exponentially worse than 4.
  Formula: (exp(wickets/4) - 1) / (exp(10/4) - 1)
- 20% Phase Pressure: Exponential increase in later overs. (ball_number/total_balls)^1.5
- 20% Close Match Factor: Peaks when chase is ~50% complete. 1 - |completion - 0.5| × 2
Pressure levels: 0-0.25 = LOW, 0.25-0.5 = MODERATE, 0.5-0.75 = HIGH, 0.75-1.0 = EXTREME
""",
    },
    {
        "id": "resilience_metric",
        "title": "Resilience Metric Definition",
        "content": """
Resilience in AthenaOS measures a batter's ability to maintain performance under emotional pressure.
Resilience Score (0-100) = 100 - (emotion_standard_deviation × 2)
A high resilience score means the batter's emotional state remained consistent even as match pressure escalated.
Clutch Rating categories:
- Elite Clutch: SR > 150 with 2+ sixes — thrives under maximum pressure
- Solid: SR > 120 — reliable under pressure
- Fair: SR > 90 — slightly affected by pressure
- Cold: SR ≤ 90 — struggles under pressure
Emotional Profile categories:
- Ice Cold: avg_emotion ≤ 35 — unaffected, machine-like consistency
- Steady: avg_emotion 35-50 — controlled, professional
- Intense: avg_emotion 50-70 — engaged, competitive
- On Fire: avg_emotion > 70 — peak performance state
""",
    },
    {
        "id": "collapse_risk",
        "title": "Collapse Risk Algorithm",
        "content": """
Collapse Risk % predicts the probability of a batting collapse in the next 3 overs.
Base risk: 10%
Additions:
- 3+ wickets in last 3 overs: +35%
- 2 wickets in last 3 overs: +20%
- >50% dot balls in last 3 overs: +15%
- Pressure > 0.7 (extreme): +15%
- Pressure > 0.5 (high): +8%
- RRR > 12: +15%
- RRR > 9: +8%
Maximum cap: 95%
Risk levels: 0-30% = Low, 30-50% = Medium, 50-70% = High, 70-95% = Critical
""",
    },
    {
        "id": "harmanpreet_case_study",
        "title": "Harmanpreet Kaur — Case Study in Clutch Performance",
        "content": """
Harmanpreet Kaur's 171* against Australia in the 2018 ICC Women's World Cup semi-final is the defining case study for AthenaOS.
In that innings, Harmanpreet faced a collapsing team (India had lost wickets at regular intervals) and responded with an extraordinary display of controlled aggression.
AthenaOS analysis of that innings would show:
- Pressure Index peaked at 0.85+ in the middle overs
- E(t) scores consistently above 80 during her assault
- Resilience score: 94/100 — almost no variance in performance despite escalating pressure
- Clutch Rating: Elite Clutch — SR of 191 with 20 fours and 7 sixes
- Emotional Profile: On Fire — sustained peak emotion state for 115 balls
- Momentum shift: India's momentum went from -0.7 to +0.9 within 5 overs of her acceleration
This innings exemplifies how AthenaOS can identify and quantify the psychological turning point of a match.
""",
    },
    {
        "id": "wpl_context",
        "title": "Women's Premier League (WPL) Context",
        "content": """
The Women's Premier League (WPL) launched in 2023 is India's premier women's T20 franchise tournament.
Teams: Mumbai Indians Women, Delhi Capitals Women, Royal Challengers Bangalore Women, UP Warriorz, Gujarat Giants.
AthenaOS was built specifically for the WPL context — to help fans, coaches, and analysts understand the emotional narrative of women's cricket.
Key WPL emotional patterns observed:
- Death over pressure (overs 16-20) generates the highest E(t) scores
- Powerplay wickets have outsized psychological impact (pressure multiplier effect)
- Momentum shifts in WPL matches are more frequent than in bilateral series
- Harmanpreet Kaur (MI-W captain) consistently shows Elite Clutch ratings in pressure situations
The WPL represents a new era for women's cricket in India, and AthenaOS aims to give it the analytical depth it deserves.
""",
    },
    {
        "id": "momentum_theory",
        "title": "Momentum Theory in Cricket",
        "content": """
Momentum in AthenaOS is calculated as a weighted average of the last 12 balls' outcomes.
Formula: weighted_sum / total_weight where recent balls have higher weights (1 to 12).
Ball score = runs/6 - (1 if wicket else 0)
Momentum range: -1.0 (complete bowling dominance) to +1.0 (complete batting dominance)
Momentum shift is detected when: sign changes AND magnitude > 0.4
Psychological research shows momentum in cricket is real — teams that score 15+ in an over gain a psychological edge that affects the next 3 overs.
In women's cricket, momentum shifts tend to be more decisive — once a team gains momentum, they hold it longer on average.
""",
    },
    {
        "id": "affective_computing",
        "title": "Affective Computing Foundation",
        "content": """
AthenaOS is built on the principles of Affective Computing, pioneered by Rosalind Picard at MIT Media Lab (1997).
Affective Computing is the study and development of systems that can recognize, interpret, process, and simulate human emotions.
In sports analytics, affective computing enables:
- Quantification of psychological states from observable data (commentary, events)
- Real-time emotional tracking without biometric sensors
- Narrative generation that captures the human story behind statistics
AthenaOS applies affective computing to cricket by treating ball-by-ball commentary as an emotional signal stream.
The E(t) formula is our implementation of Picard's affect recognition framework adapted for cricket's unique emotional vocabulary.
Key insight: Cricket commentary is rich in emotional language — words like "magnificent", "disaster", "heartbreak" carry precise emotional valence that VADER (with cricket-specific lexicon) can quantify.
""",
    },
]


# ─── Embedding Model ──────────────────────────────────────────────────────────
_model: Optional[SentenceTransformer] = None
_embeddings: Optional[np.ndarray] = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def _get_embeddings() -> np.ndarray:
    global _embeddings
    if _embeddings is None:
        model = _get_model()
        texts = [f"{doc['title']}\n{doc['content']}" for doc in KNOWLEDGE_BASE]
        _embeddings = model.encode(texts, normalize_embeddings=True)
    return _embeddings


def _retrieve(query: str, top_k: int = 3) -> List[Dict]:
    """Cosine similarity retrieval."""
    model = _get_model()
    embeddings = _get_embeddings()
    query_emb = model.encode([query], normalize_embeddings=True)
    scores = np.dot(embeddings, query_emb.T).flatten()
    top_indices = np.argsort(scores)[::-1][:top_k]
    return [KNOWLEDGE_BASE[i] for i in top_indices]


# ─── Gemini Setup ─────────────────────────────────────────────────────────────
def _get_gemini():
    api_key = os.getenv("GEMINI_API_KEY", "")
    if not api_key:
        return None
    if _GENAI_NEW:
        return genai.Client(api_key=api_key)
    else:
        genai.configure(api_key=api_key)  # type: ignore
        return genai.GenerativeModel("gemini-1.5-flash")  # type: ignore


# ─── Chatbot ──────────────────────────────────────────────────────────────────
def chat(
    message: str,
    match_context: Optional[Dict] = None,
    history: Optional[List[Dict]] = None,
) -> str:
    """RAG-powered chatbot response."""
    # Retrieve relevant knowledge
    retrieved = _retrieve(message, top_k=3)
    knowledge_text = "\n\n".join(
        f"[{doc['title']}]\n{doc['content'].strip()}" for doc in retrieved
    )

    # Build match context string
    match_ctx = ""
    if match_context:
        info = match_context.get("match_info", {})
        summary = match_context.get("summary", {})
        current = match_context.get("current_state", {})
        match_ctx = f"""
Current Match: {info.get('title', 'Unknown')}
Teams: {info.get('team_batting', '')} vs {info.get('team_bowling', '')}
Venue: {info.get('venue', '')}
Current E(t): {current.get('emotion_score', 0)}
Current Pressure: {round(current.get('pressure', 0) * 100, 1)}%
Current Phase: {current.get('phase', 'Unknown')}
Collapse Risk: {current.get('collapse_risk', {}).get('percentage', 0)}%
Avg Emotion: {summary.get('avg_emotion', 0)}
Peak Emotion: {summary.get('peak_emotion', 0)}
Momentum Shifts: {summary.get('momentum_shifts', 0)}
"""

    system_prompt = f"""You are AthenaBot, the AI analyst for AthenaOS — an emotional intelligence platform for women's cricket.
You are data-grounded, cricket-savvy, and passionate about women's cricket.
Always cite specific numbers from the match data when available.
Be concise but insightful. Maximum 3 paragraphs.

KNOWLEDGE BASE:
{knowledge_text}

{f'CURRENT MATCH CONTEXT:{match_ctx}' if match_ctx else ''}

Answer the user's question using the knowledge base and match context above.
If you don't have enough data, say so honestly rather than making things up."""

    gemini = _get_gemini()
    if not gemini:
        return _fallback_response(message, match_context)

    try:
        if _GENAI_NEW:
            response = gemini.models.generate_content(
                model="gemini-2.0-flash",
                contents=f"{system_prompt}\n\nUser question: {message}",
                config=genai_types.GenerateContentConfig(
                    max_output_tokens=512, temperature=0.7
                ),
            )
            return response.text
        else:
            response = gemini.generate_content(
                [system_prompt, f"User question: {message}"],
                generation_config={"max_output_tokens": 512, "temperature": 0.7},
            )
            return response.text
    except Exception:
        return _fallback_response(message, match_context)


def _fallback_response(message: str, match_context: Optional[Dict]) -> str:
    """Fallback when Gemini is unavailable — keyword-aware responses."""
    msg_lower = message.lower()
    current = {}
    summary = {}
    if match_context:
        summary = match_context.get("summary", {})
        current = match_context.get("current_state", {})

    # ── Match-context aware answers ──────────────────────────────────────────
    if match_context:
        if any(w in msg_lower for w in ["pressure", "stress", "tense"]):
            p = round(current.get("pressure", 0) * 100, 1)
            level = "extreme" if p > 75 else "high" if p > 50 else "moderate" if p > 25 else "low"
            return (f"The current Pressure Index is **{p}%** ({level} level). "
                    f"This is calculated from required run rate, wickets fallen, match phase, and closeness of the match. "
                    f"A pressure above 75% signals batting collapse risk.")

        if any(w in msg_lower for w in ["emotion", "e(t)", "et ", "score", "intensity"]):
            et = current.get("emotion_score", 0)
            avg = summary.get("avg_emotion", 0)
            peak = summary.get("peak_emotion", 0)
            return (f"Current E(t) score is **{et}/100**. Match average: {avg}, peak: {peak}. "
                    f"E(t) combines sentiment (25%), pressure (40%), momentum (15%), and their interaction (20%). "
                    f"Scores above 75 indicate peak emotional intensity.")

        if any(w in msg_lower for w in ["collapse", "risk", "wicket"]):
            collapse = current.get("collapse_risk", {})
            pct = collapse.get("percentage", 0)
            lvl = collapse.get("level", "unknown")
            reasons = collapse.get("reasons", [])
            reason_str = "; ".join(reasons) if reasons else "no immediate triggers detected"
            return (f"Collapse risk is **{pct}%** ({lvl} level). Reasons: {reason_str}. "
                    f"Risk above 50% is considered high — this usually means rapid wicket loss in the last 3 overs.")

        if any(w in msg_lower for w in ["momentum", "shift", "turning point"]):
            shifts = summary.get("momentum_shifts", 0)
            mom = current.get("momentum", 0)
            direction = "batting advantage" if mom > 0 else "bowling advantage" if mom < 0 else "neutral"
            return (f"Current momentum: **{round(mom, 2)}** ({direction}). "
                    f"There have been **{shifts} momentum shifts** in this match. "
                    f"A shift is detected when momentum changes sign AND magnitude exceeds 0.4.")

    # ── General cricket/AthenaOS knowledge answers ──────────────────────────
    if any(w in msg_lower for w in ["e(t)", "formula", "emotion formula", "how is emotion"]):
        return ("E(t) = 100 × (0.25·S + 0.40·P + 0.15·M + 0.20·S×P) × event_multipliers. "
                "S=Sentiment, P=Pressure, M=Momentum. Event multipliers: wicket=1.4×, six under pressure=1.5×, four under pressure=1.3×. "
                "Results are EMA-smoothed. Ranges: 0-35 Calm, 35-55 Building, 55-75 High, 75-100 Peak.")

    if any(w in msg_lower for w in ["harmanpreet", "harman"]):
        return ("Harmanpreet Kaur's 171* vs Australia (2018 WWC semi-final) is AthenaOS's defining case study. "
                "Her resilience score was 94/100 with Elite Clutch rating (SR 191, 20 fours, 7 sixes). "
                "E(t) stayed above 80 throughout — she performed BETTER as pressure mounted. "
                "As MI-W captain in the WPL, she consistently shows Elite Clutch ratings in death overs.")

    if any(w in msg_lower for w in ["smriti", "mandhana", "smrithi"]):
        return ("Smriti Mandhana is one of women's cricket's most explosive openers. "
                "Her style generates high E(t) scores in powerplay overs with high momentum values. "
                "AthenaOS would typically classify her as 'On Fire' emotional profile with an Elite or Solid clutch rating. "
                "She's a key momentum-setter — early boundaries from Mandhana shift team momentum by up to +0.6 in the first 3 overs.")

    if any(w in msg_lower for w in ["shafali", "verma"]):
        return ("Shafali Verma is the youngest and most aggressive opener in women's cricket. "
                "Her batting generates the highest powerplay E(t) scores — often 80+ in the first 3 overs. "
                "AthenaOS profile: 'On Fire' emotional profile, Elite Clutch rating when in form. "
                "Her aggressive intent creates immediate momentum shifts (+0.7 to +0.9) when she connects.")

    if any(w in msg_lower for w in ["deepti", "sharma"]):
        return ("Deepti Sharma is a match-winner in both batting and bowling. "
                "As a bowler, her variations generate high Pressure Index readings for the batting side. "
                "As a batter, she has a Solid clutch rating — reliable and consistent under pressure. "
                "AthenaOS would classify her as 'Steady' emotional profile — calm, professional, rarely rattled.")

    if any(w in msg_lower for w in ["richa", "ghosh"]):
        return ("Richa Ghosh is one of India's most explosive wicketkeeper-batters in the lower order. "
                "Her role in AthenaOS analytics: death-over specialist, high strike rate generates momentum spikes. "
                "AthenaOS profile: 'Intense' to 'On Fire' emotional profile, Elite Clutch with sixes under pressure. "
                "Her six-hitting under pressure (P>0.6) applies a 1.5× event multiplier to E(t).")

    if any(w in msg_lower for w in ["beth", "mooney"]):
        return ("Beth Mooney is Australia's premier batter — one of the most consistent in world women's cricket. "
                "Her E(t) profile would show 'Ice Cold' to 'Steady' — unaffected by pressure, machine-like. "
                "Resilience score: typically 88-95/100. AthenaOS clutch rating: Elite. "
                "Mooney represents the ideal case of P(pressure) rising while E(t) variance stays low — pure composure.")

    if any(w in msg_lower for w in ["ellyse", "perry"]):
        return ("Ellyse Perry is the benchmark all-rounder in women's cricket. "
                "As a bowler she suppresses momentum (keeps batting E(t) low), as a batter she tops charts. "
                "AthenaOS would give her a Resilience score of 95+ — almost zero variance under any pressure. "
                "Her clutch rating: Elite — SR above 150 in pressure situations with consistent boundary hitting.")

    if any(w in msg_lower for w in ["player", "batter", "bowler", "batsman", "cricketer", "tell me about"]):
        return ("I can discuss player profiles based on AthenaOS metrics! "
                "Currently I have detailed profiles for: Harmanpreet Kaur, Smriti Mandhana, Shafali Verma, "
                "Deepti Sharma, Richa Ghosh, Beth Mooney, and Ellyse Perry. "
                "When Gemini AI is online, I can analyze ANY cricketer in depth. "
                "Try asking: 'Tell me about Shafali Verma' or 'How does Beth Mooney perform under pressure?'")

    if any(w in msg_lower for w in ["resilience", "clutch", "pressure player"]):
        return ("Resilience Score = 100 - (emotion_standard_deviation × 2). "
                "A high score means consistent performance regardless of pressure. "
                "Clutch ratings: Elite Clutch (SR>150 with 2+ sixes), Solid (SR>120), Fair (SR>90), Cold (SR≤90). "
                "Elite Clutch players actually improve as E(t) and Pressure rise.")

    if any(w in msg_lower for w in ["wpl", "women's premier", "women premier"]):
        return ("The WPL (Women's Premier League) launched in 2023 with 5 teams: MI-W, DC-W, RCB-W, UP Warriorz, Gujarat Giants. "
                "AthenaOS was built specifically for WPL — death overs (16-20) generate the highest E(t) scores in WPL matches. "
                "Powerplay wickets have outsized psychological impact. WPL momentum shifts are more frequent than bilateral series.")

    if any(w in msg_lower for w in ["pressure index", "how is pressure", "pressure formula"]):
        return ("Pressure Index (0-1): 35% RRR pressure (RRR/15), 25% wickets pressure (exponential), "
                "20% phase pressure (exponential, higher in death overs), 20% close match factor (peaks when chase is ~50% done). "
                "Levels: 0-0.25=Low, 0.25-0.5=Moderate, 0.5-0.75=High, 0.75-1.0=Extreme.")

    if any(w in msg_lower for w in ["momentum formula", "how is momentum", "momentum calc"]):
        return ("Momentum = weighted average of last 12 balls. Recent balls have higher weights (1 to 12). "
                "Ball score = runs/6 - (1 if wicket). Range: -1.0 (bowling dominance) to +1.0 (batting dominance). "
                "Research shows teams scoring 15+ in an over gain a psychological edge lasting ~3 overs.")

    if any(w in msg_lower for w in ["hello", "hi", "hey", "howdy", "what can you"]):
        return ("Hi! I'm AthenaBot 🏏 I can answer questions about:\n"
                "• E(t) emotion scores and what they mean\n"
                "• Pressure Index and collapse risk\n"
                "• Momentum shifts and turning points\n"
                "• Player resilience and clutch ratings\n"
                "• WPL context and player profiles (Harmanpreet, Mandhana, etc.)\n"
                "What would you like to know about the match?")

    # Generic fallback
    return ("I'm AthenaBot — I can analyze E(t) emotion scores, pressure indices, momentum shifts, "
            "player resilience, and WPL match context. Try asking: 'What is the current pressure?', "
            "'Explain the E(t) formula', or 'Tell me about Harmanpreet Kaur'!")


# ─── Story Generation ─────────────────────────────────────────────────────────
def generate_story(match_data: Dict) -> str:
    """Generate AI match narrative using Hero's Journey structure."""
    try:
        info = match_data.get("match_info", {})
        summary = match_data.get("summary", {})
        key_moments = match_data.get("key_moments", [])[:5]
        phases = match_data.get("emotional_phases", [])
        batter_cards = match_data.get("current_state", {}).get("batter_cards", [])

        # Build context
        moments_text = "\n".join(
            f"- Ball {m['ball_number']}: {m['description'][:100]} (E(t)={m['emotion_score']})"
            for m in key_moments
        )
        phases_text = "\n".join(
            f"- {p['name']} (Overs {p['over_start']}-{p['over_end']}): avg E(t)={p['avg_et']}, peak={p['peak_et']}"
            for p in phases
        )
        batters_text = "\n".join(
            f"- {b['name']}: {b['runs']} runs, SR {b['strike_rate']}, Clutch: {b['clutch_rating']}, Profile: {b['emotional_profile']}"
            for b in batter_cards
        )

        prompt = f"""Write a compelling cricket match narrative for:
Match: {info.get('title', 'Unknown Match')}
Teams: {info.get('team_batting', '')} vs {info.get('team_bowling', '')}
Venue: {info.get('venue', '')}

Emotional Summary:
- Average E(t): {summary.get('avg_emotion', 0)}/100
- Peak E(t): {summary.get('peak_emotion', 0)}/100
- Momentum Shifts: {summary.get('momentum_shifts', 0)}
- Total Balls: {summary.get('total_balls', 0)}

Key Moments:
{moments_text}

Emotional Phases:
{phases_text}

Key Players:
{batters_text}

Write a 3-paragraph narrative using the Hero's Journey structure:
1. The Setup (context, early drama, stakes)
2. The Ordeal (crisis point, collapse risk, turning point)
3. The Resolution (climax, emotional peak, outcome)

Use specific E(t) scores and player names. Make it feel like a sports broadcast story. Be vivid and emotional."""

        gemini = _get_gemini()
        if not gemini:
            return _fallback_story(info, summary, key_moments)

        if _GENAI_NEW:
            response = gemini.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    max_output_tokens=800, temperature=0.8
                ),
            )
        else:
            response = gemini.generate_content(
                prompt,
                generation_config={"max_output_tokens": 800, "temperature": 0.8},
            )
        return response.text
        
    except Exception:
        # If anything fails (API or data parsing), use fallback
        return _fallback_story(match_data.get("match_info", {}), match_data.get("summary", {}), match_data.get("key_moments", []))


def _fallback_story(info: Dict, summary: Dict, key_moments: List) -> str:
    title = info.get("title", "This match")
    avg = summary.get("avg_emotion", 0)
    peak = summary.get("peak_emotion", 0)
    top_moment = key_moments[0]["description"][:100] if key_moments else "a defining moment"

    return f"""{title} was a masterclass in emotional cricket. With an average emotional intensity of {avg}/100 and a peak of {peak}/100, this was far from an ordinary contest.

The match reached its crescendo when {top_moment}. The crowd, the players, and the data all told the same story — this was cricket at its most human.

AthenaOS recorded {summary.get('momentum_shifts', 0)} momentum shifts throughout the match, each one a psychological battle won or lost. In women's cricket, these moments matter — they define careers, inspire fans, and write history."""

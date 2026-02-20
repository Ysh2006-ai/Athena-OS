"""
AthenaOS Video Processor
Transcribes video/audio using OpenAI Whisper (tiny model) and converts
the transcript into structured ball-by-ball commentary.
"""

import os
import re
import tempfile
from typing import Dict, List


def _transcribe(audio_path: str) -> str:
    """Transcribe audio using Whisper tiny model."""
    try:
        import whisper
        model = whisper.load_model("tiny")
        result = model.transcribe(audio_path, language="en")
        return result.get("text", "")
    except ImportError:
        raise RuntimeError(
            "Whisper not installed. Run: pip install openai-whisper"
        )


def _transcript_to_commentary(transcript: str) -> List[Dict]:
    """
    Convert raw transcript text into structured ball-by-ball commentary.
    Splits on sentence boundaries and assigns ball numbers.
    """
    # Split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', transcript.strip())
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]

    commentary = []
    for i, sentence in enumerate(sentences):
        text_lower = sentence.lower()
        is_wicket = any(w in text_lower for w in ["out", "wicket", "caught", "bowled", "lbw", "stumped"])
        is_six = "six" in text_lower
        is_four = "four" in text_lower and not is_six
        is_dot = "dot" in text_lower or "no run" in text_lower

        runs = 0
        if is_six:
            runs = 6
        elif is_four:
            runs = 4
        elif not is_wicket and not is_dot:
            m = re.search(r'\b([1-3])\s*run', text_lower)
            if m:
                runs = int(m.group(1))

        commentary.append({
            "ball": i + 1,
            "over": (i // 6) + 1,
            "text": sentence,
            "runs": runs,
            "is_wicket": is_wicket,
            "is_four": is_four,
            "is_six": is_six,
            "is_dot": is_dot,
            "is_drop": "dropped" in text_lower,
            "is_noball": "no ball" in text_lower,
            "is_wide": "wide" in text_lower,
            "batter": "",
            "bowler": "",
        })

    return commentary


def process_video(content: bytes, filename: str) -> Dict:
    """
    Process uploaded video/audio file:
    1. Save to temp file
    2. Transcribe with Whisper
    3. Convert to commentary structure
    4. Return match data
    """
    suffix = os.path.splitext(filename)[1] or ".mp4"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        transcript = _transcribe(tmp_path)
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass

    commentary = _transcript_to_commentary(transcript)

    match_info = {
        "match_id": "video_upload",
        "title": f"Video Analysis: {filename}",
        "team_batting": "Batting Team",
        "team_bowling": "Bowling Team",
        "venue": "Unknown",
        "date": "",
        "format": "T20",
        "target": 0,
        "total_balls": len(commentary),
        "description": "Analyzed from uploaded video",
        "transcript": transcript[:500] + "..." if len(transcript) > 500 else transcript,
    }

    return {"match_info": match_info, "commentary": commentary}

"""
AthenaOS FastAPI Backend — Main Server
All endpoints for emotion analysis, chatbot, and story generation.
"""

import json
import os
from pathlib import Path
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.emotion_engine import analyze_match
from app.rag_pipeline import chat as rag_chat, generate_story

# ─── App Setup ────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AthenaOS API",
    version="2.0.0",
    description="Emotional Intelligence Platform for Women's Cricket",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Data Loading ─────────────────────────────────────────────────────────────
DATA_DIR = Path(__file__).parent / "data"
_match_cache: Dict[str, Dict] = {}


def _load_match(match_id: str) -> Dict:
    if match_id in _match_cache:
        return _match_cache[match_id]
    path = DATA_DIR / f"{match_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Match {match_id} not found")
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    _match_cache[match_id] = data
    return data


def _list_matches() -> List[Dict]:
    matches = []
    if DATA_DIR.exists():
        for path in sorted(DATA_DIR.glob("*.json")):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                info = data.get("match_info", {})
                matches.append({
                    "match_id": info.get("match_id", path.stem),
                    "title": info.get("title", "Unknown"),
                    "team_batting": info.get("team_batting", ""),
                    "team_bowling": info.get("team_bowling", ""),
                    "venue": info.get("venue", ""),
                    "date": info.get("date", ""),
                    "format": info.get("format", "T20"),
                    "description": info.get("description", ""),
                })
            except Exception:
                continue
    return matches


# In-memory analysis cache
_analysis_cache: Dict[str, Dict] = {}


# ─── Request/Response Models ──────────────────────────────────────────────────
class PreloadedRequest(BaseModel):
    match_id: str


class CommentaryRequest(BaseModel):
    commentary: List[Dict]
    match_info: Optional[Dict] = None


class URLRequest(BaseModel):
    url: str


class ChatRequest(BaseModel):
    message: str
    match_id: Optional[str] = None
    history: Optional[List[Dict]] = None


class StoryRequest(BaseModel):
    match_id: str


# ─── Endpoints ────────────────────────────────────────────────────────────────
@app.get("/health")
def health_check():
    return {"status": "ok", "project": "AthenaOS", "version": "2.0.0"}


@app.get("/matches")
def list_matches():
    """List all pre-loaded matches."""
    return {"matches": _list_matches()}


@app.post("/analyze/preloaded")
def analyze_preloaded(req: PreloadedRequest):
    """Analyze a pre-loaded match by ID."""
    # Check cache
    if req.match_id in _analysis_cache:
        return _analysis_cache[req.match_id]

    match_data = _load_match(req.match_id)
    commentary = match_data.get("commentary", [])
    match_info = match_data.get("match_info", {})

    if not commentary:
        raise HTTPException(status_code=400, detail="No commentary data found")

    result = analyze_match(commentary, match_info)
    _analysis_cache[req.match_id] = result
    return result


@app.post("/analyze/commentary")
def analyze_commentary(req: CommentaryRequest):
    """Analyze user-pasted commentary."""
    if not req.commentary:
        raise HTTPException(status_code=400, detail="No commentary provided")

    match_info = req.match_info or {
        "match_id": "custom",
        "title": "Custom Match Analysis",
        "team_batting": "Batting Team",
        "team_bowling": "Bowling Team",
        "venue": "Unknown",
        "format": "T20",
        "target": 0,
        "total_balls": len(req.commentary),
    }

    # Auto-detect target if not provided
    if match_info.get("target", 0) == 0:
        total_runs = sum(b.get("runs", 0) for b in req.commentary)
        match_info["target"] = total_runs + 1  # estimate

    result = analyze_match(req.commentary, match_info)
    return result


@app.post("/analyze/url")
def analyze_url(req: URLRequest):
    """Scrape ESPN URL and analyze."""
    try:
        from app.scraper import scrape_espn
        match_data = scrape_espn(req.url)
        result = analyze_match(match_data["commentary"], match_data["match_info"])
        return result
    except ImportError:
        raise HTTPException(status_code=501, detail="Scraper module not available")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")


@app.post("/analyze/video")
async def analyze_video(file: UploadFile = File(...)):
    """Process uploaded video/audio → Whisper transcription → analyze."""
    try:
        from app.video_processor import process_video
        content = await file.read()
        # 1. Transcribe video -> commentary + info
        raw_data = process_video(content, file.filename or "upload.mp4")
        
        # 2. Analyze the commentary -> full stats
        result = analyze_match(raw_data["commentary"], raw_data["match_info"])
        return result
    except ImportError:
        raise HTTPException(status_code=501, detail="Video processor not available")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process video: {str(e)}")


@app.post("/chat")
def chat_endpoint(req: ChatRequest):
    """RAG-powered chatbot."""
    match_context = None
    if req.match_id:
        if req.match_id in _analysis_cache:
            match_context = _analysis_cache[req.match_id]
        else:
            try:
                match_data = _load_match(req.match_id)
                match_context = analyze_match(
                    match_data.get("commentary", []),
                    match_data.get("match_info", {}),
                )
                _analysis_cache[req.match_id] = match_context
            except Exception:
                pass

    response = rag_chat(
        message=req.message,
        match_context=match_context,
        history=req.history or [],
    )
    return {"response": response, "match_id": req.match_id}


@app.post("/report/generate")
def generate_report(req: StoryRequest):
    """Generate AI story + full report data."""
    if req.match_id in _analysis_cache:
        match_data = _analysis_cache[req.match_id]
    else:
        raw = _load_match(req.match_id)
        match_data = analyze_match(raw.get("commentary", []), raw.get("match_info", {}))
        _analysis_cache[req.match_id] = match_data

    story = generate_story(match_data)
    return {
        "story": story,
        "match_data": match_data,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

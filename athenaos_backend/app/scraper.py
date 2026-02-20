"""
AthenaOS Scraper — ESPNcricinfo
Scrapes ball-by-ball commentary from ESPNcricinfo match pages.
"""

import re
import json
from typing import Dict, List, Optional
import requests
from requests.exceptions import RequestException

def _fetch_page(url: str) -> str:
    """
    Fetch page content using a session to maintain cookies.
    Visits the homepage first to mimic a real user flow.
    """
    session = requests.Session()
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }
    session.headers.update(headers)

    try:
        # 1. Visit homepage to get cookies
        session.get("https://www.espncricinfo.com/", timeout=10)
        
        # 2. Visit the actual match URL
        response = session.get(url, timeout=15)
        response.raise_for_status()
        return response.text
    except requests.HTTPError as e:
        if e.response.status_code == 403:
            raise ValueError("ESPNcricinfo blocked automated access (403). Please copy the commentary text and use the 'Paste' tab instead.")
        raise ValueError(f"Could not fetch URL: {e}")
    except RequestException as e:
        raise ValueError(f"Could not fetch URL: {e}")


def _parse_ball(text: str, ball_num: int) -> Dict:
    """Parse a single ball commentary text into structured data."""
    text_lower = text.lower()

    is_wicket = any(w in text_lower for w in ["out!", "wicket", "caught", "bowled", "lbw", "stumped", "run out"])
    is_six = "six" in text_lower or "sixes" in text_lower or "6!" in text
    is_four = ("four" in text_lower or "boundary" in text_lower or "4!" in text) and not is_six
    is_dot = "dot" in text_lower or (not is_wicket and not is_six and not is_four and "no run" in text_lower)
    is_wide = "wide" in text_lower
    is_noball = "no ball" in text_lower or "no-ball" in text_lower

    # Extract runs
    runs = 0
    if is_six:
        runs = 6
    elif is_four:
        runs = 4
    elif is_wide or is_noball:
        runs = 1
    elif is_wicket:
        runs = 0
    else:
        # Try to find run count in text
        for pattern in [r"\b([1-3])\s+run", r"takes?\s+([1-3])", r"([1-3])\s+more"]:
            m = re.search(pattern, text_lower)
            if m:
                runs = int(m.group(1))
                break

    # Extract over number
    over = (ball_num - 1) // 6 + 1

    return {
        "ball": ball_num,
        "over": over,
        "text": text.strip(),
        "runs": runs,
        "is_wicket": is_wicket,
        "is_four": is_four,
        "is_six": is_six,
        "is_dot": is_dot,
        "is_drop": "dropped" in text_lower or "drop" in text_lower,
        "is_noball": is_noball,
        "is_wide": is_wide,
        "batter": "",
        "bowler": "",
    }


def scrape_espn(url: str) -> Dict:
    """
    Scrape ESPNcricinfo match page for ball-by-ball commentary.
    Returns structured match data compatible with analyze_match().
    """
    html = _fetch_page(url)

    # Extract match title
    title_match = re.search(r'<title[^>]*>([^<]+)</title>', html)
    title = title_match.group(1).strip() if title_match else "ESPN Match"
    title = re.sub(r'\s*[-|]\s*ESPNcricinfo.*$', '', title).strip()

    # Extract commentary blocks
    # ESPNcricinfo uses various patterns; try multiple
    commentary_texts = []

    # Pattern 1: data-ball-commentary
    patterns = [
        r'class="[^"]*commentary-text[^"]*"[^>]*>([^<]+)</[^>]+>',
        r'"description"\s*:\s*"([^"]{20,300})"',
        r'<p[^>]*class="[^"]*ball-commentary[^"]*"[^>]*>([^<]+)</p>',
    ]

    for pattern in patterns:
        matches = re.findall(pattern, html)
        if len(matches) > 5:
            commentary_texts = matches
            break

    # Fallback: extract JSON data from page scripts
    if not commentary_texts:
        json_match = re.search(r'"commentaryList"\s*:\s*(\[.*?\])', html, re.DOTALL)
        if json_match:
            try:
                items = json.loads(json_match.group(1))
                commentary_texts = [
                    item.get("commentTextItems", [{}])[0].get("html", "")
                    for item in items
                    if item.get("commentTextItems")
                ]
            except Exception:
                pass

    if not commentary_texts:
        raise ValueError(
            "Could not extract commentary from this URL. "
            "Try pasting the commentary text directly instead."
        )

    # Clean HTML tags
    clean_texts = []
    for text in commentary_texts:
        clean = re.sub(r'<[^>]+>', '', text).strip()
        clean = re.sub(r'\s+', ' ', clean)
        if len(clean) > 15:
            clean_texts.append(clean)

    # Build commentary list
    commentary = [_parse_ball(text, i + 1) for i, text in enumerate(clean_texts)]

    # Build match info
    match_info = {
        "match_id": "scraped",
        "title": title,
        "team_batting": "Batting Team",
        "team_bowling": "Bowling Team",
        "venue": "Unknown",
        "date": "",
        "format": "T20",
        "target": 0,
        "total_balls": len(commentary),
        "description": f"Scraped from {url[:60]}",
    }

    return {"match_info": match_info, "commentary": commentary}

"""
AthenaOS v2 — Entry Point
Run this file to start the new AthenaOS emotion analytics API.
Usage: python run_athena.py
Or:    uvicorn app.new_main:app --reload --port 8000
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.new_main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )

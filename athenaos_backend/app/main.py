from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import logger
from app.api import emotion, players, stories, prediction, gamification

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

@app.get("/health")
def health_check():
    logger.info("Health check endpoint called")
    return {"status": "ok", "project": "AthenaOS"}

# Include Routers
app.include_router(emotion.router, prefix="/emotion", tags=["emotion"])
app.include_router(players.router, prefix="/players", tags=["players"])
app.include_router(stories.router, prefix="/stories", tags=["stories"])
app.include_router(prediction.router, prefix="/prediction", tags=["prediction"])
app.include_router(gamification.router, prefix="/gamification", tags=["gamification"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
